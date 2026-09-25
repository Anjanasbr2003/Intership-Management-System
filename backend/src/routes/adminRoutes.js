const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getPendingUniversities,
  reviewUniversity,
  getPendingEmployers,
  reviewEmployer,
  getAllUsers,
  removeUser,
  addUser,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { requireRole } = require('../middleware/rbac');

router.use(protect, requireRole('admin'));

router.get('/stats', getDashboardStats);
router.get('/universities/pending', getPendingUniversities);
router.patch('/universities/:id/status', reviewUniversity);
router.get('/employers/pending', getPendingEmployers);
router.patch('/employers/:id/status', reviewEmployer);
router.get('/users', getAllUsers);
router.post('/users', addUser);
router.delete('/users/:id', removeUser);

module.exports = router;
