const express = require('express');
const router = express.Router();
const {
  getProfile,
  updateProfile,
  uploadCV,
  uploadProfilePic,
  addDailyProgressLog,
  getMyProgressLogs,
  getStudentProgressLogs,
} = require('../controllers/studentController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');
const { uploadCV: cvUploader, uploadImage } = require('../middleware/upload');

// Student self routes
router.get('/profile', protect, requireRole('student'), getProfile);
router.put('/profile', protect, requireRole('student'), updateProfile);
router.post('/profile-picture', protect, requireRole('student'), uploadImage.single('image'), uploadProfilePic);
router.post('/cv', protect, requireRole('student'), cvUploader.single('cv'), uploadCV);
router.post('/logs', protect, requireRole('student'), addDailyProgressLog);
router.get('/logs', protect, requireRole('student'), getMyProgressLogs);

// Progress log inspection by Head, Supervisor, Employer, Admin
router.get('/:id/logs', protect, requireRole('head', 'supervisor', 'employer', 'admin'), getStudentProgressLogs);

module.exports = router;
