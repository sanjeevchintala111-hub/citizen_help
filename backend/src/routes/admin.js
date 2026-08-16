const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

function verifyAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Invalid token format.' });
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token.' });
    if (decoded.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
    req.admin = decoded;
    next();
  });
}

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'Invalid email or password.' });

    const admin = result.rows[0];
    const match = await bcrypt.compare(password, admin.password_hash);
    if (!match) return res.status(401).json({ error: 'Invalid email or password.' });

    const token = jwt.sign({ id: admin.id, email: admin.email, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Login successful', token, admin: { id: admin.id, name: admin.name, email: admin.email } });
  } catch (err) {
    console.error('Admin login error:', err.message);
    res.status(500).json({ error: 'Something went wrong during login.' });
  }
});

router.get('/officers', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, department, jurisdiction_state, is_verified, created_at FROM officers ORDER BY created_at DESC');
    res.json({ officers: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while fetching officers.' });
  }
});

router.patch('/officers/:id/verify', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { verified } = req.body;
    const result = await pool.query(
      'UPDATE officers SET is_verified = $1 WHERE id = $2 RETURNING id, name, email, is_verified',
      [verified, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Officer not found.' });
    res.json({ message: 'Officer verification updated', officer: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while updating officer.' });
  }
});

router.get('/directory', verifyAdmin, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM authority_directory ORDER BY jurisdiction_state, name');
    res.json({ authorities: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while fetching directory.' });
  }
});

router.post('/directory', verifyAdmin, async (req, res) => {
  try {
    const { name, department, jurisdiction_state, contact_number, email, verification_source } = req.body;
    if (!name || !department || !jurisdiction_state || !contact_number || !verification_source) {
      return res.status(400).json({ error: 'Name, department, jurisdiction state, contact number, and verification source are required.' });
    }
    const result = await pool.query(
      `INSERT INTO authority_directory (name, department, jurisdiction_state, contact_number, email, verification_source)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, department, jurisdiction_state, contact_number, email || null, verification_source]
    );
    res.status(201).json({ message: 'Authority added', authority: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while adding the authority.' });
  }
});

router.put('/directory/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, department, jurisdiction_state, contact_number, email, verification_source } = req.body;
    const result = await pool.query(
      `UPDATE authority_directory SET name=$1, department=$2, jurisdiction_state=$3, contact_number=$4, email=$5, verification_source=$6, verified_at=NOW()
       WHERE id=$7 RETURNING *`,
      [name, department, jurisdiction_state, contact_number, email || null, verification_source, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Authority not found.' });
    res.json({ message: 'Authority updated', authority: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while updating the authority.' });
  }
});

router.delete('/directory/:id', verifyAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM authority_directory WHERE id=$1 RETURNING id', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Authority not found.' });
    res.json({ message: 'Authority removed' });
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong while removing the authority.' });
  }
});

module.exports = router;
