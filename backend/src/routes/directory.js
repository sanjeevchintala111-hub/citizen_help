const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { state } = req.query;
    let result;

    if (state) {
      result = await pool.query(
        'SELECT id, name, department, jurisdiction_state, contact_number, email, verification_source, verified_at FROM authority_directory WHERE jurisdiction_state = $1 ORDER BY name',
        [state]
      );
    } else {
      result = await pool.query(
        'SELECT id, name, department, jurisdiction_state, contact_number, email, verification_source, verified_at FROM authority_directory ORDER BY jurisdiction_state, name'
      );
    }

    res.json({ authorities: result.rows });
  } catch (err) {
    console.error('Fetch directory error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching the directory.' });
  }
});

module.exports = router;
