const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, home_state, current_location, phone, emergency_contact } = req.body;

    if (!name || !email || !password || !home_state) {
      return res.status(400).json({ error: 'Name, email, password, and home state are required.' });
    }

    const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, home_state, current_location, phone, emergency_contact)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, name, email, home_state, created_at`,
      [name, email, password_hash, home_state, current_location, phone, emergency_contact]
    );

    res.status(201).json({ message: 'Registration successful', user: result.rows[0] });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
});

module.exports = router;
