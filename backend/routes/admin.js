const express = require('express');
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const Course = require('../models/Course');
const { protect } = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

// All routes are protected and admin only
router.use(protect, admin);

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
router.get('/dashboard', async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalCourses = await Course.countDocuments();
    const totalFeedback = await Feedback.countDocuments();
    const blockedUsers = await User.countDocuments({ isBlocked: true });

    // Recent feedback (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentFeedback = await Feedback.countDocuments({
      createdAt: { $gte: sevenDaysAgo }
    });

    // Recent registrations (last 7 days)
    const recentRegistrations = await User.countDocuments({
      role: 'student',
      createdAt: { $gte: sevenDaysAgo }
    });

    // Average rating
    const avgRatingResult = await Feedback.aggregate([
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const avgRating = avgRatingResult.length > 0 ? avgRatingResult[0].avgRating : 0;

    // Top rated courses
    const topCourses = await Feedback.aggregate([
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
          avgRating: { $avg: '$rating' },
          feedbackCount: { $sum: 1 }
        }
      },
      { $match: { feedbackCount: { $gte: 3 } } },
      { $sort: { avgRating: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      totalStudents,
      totalCourses,
      totalFeedback,
      blockedUsers,
      recentFeedback,
      recentRegistrations,
      avgRating: Math.round(avgRating * 100) / 100,
      topCourses
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error getting dashboard statistics' });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { role: 'student' };
    
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    if (req.query.blocked) {
      filter.isBlocked = req.query.blocked === 'true';
    }

    const total = await User.countDocuments(filter);
    
    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get feedback count for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const feedbackCount = await Feedback.countDocuments({ student: user._id });
        return {
          ...user.toObject(),
          feedbackCount
        };
      })
    );

    res.json({
      users: usersWithStats,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error getting users' });
  }
});

// @desc    Toggle user block status
// @route   PUT /api/admin/users/:id/toggle-block
// @access  Private/Admin
router.put('/users/:id/toggle-block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot block admin users' });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
      message: `User ${user.isBlocked ? 'blocked' : 'unblocked'} successfully`,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked
      }
    });
  } catch (error) {
    console.error('Toggle block error:', error);
    res.status(500).json({ message: 'Server error updating user status' });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'Cannot delete admin users' });
    }

    // Delete user's feedback
    await Feedback.deleteMany({ student: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User and associated data deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Server error deleting user' });
  }
});

// @desc    Get user details with feedback
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's feedback with course details
    const feedback = await Feedback.find({ student: req.params.id })
      .populate('course', 'name code instructor')
      .sort({ createdAt: -1 });

    // Get user statistics
    const stats = {
      totalFeedback: feedback.length,
      avgRating: feedback.length > 0 
        ? Math.round((feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length) * 100) / 100 
        : 0,
      joinedDate: user.createdAt,
      lastFeedback: feedback.length > 0 ? feedback[0].createdAt : null
    };

    res.json({
      user,
      feedback,
      stats
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ message: 'Server error getting user details' });
  }
});

// @desc    Get system analytics
// @route   GET /api/admin/analytics
// @access  Private/Admin
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // User registration trends
    const userTrends = await User.aggregate([
      { 
        $match: { 
          role: 'student',
          createdAt: { $gte: startDate }
        }
      },
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

    // Feedback trends
    const feedbackTrends = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Course popularity
    const coursePopularity = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
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
          feedbackCount: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      { $sort: { feedbackCount: -1 } },
      { $limit: 10 }
    ]);

    // Rating distribution
    const ratingDistribution = await Feedback.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$rating',
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      userTrends,
      feedbackTrends,
      coursePopularity,
      ratingDistribution,
      period: days
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ message: 'Server error getting analytics' });
  }
});

module.exports = router;