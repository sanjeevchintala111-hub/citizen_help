const express = require('express');
const pool = require('../config/db');
const verifyOfficer = require('../officerMiddleware');

const router = express.Router();

router.get('/complaints', verifyOfficer, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT c.id, c.category, c.description, c.incident_location, c.danger_flag, c.contact_phone, c.status, c.created_at,
              u.name AS citizen_name, u.email AS citizen_email, u.home_state
       FROM complaints c
       JOIN users u ON c.user_id = u.id
       WHERE u.home_state = $1
       ORDER BY c.danger_flag DESC, c.created_at DESC`,
      [req.officer.jurisdiction_state]
    );
    res.json({ complaints: result.rows });
  } catch (err) {
    console.error('Officer fetch complaints error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching complaints.' });
  }
});

const VALID_STATUSES = ['Submitted', 'Received', 'Under Review', 'Forwarded to Authority', 'Authority Contacted', 'Action in Progress', 'Resolved', 'Closed'];

router.patch('/complaints/:id/status', verifyOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status)) {
      return res.status(400).json({ error: `Status must be one of: ${VALID_STATUSES.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING id, category, status, updated_at`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Complaint not found.' });
    }

    res.json({ message: 'Status updated by officer', complaint: result.rows[0] });
  } catch (err) {
    console.error('Officer status update error:', err.message);
    res.status(500).json({ error: 'Something went wrong while updating status.' });
  }
});

router.get('/complaints/:id/evidence', verifyOfficer, async (req, res) => {
  try {
    const { id } = req.params;
    const supabase = require('../config/supabaseStorage');

    const evidenceResult = await pool.query(
      'SELECT id, file_url, file_type, file_name, uploaded_at FROM evidence WHERE complaint_id = $1',
      [id]
    );

    const filesWithLinks = await Promise.all(
      evidenceResult.rows.map(async (item) => {
        const { data, error } = await supabase.storage
          .from('evidence')
          .createSignedUrl(item.file_url, 300);
        return {
          id: item.id,
          file_type: item.file_type,
          file_name: item.file_name,
          uploaded_at: item.uploaded_at,
          signed_url: error ? null : data.signedUrl
        };
      })
    );

    res.json({ evidence: filesWithLinks });
  } catch (err) {
    console.error('Officer fetch evidence error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching evidence.' });
  }
});

module.exports = router;


