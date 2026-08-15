const jwt = require('jsonwebtoken');

function verifyOfficer(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided. Please log in.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Invalid token format.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token.' });
    }
    if (decoded.role !== 'officer') {
      return res.status(403).json({ error: 'Officer access required.' });
    }
    req.officer = decoded;
    next();
  });
}

module.exports = verifyOfficer;
