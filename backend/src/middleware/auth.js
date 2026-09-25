const jwt = require('jsonwebtoken');
const { User, University } = require('../models');
const { logSecurityEvent } = require('../utils/securityLogger');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'interlink_super_secure_jwt_secret_key_2026'
      );

      const user = await User.findByPk(decoded.id, {
        attributes: { exclude: ['password'] },
        include: [{ model: University, as: 'university' }],
      });

      if (!user) {
        return res.status(401).json({ message: 'User not found or deleted' });
      }

      // Security check: Reset sessions on password change
      if (user.passwordChangedAt) {
        const changedTimestamp = Math.floor(user.passwordChangedAt.getTime() / 1000);
        // If token was issued before the password was changed, reject it
        if (decoded.iat && decoded.iat < changedTimestamp) {
          logSecurityEvent({
            type: 'REVOKED_SESSION_USED',
            severity: 'WARN',
            ip: req.ip || req.connection?.remoteAddress,
            userId: user.id,
            email: user.email,
            details: 'Session rejected: JWT was issued before the last password change.',
          });
          return res.status(401).json({
            message: 'Session expired due to a recent password change. Please log in again.',
            code: 'SESSION_REVOKED_PASSWORD_CHANGED',
          });
        }
      }

      req.user = user;
      return next();
    } catch (error) {
      logSecurityEvent({
        type: 'INVALID_TOKEN_ATTEMPT',
        severity: 'WARN',
        ip: req.ip || req.connection?.remoteAddress,
        details: `Token verification failed: ${error.message}`,
      });
      return res.status(401).json({ message: 'Not authorized, token invalid or expired' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no authentication token provided' });
  }
};

module.exports = { protect };
