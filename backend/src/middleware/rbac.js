const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access restricted to roles [${roles.join(', ')}]. Your role is ${req.user.role}`,
      });
    }
    next();
  };
};

const requireApproved = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Not authenticated' });
  }
  // Admin and students are immediately active
  if (req.user.role === 'admin' || req.user.role === 'student') {
    return next();
  }
  if (req.user.status !== 'approved' && req.user.status !== 'active') {
    return res.status(403).json({
      message: `Action blocked: Your account status is '${req.user.status}'. Approval is required.`,
    });
  }
  next();
};

const enforceUniversityScope = (req, res, next) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });
  if (req.user.role === 'admin') return next(); // Admin has platform-wide access

  if (req.user.role === 'head' || req.user.role === 'supervisor') {
    if (!req.user.universityId) {
      return res.status(403).json({ message: 'No university assigned to your account' });
    }
    // inject universityId into request query/body filter
    req.scopedUniversityId = req.user.universityId;
    return next();
  }

  next();
};

module.exports = { requireRole, requireApproved, enforceUniversityScope };
