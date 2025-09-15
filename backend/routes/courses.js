const express = require('express');
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesWithStats
} = require('../controllers/courseController');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');
const {
  courseValidation,
  handleValidationErrors
} = require('../utils/validation');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/courses
// @desc    Get all courses
// @access  Private
router.get('/', getCourses);

// @route   GET /api/courses/stats
// @desc    Get courses with statistics (Admin only)
// @access  Private/Admin
router.get('/stats', admin, getCoursesWithStats);

// @route   GET /api/courses/:id
// @desc    Get single course
// @access  Private
router.get('/:id', getCourse);

// Admin only routes
// @route   POST /api/courses
// @desc    Create course (Admin only)
// @access  Private/Admin
router.post('/', admin, courseValidation, handleValidationErrors, createCourse);

// @route   PUT /api/courses/:id
// @desc    Update course (Admin only)
// @access  Private/Admin
router.put('/:id', admin, updateCourse);

// @route   DELETE /api/courses/:id
// @desc    Delete course (Admin only)
// @access  Private/Admin
router.delete('/:id', admin, deleteCourse);

module.exports = router;