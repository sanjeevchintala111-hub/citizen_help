const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, department, jurisdiction_state } = req.body;

    if (!name || !email || !password || !department || !jurisdiction_state) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    const existing = await pool.query('SELECT id FROM officers WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An officer account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO officers (name, email, password_hash, department, jurisdiction_state)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, department, jurisdiction_state, is_verified, created_at`,
      [name, email, password_hash, department, jurisdiction_state]
    );

    res.status(201).json({
      message: 'Officer account created. Awaiting verification before dashboard access is granted.',
      officer: result.rows[0]
    });
  } catch (err) {
    console.error('Officer registration error:', err.message);
    res.status(500).json({ error: 'Something went wrong during registration.' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM officers WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const officer = result.rows[0];
    const match = await bcrypt.compare(password, officer.password_hash);
    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!officer.is_verified) {
      return res.status(403).json({ error: 'Your officer account is pending verification. Contact the administrator.' });
    }

    const token = jwt.sign(
      { id: officer.id, email: officer.email, role: 'officer', jurisdiction_state: officer.jurisdiction_state },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      officer: { id: officer.id, name: officer.name, email: officer.email, department: officer.department, jurisdiction_state: officer.jurisdiction_state }
    });
  } catch (err) {
    console.error('Officer login error:', err.message);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, new_password } = req.body;
    if (!email || !new_password) {
      return res.status(400).json({ error: 'Email and new password are required.' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    const existing = await pool.query('SELECT id FROM officers WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'No officer account found with that email.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE officers SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('Officer password reset error:', err.message);
    res.status(500).json({ error: 'Something went wrong while resetting your password.' });
  }
});

module.exports = router;

