const express = require('express');
const router = express.Router();
const {
  getMasterUniversities,
  getApprovedUniversities,
  getJoinRequestsForHead,
  reviewJoinRequest,
  getUniversityStudents,
  getUniversitySupervisors,
} = require('../controllers/universityController');
const { protect } = require('../middleware/auth');
const { requireRole, requireApproved } = require('../middleware/rbac');

// Public endpoints
router.get('/master-list', getMasterUniversities);
router.get('/approved', getApprovedUniversities);

// University Head routes (requires approved institutional head)
router.get('/head/join-requests', protect, requireRole('head'), requireApproved, getJoinRequestsForHead);
router.patch('/head/join-requests/:id', protect, requireRole('head'), requireApproved, reviewJoinRequest);
router.get('/supervisors', protect, requireRole('head'), requireApproved, getUniversitySupervisors);

// University-scoped student roster (strictly scoped to approved head or approved supervisor)
router.get('/students', protect, requireRole('head', 'supervisor'), requireApproved, getUniversityStudents);

module.exports = router;
