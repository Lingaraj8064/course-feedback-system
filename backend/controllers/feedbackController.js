const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const User = require('../models/User');
const { Parser } = require('json2csv');

// @desc    Create feedback
// @route   POST /api/feedback
// @access  Private
const createFeedback = async (req, res) => {
  try {
    const { course, rating, message } = req.body;

    // Check if course exists
    const courseExists = await Course.findById(course);
    if (!courseExists) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user already submitted feedback for this course
    const existingFeedback = await Feedback.findOne({
      student: req.user.id,
      course: course
    });

    if (existingFeedback) {
      return res.status(400).json({ 
        message: 'You have already submitted feedback for this course' 
      });
    }

    const feedback = await Feedback.create({
      student: req.user.id,
      course,
      rating,
      message
    });

    const populatedFeedback = await Feedback.findById(feedback._id)
      .populate('course', 'name code')
      .populate('student', 'name email');

    res.status(201).json({
      message: 'Feedback submitted successfully',
      feedback: populatedFeedback
    });
  } catch (error) {
    console.error('Create feedback error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error creating feedback' });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback/my-feedback
// @access  Private
const getMyFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Feedback.countDocuments({ student: req.user.id });
    
    const feedback = await Feedback.find({ student: req.user.id })
      .populate('course', 'name code instructor')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      feedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get my feedback error:', error);
    res.status(500).json({ message: 'Server error getting feedback' });
  }
};

// @desc    Update feedback
// @route   PUT /api/feedback/:id
// @access  Private
const updateFeedback = async (req, res) => {
  try {
    const { rating, message } = req.body;

    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback
    if (feedback.student.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this feedback' });
    }

    // Update fields
    if (rating) feedback.rating = rating;
    if (message) feedback.message = message;

    const updatedFeedback = await feedback.save();
    
    const populatedFeedback = await Feedback.findById(updatedFeedback._id)
      .populate('course', 'name code instructor');

    res.json({
      message: 'Feedback updated successfully',
      feedback: populatedFeedback
    });
  } catch (error) {
    console.error('Update feedback error:', error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'Validation failed', errors });
    }
    res.status(500).json({ message: 'Server error updating feedback' });
  }
};

// @desc    Delete feedback
// @route   DELETE /api/feedback/:id
// @access  Private
const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ message: 'Feedback not found' });
    }

    // Check if user owns this feedback or is admin
    if (feedback.student.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this feedback' });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.json({ message: 'Feedback deleted successfully' });
  } catch (error) {
    console.error('Delete feedback error:', error);
    res.status(500).json({ message: 'Server error deleting feedback' });
  }
};

// @desc    Get all feedback (Admin only)
// @route   GET /api/feedback/all
// @access  Private/Admin
const getAllFeedback = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    let filter = {};
    
    if (req.query.course) {
      filter.course = req.query.course;
    }
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.student) {
      filter.student = req.query.student;
    }

    const total = await Feedback.countDocuments(filter);
    
    const feedback = await Feedback.find(filter)
      .populate('student', 'name email profilePicture')
      .populate('course', 'name code instructor credits')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(); // Use lean() for better performance

    // Filter out any feedback with missing references
    const validFeedback = feedback.filter(item => 
      item.student && item.course && item.student.name && item.course.name
    );

    res.json({
      feedback: validFeedback,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all feedback error:', error);
    res.status(500).json({ message: 'Server error getting feedback' });
  }
};

// @desc    Export feedback to CSV (Admin only)
// @route   GET /api/feedback/export
// @access  Private/Admin
const exportFeedback = async (req, res) => {
  try {
    // Build filter object
    let filter = {};
    
    if (req.query.course) {
      filter.course = req.query.course;
    }
    
    if (req.query.rating) {
      filter.rating = parseInt(req.query.rating);
    }
    
    if (req.query.student) {
      filter.student = req.query.student;
    }

    const feedback = await Feedback.find(filter)
      .populate('student', 'name email')
      .populate('course', 'name code instructor')
      .sort({ createdAt: -1 });

    // Transform data for CSV
    const csvData = feedback.map(item => ({
      'Student Name': item.student.name,
      'Student Email': item.student.email,
      'Course Name': item.course.name,
      'Course Code': item.course.code,
      'Instructor': item.course.instructor || 'N/A',
      'Rating': item.rating,
      'Message': item.message,
      'Submitted Date': item.createdAt.toISOString().split('T')[0]
    }));

    const fields = [
      'Student Name',
      'Student Email', 
      'Course Name',
      'Course Code',
      'Instructor',
      'Rating',
      'Message',
      'Submitted Date'
    ];

    const parser = new Parser({ fields });
    const csv = parser.parse(csvData);

    res.header('Content-Type', 'text/csv');
    res.attachment(`feedback-export-${new Date().toISOString().split('T')[0]}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export feedback error:', error);
    res.status(500).json({ message: 'Server error exporting feedback' });
  }
};

// @desc    Get feedback statistics
// @route   GET /api/feedback/stats
// @access  Private/Admin
const getFeedbackStats = async (req, res) => {
  try {
    // Total feedback count
    const totalFeedback = await Feedback.countDocuments();

    // Average rating
    const avgRatingResult = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Feedback by rating
    const feedbackByRating = await Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Feedback by course
    const feedbackByCourse = await Feedback.aggregate([
      {
        $lookup: {
          from: 'courses',
          localField: 'course',
          foreignField: '_id',
          as: 'courseInfo'
        }
      },
      { $unwind: '$courseInfo' },
      {
        $group: {
          _id: '$course',
          courseName: { $first: '$courseInfo.name' },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Recent feedback trends (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTrends = await Feedback.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      totalFeedback,
      avgRating: Math.round(avgRating * 100) / 100,
      feedbackByRating,
      feedbackByCourse,
      recentTrends
    });
  } catch (error) {
    console.error('Get feedback stats error:', error);
    res.status(500).json({ message: 'Server error getting feedback statistics' });
  }
};

module.exports = {
  createFeedback,
  getMyFeedback,
  updateFeedback,
  deleteFeedback,
  getAllFeedback,
  exportFeedback,
  getFeedbackStats
};