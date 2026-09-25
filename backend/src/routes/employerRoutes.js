const express = require('express');
const router = express.Router();
const {
  applyForJob,
  getMyApplications,
  getApplicantsForEmployer,
  reviewApplicant,
  getSuggestedStudents,
} = require('../controllers/employerController');
const { protect } = require('../middleware/auth');
const { requireRole, requireApproved } = require('../middleware/rbac');

// Student applying & viewing applications
router.post('/apply/:jobId', protect, requireRole('student'), applyForJob);
router.get('/my-applications', protect, requireRole('student'), getMyApplications);

// Employer applicant handling & student matching (requires approved account)
router.get('/applicants', protect, requireRole('employer'), requireApproved, getApplicantsForEmployer);
router.patch('/applicants/:id/status', protect, requireRole('employer'), requireApproved, reviewApplicant);
router.get('/suggested-students', protect, requireRole('employer'), requireApproved, getSuggestedStudents);

module.exports = router;
