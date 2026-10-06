const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const pool = require('../config/db');
const jwt = require('jsonwebtoken');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({ error: 'No Google credential provided.' });
    }

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    const email = payload.email;
    const name = payload.name;

    let result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      const insertResult = await pool.query(
        `INSERT INTO users (name, email, password_hash, home_state)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, email, home_state`,
        [name, email, 'google-oauth-no-password', 'Not set']
      );
      user = insertResult.rows[0];
    } else {
      user = result.rows[0];
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Signed in with Google successfully',
      token,
      user: { id: user.id, name: user.name, email: user.email, home_state: user.home_state },
      needsProfileSetup: result.rows.length === 0
    });
  } catch (err) {
    console.error('Google sign-in error:', err.message);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

module.exports = router;
