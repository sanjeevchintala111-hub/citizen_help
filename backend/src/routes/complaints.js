const express = require('express');
const pool = require('../config/db');
const verifyToken = require('../middleware');

const router = express.Router();

router.post('/', verifyToken, async (req, res) => {
  try {
    const { category, description, incident_location, incident_date, danger_flag, contact_phone } = req.body;
    const user_id = req.user.id;

    if (!category || !description) {
      return res.status(400).json({ error: 'Category and description are required.' });
    }

    const result = await pool.query(
      `INSERT INTO complaints (user_id, category, description, incident_location, incident_date, danger_flag, contact_phone)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, category, description, incident_location, danger_flag, contact_phone, status, created_at`,
      [user_id, category, description, incident_location, incident_date || null, danger_flag || false, contact_phone || null]
    );

    res.status(201).json({ message: 'Complaint submitted successfully', complaint: result.rows[0] });
  } catch (err) {
    console.error('Complaint submission error:', err.message);
    res.status(500).json({ error: 'Something went wrong while submitting the complaint.' });
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const user_id = req.user.id;
    const result = await pool.query(
      'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
      [user_id]
    );
    res.json({ complaints: result.rows });
  } catch (err) {
    console.error('Fetch complaints error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching complaints.' });
  }
});

const VALID_STATUSES = ['Submitted', 'Received', 'Under Review', 'Forwarded to Authority', 'Authority Contacted', 'Action in Progress', 'Resolved', 'Closed'];

router.patch('/:id/status', verifyToken, async (req, res) => {
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

    res.json({ message: 'Status updated successfully', complaint: result.rows[0] });
  } catch (err) {
    console.error('Status update error:', err.message);
    res.status(500).json({ error: 'Something went wrong while updating status.' });
  }
});

module.exports = router;
