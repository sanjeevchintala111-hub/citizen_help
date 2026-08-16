const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const supabase = require('../config/supabaseStorage');
const verifyToken = require('../middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', verifyToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, email, home_state, phone, village, current_location, profile_pic_url, created_at FROM users WHERE id = $1',
      [req.user.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found.' });
    res.json({ profile: result.rows[0] });
  } catch (err) {
    console.error('Fetch profile error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching your profile.' });
  }
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, phone, village, current_location, home_state } = req.body;
    const result = await pool.query(
      `UPDATE users SET name = COALESCE($1, name), phone = $2, village = $3, current_location = $4, home_state = COALESCE($5, home_state)
       WHERE id = $6
       RETURNING id, name, email, home_state, phone, village, current_location, profile_pic_url`,
      [name, phone || null, village || null, current_location || null, home_state, req.user.id]
    );
    res.json({ message: 'Profile updated successfully', profile: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err.message);
    res.status(500).json({ error: 'Something went wrong while updating your profile.' });
  }
});

router.post('/picture', verifyToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded.' });

    const fileName = 'user_' + req.user.id + '_' + Date.now() + '_' + req.file.originalname;

    const uploadResult = await supabase.storage
      .from('avatars')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype, upsert: true });

    if (uploadResult.error) {
      console.error('Avatar upload error:', uploadResult.error.message);
      return res.status(500).json({ error: 'Failed to upload profile picture.' });
    }

    const publicUrlResult = supabase.storage.from('avatars').getPublicUrl(fileName);
    const publicUrl = publicUrlResult.data.publicUrl;

    const result = await pool.query(
      'UPDATE users SET profile_pic_url = $1 WHERE id = $2 RETURNING id, profile_pic_url',
      [publicUrl, req.user.id]
    );

    res.json({ message: 'Profile picture updated', profile_pic_url: result.rows[0].profile_pic_url });
  } catch (err) {
    console.error('Profile picture error:', err.message);
    res.status(500).json({ error: 'Something went wrong while uploading your picture.' });
  }
});

module.exports = router;
