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
const { requireRole } = require('../middleware/rbac');

// Public endpoints
router.get('/master-list', getMasterUniversities);
router.get('/approved', getApprovedUniversities);

// University Head routes
router.get('/head/join-requests', protect, requireRole('head'), getJoinRequestsForHead);
router.patch('/head/join-requests/:id', protect, requireRole('head'), reviewJoinRequest);
router.get('/supervisors', protect, requireRole('head'), getUniversitySupervisors);

// University-scoped student roster (strictly scoped to own university)
router.get('/students', protect, requireRole('head', 'supervisor'), getUniversityStudents);

module.exports = router;
