const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = result.rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, name: user.name, email: user.email, home_state: user.home_state }
    });
  } catch (err) {
    console.error('Login error:', err.message);
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

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'No account found with that email.' });
    }

    const password_hash = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE email = $2', [password_hash, email]);

    res.json({ message: 'Password reset successfully. You can now sign in with your new password.' });
  } catch (err) {
    console.error('Password reset error:', err.message);
    res.status(500).json({ error: 'Something went wrong while resetting your password.' });
  }
});

module.exports = router;

