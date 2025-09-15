const express = require('express');
const {
  getProfile,
  updateProfile,
  changePassword,
  uploadAvatar
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { upload, handleMulterError } = require('../middleware/upload');
const {
  profileUpdateValidation,
  changePasswordValidation,
  handleValidationErrors
} = require('../utils/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', getProfile);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', profileUpdateValidation, handleValidationErrors, updateProfile);

// @route   PUT /api/users/change-password
// @desc    Change user password
// @access  Private
router.put('/change-password', changePasswordValidation, handleValidationErrors, changePassword);

// @route   POST /api/users/upload-avatar
// @desc    Upload profile picture
// @access  Private
router.post('/upload-avatar', upload.single('avatar'), handleMulterError, uploadAvatar);

module.exports = router;