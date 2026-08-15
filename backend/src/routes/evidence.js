const express = require('express');
const multer = require('multer');
const pool = require('../config/db');
const supabase = require('../config/supabaseStorage');
const verifyToken = require('../middleware');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

router.post('/:complaintId', verifyToken, upload.single('file'), async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const complaintCheck = await pool.query(
      'SELECT id FROM complaints WHERE id = $1 AND user_id = $2',
      [complaintId, req.user.id]
    );
    if (complaintCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found or does not belong to you.' });
    }

    const fileName = `${req.user.id}/${Date.now()}_${req.file.originalname}`;

    const { data, error } = await supabase.storage
      .from('evidence')
      .upload(fileName, req.file.buffer, { contentType: req.file.mimetype });

    if (error) {
      console.error('Storage upload error:', error.message);
      return res.status(500).json({ error: 'Failed to upload file to storage.' });
    }

    const result = await pool.query(
      `INSERT INTO evidence (complaint_id, file_url, file_type, file_name)
       VALUES ($1, $2, $3, $4)
       RETURNING id, complaint_id, file_type, file_name, uploaded_at`,
      [complaintId, fileName, req.file.mimetype, req.file.originalname]
    );

    res.status(201).json({ message: 'Evidence uploaded successfully', evidence: result.rows[0] });
  } catch (err) {
    console.error('Evidence upload error:', err.message);
    res.status(500).json({ error: 'Something went wrong while uploading evidence.' });
  }
});

module.exports = router;
