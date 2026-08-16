const express = require('express');
const pool = require('../config/db');
const verifyToken = require('../middleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.rating, r.review_text, r.created_at, u.name AS citizen_name
       FROM reviews r
       JOIN users u ON r.user_id = u.id
       ORDER BY r.created_at DESC`
    );
    const avgResult = await pool.query('SELECT AVG(rating)::numeric(10,1) AS average, COUNT(*) AS total FROM reviews');
    res.json({
      reviews: result.rows,
      average_rating: avgResult.rows[0].average || 0,
      total_reviews: parseInt(avgResult.rows[0].total, 10)
    });
  } catch (err) {
    console.error('Fetch reviews error:', err.message);
    res.status(500).json({ error: 'Something went wrong while fetching reviews.' });
  }
});

router.post('/', verifyToken, async (req, res) => {
  try {
    const { rating, review_text } = req.body;
    const user_id = req.user.id;

    if (!rating || !review_text) {
      return res.status(400).json({ error: 'Rating and review text are required.' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
    }

    const result = await pool.query(
      `INSERT INTO reviews (user_id, rating, review_text) VALUES ($1, $2, $3) RETURNING id, rating, review_text, created_at`,
      [user_id, rating, review_text]
    );

    res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });
  } catch (err) {
    console.error('Submit review error:', err.message);
    res.status(500).json({ error: 'Something went wrong while submitting your review.' });
  }
});

module.exports = router;
