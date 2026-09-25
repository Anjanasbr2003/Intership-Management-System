const express = require('express');
const router = express.Router();
const {
  getUniversityHeadInfo,
  sendJoinRequest,
  getMyJoinRequests,
} = require('../controllers/supervisorController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect, requireRole('supervisor'));

router.get('/head-info', getUniversityHeadInfo);
router.post('/join-request', sendJoinRequest);
router.get('/my-requests', getMyJoinRequests);

module.exports = router;
