const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  message: {
    type: String,
    required: [true, 'Feedback message is required'],
    trim: true,
    minLength: [10, 'Feedback message must be at least 10 characters'],
    maxLength: [1000, 'Feedback message cannot exceed 1000 characters']
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate feedback from same student for same course
feedbackSchema.index({ student: 1, course: 1 }, { unique: true });

// Index for better query performance
feedbackSchema.index({ course: 1, rating: 1 });
feedbackSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Feedback', feedbackSchema);