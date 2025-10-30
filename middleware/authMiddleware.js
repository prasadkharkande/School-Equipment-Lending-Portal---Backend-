// src/middleware/authMiddleware.js
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

exports.authenticate = async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) return res.status(401).json({ message: 'Missing token' });

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach user minimal info; optionally fetch fresh user from DB
    const user = await User.findByPk(decoded.id, { attributes: ['id', 'name', 'email', 'role'] });
    if (!user) return res.status(401).json({ message: 'Invalid token - user not found' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// role-based helper
exports.authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) return res.status(403).json({ message: 'Forbidden - insufficient role' });
    next();
  };
};
