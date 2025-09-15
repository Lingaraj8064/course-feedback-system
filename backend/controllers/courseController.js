const Course = require('../models/Course');
const Feedback = require('../models/Feedback');

// @desc    Get all courses
// @route   GET /api/courses
// @access  Private
const getCourses = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Filter for active courses only for students
    const filter = req.user.role === 'admin' ? {} : { isActive: true };

    const total = await Course.countDocuments(filter);
    
    const courses = await Course.find(filter)
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    res.json({
      courses,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get courses error:', error);
    res.status(500).json({ message: 'Server error getting courses' });
  }
};

// @desc    Get single course
// @route   GET /api/courses/:id
// @access  Private
const getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Get course statistics if admin
    if (req.user.role === 'admin') {
      const feedbackStats = await Feedback.aggregate([
        { $match: { course: course._id } },
        {
          $group: {
            _id: null,
            totalFeedback: { $sum: 1 },
            avgRating: { $avg: '$rating' },
            ratingDistribution: {
              $push: '$rating'
            }
          }
        }
      ]);

      const stats = feedbackStats.length > 0 ? {
        totalFeedback: feedbackStats[0].totalFeedback,
        avgRating: Math.round(feedbackStats[0].avgRating * 100) / 100,
        ratingDistribution: feedbackStats[0].ratingDistribution.reduce((acc, rating) => {
          acc[rating] = (acc[rating] || 0) + 1;
          return acc;
        }, {})
      } : {
        totalFeedback: 0,
        avgRating: 0,
        ratingDistribution: {}
      };

      return res.json({
        course,
        stats
      });
    }

    res.json({ course });
  } catch (error) {
    console.error('Get course error:', error);
    res.status(500).json({ message: 'Server error getting course' });
  }
};

// @desc    Create course (Admin only)
// @route   POST /api/courses
// @access  Private/Admin
const createCourse = async (req, res) => {
  try {
    const { name, code, description, instructor, credits } = req.body;

    // Check if course with same name or code exists
    const existingCourse = await Course.findOne({
      $or: [
        { name: name },
        { code: code.toUpperCase() }
      ]
    });

    if (existingCourse) {
      return res.status(400).json({ 
        message: 'Course with this name or code already exists' 
      });
    }

    const course = await Course.create({
      name,
      code: code.toUpperCase(),
      description,
      instructor,
      credits
    });

    res.status(201).json({
      message: 'Course created successfully',
      course
    });
  } catch (error) {
    console.error('Create course error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error creating course' });
  }
};

// @desc    Update course (Admin only)
// @route   PUT /api/courses/:id
// @access  Private/Admin
const updateCourse = async (req, res) => {
  try {
    const { name, code, description, instructor, credits, isActive } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if another course has the same name or code
    if (name || code) {
      const existingCourse = await Course.findOne({
        _id: { $ne: req.params.id },
        $or: [
          ...(name ? [{ name }] : []),
          ...(code ? [{ code: code.toUpperCase() }] : [])
        ]
      });

      if (existingCourse) {
        return res.status(400).json({ 
          message: 'Another course with this name or code already exists' 
        });
      }
    }

    // Update fields
    if (name) course.name = name;
    if (code) course.code = code.toUpperCase();
    if (description !== undefined) course.description = description;
    if (instructor !== undefined) course.instructor = instructor;
    if (credits) course.credits = credits;
    if (isActive !== undefined) course.isActive = isActive;

    const updatedCourse = await course.save();

    res.json({
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    console.error('Update course error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error updating course' });
  }
};

// @desc    Delete course (Admin only)
// @route   DELETE /api/courses/:id
// @access  Private/Admin
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if course has feedback
    const feedbackCount = await Feedback.countDocuments({ course: req.params.id });

    if (feedbackCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete course. It has ${feedbackCount} feedback submissions. Consider deactivating instead.` 
      });
    }

    await Course.findByIdAndDelete(req.params.id);

    res.json({ message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({ message: 'Server error deleting course' });
  }
};

// @desc    Get courses with feedback stats (Admin only)
// @route   GET /api/courses/stats
// @access  Private/Admin
const getCoursesWithStats = async (req, res) => {
  try {
    const coursesWithStats = await Course.aggregate([
      {
        $lookup: {
          from: 'feedbacks',
          localField: '_id',
          foreignField: 'course',
          as: 'feedbacks'
        }
      },
      {
        $addFields: {
          feedbackCount: { $size: '$feedbacks' },
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: '$feedbacks' }, 0] },
              then: { $avg: '$feedbacks.rating' },
              else: 0
            }
          }
        }
      },
      {
        $project: {
          name: 1,
          code: 1,
          instructor: 1,
          credits: 1,
          isActive: 1,
          feedbackCount: 1,
          avgRating: { $round: ['$avgRating', 2] },
          createdAt: 1
        }
      },
      { $sort: { feedbackCount: -1 } }
    ]);

    res.json(coursesWithStats);
  } catch (error) {
    console.error('Get courses with stats error:', error);
    res.status(500).json({ message: 'Server error getting course statistics' });
  }
};

module.exports = {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
  getCoursesWithStats
};