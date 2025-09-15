const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Course name is required'],
    unique: true,
    trim: true,
    maxLength: [100, 'Course name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxLength: [20, 'Course code cannot exceed 20 characters']
  },
  description: {
    type: String,
    maxLength: [500, 'Description cannot exceed 500 characters']
  },
  instructor: {
    type: String,
    maxLength: [100, 'Instructor name cannot exceed 100 characters']
  },
  credits: {
    type: Number,
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better search performance
courseSchema.index({ name: 1, code: 1 });

module.exports = mongoose.model('Course', courseSchema);