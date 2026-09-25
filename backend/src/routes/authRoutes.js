const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
  forgotPassword,
  resetPassword,
  uploadRegistrationImage,
  updateProfilePicture,
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { uploadImage } = require('../middleware/upload');

// Rate-limited authentication endpoints
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Image upload during registration (Public)
router.post('/upload-image', authLimiter, uploadImage.single('image'), uploadRegistrationImage);

// Profile picture upload / update for logged-in user accounts (Private)
router.post('/profile-picture', protect, uploadImage.single('image'), updateProfilePicture);

// Rate-limited password reset endpoints (12. Rate limit password resets)
router.post('/forgot-password', passwordResetLimiter, forgotPassword);
router.post('/reset-password', passwordResetLimiter, resetPassword);

// Password update with session revocation (3. Reset sessions on password change)
router.put('/update-password', protect, updatePassword);

// Profile
router.get('/me', protect, getMe);

module.exports = router;

