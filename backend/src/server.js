const express = require('express');
const cors = require('cors');
require('dotenv').config();
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const directoryRoutes = require('./routes/directory');
const evidenceRoutes = require('./routes/evidence');
const officerAuthRoutes = require('./routes/officerAuth');
const officerDashboardRoutes = require('./routes/officerDashboard');
const reviewRoutes = require('./routes/reviews');
const profileRoutes = require('./routes/profile');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/directory', directoryRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/officer', officerAuthRoutes);
app.use('/api/officer/dashboard', officerDashboardRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/profile', profileRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


