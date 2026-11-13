const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

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

    if (!payload.email_verified) {
      return res.status(401).json({ error: 'Your Google email is not verified.' });
    }

    const result = await pool.query('SELECT * FROM officers WHERE LOWER(email) = LOWER($1)', [payload.email]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No officer account exists for this Google email. Register as an officer with the same email first.' });
    }

    const officer = result.rows[0];
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
    console.error('Officer Google sign-in error:', err.message);
    res.status(401).json({ error: 'Google sign-in failed. Please try again.' });
  }
});

module.exports = router;
