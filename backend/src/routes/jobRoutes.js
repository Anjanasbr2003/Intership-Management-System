const express = require('express');
const router = express.Router();
const { createJob, getAllJobs, getEmployerJobs } = require('../controllers/jobController');
const { protect } = require('../middleware/auth');
const { requireRole, requireApproved } = require('../middleware/rbac');

// Open to all authenticated users
router.get('/', protect, getAllJobs);

// Employer specific job posting
router.post('/', protect, requireRole('employer'), requireApproved, createJob);
router.get('/employer/my-jobs', protect, requireRole('employer'), getEmployerJobs);

module.exports = router;
