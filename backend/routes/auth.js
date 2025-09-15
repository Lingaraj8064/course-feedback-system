const express = require('express');
const { 
  register, 
  login, 
  adminLogin, 
  getMe 
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  handleValidationErrors
} = require('../utils/validation');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', registerValidation, handleValidationErrors, register);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, handleValidationErrors, login);

// @route   POST /api/auth/admin-login
// @desc    Admin login
// @access  Public
router.post('/admin-login', loginValidation, handleValidationErrors, adminLogin);

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, getMe);

module.exports = router;