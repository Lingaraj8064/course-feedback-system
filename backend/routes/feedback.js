const express = require('express');
const {
  createFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getAllFeedback,
  exportFeedback,
  getFeedbackStats
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  feedbackValidation,
  handleValidationErrors
} = require('../utils/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/feedback
// @desc    Create feedback
// @access  Private
router.post('/', feedbackValidation, handleValidationErrors, createFeedback);

// @route   GET /api/feedback/my-feedback
// @desc    Get user's feedback
// @access  Private
router.get('/my-feedback', getMyFeedback);

// @route   PUT /api/feedback/:id
// @desc    Update feedback
// @access  Private
router.put('/:id', feedbackValidation, handleValidationErrors, updateFeedback);

// @route   DELETE /api/feedback/:id
// @desc    Delete feedback
// @access  Private
router.delete('/:id', deleteFeedback);

// Admin only routes
// @route   GET /api/feedback/all
// @desc    Get all feedback (Admin only)
// @access  Private/Admin
router.get('/all', admin, getAllFeedback);

// @route   GET /api/feedback/export
// @desc    Export feedback to CSV (Admin only)
// @access  Private/Admin
router.get('/export', admin, exportFeedback);

// @route   GET /api/feedback/stats
// @desc    Get feedback statistics (Admin only)
// @access  Private/Admin
router.get('/stats', admin, getFeedbackStats);

module.exports = router;