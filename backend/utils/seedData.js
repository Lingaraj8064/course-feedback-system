const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Course = require('../models/Course');
const Feedback = require('../models/Feedback');

const connectDB = require('../config/database');

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Course.deleteMany({});
    await Feedback.deleteMany({});

    // Create admin user with proper password hashing
    console.log('Creating admin user...');
    
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'Admin123!', // This will be hashed by the pre-save middleware
      role: 'admin'
    });
    
    await adminUser.save();
    console.log('Admin user created:', adminUser.email);

    // Create sample students
    console.log('Creating sample students...');
    const students = [];
    
    const studentData = [
      {
        name: 'John Doe',
        email: 'student@example.com',
        password: 'Student123!',
        role: 'student',
        phone: '1234567890',
        address: '123 Main St, City, State 12345'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'Student123!',
        role: 'student',
        phone: '9876543210',
        address: '456 Oak Ave, City, State 12345'
      },
      {
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'Student123!',
        role: 'student',
        phone: '5555555555',
        address: '789 Pine Rd, City, State 12345'
      }
    ];

    // Create students one by one to ensure proper password hashing
    for (const studentInfo of studentData) {
      const student = new User(studentInfo);
      await student.save();
      students.push(student);
    }

    console.log(`${students.length} students created successfully`);

    // Create sample courses
    console.log('Creating sample courses...');
    const courses = [
      {
        name: 'Computer Science Fundamentals',
        code: 'CS101',
        description: 'Introduction to programming concepts, algorithms, and data structures.',
        instructor: 'Dr. Alice Smith',
        credits: 3
      },
      {
        name: 'Data Structures and Algorithms',
        code: 'CS201',
        description: 'Advanced data structures, algorithm design and analysis.',
        instructor: 'Prof. Bob Johnson',
        credits: 4
      },
      {
        name: 'Web Development',
        code: 'CS301',
        description: 'Full-stack web development using modern technologies.',
        instructor: 'Dr. Carol Wilson',
        credits: 3
      },
      {
        name: 'Database Management Systems',
        code: 'CS401',
        description: 'Relational databases, SQL, and database design principles.',
        instructor: 'Prof. David Brown',
        credits: 3
      },
      {
        name: 'Software Engineering',
        code: 'CS501',
        description: 'Software development lifecycle, project management, and best practices.',
        instructor: 'Dr. Emily Davis',
        credits: 4
      }
    ];

    const createdCourses = await Course.insertMany(courses);
    console.log(`${createdCourses.length} courses created successfully`);

    // Create sample feedback
    console.log('Creating sample feedback...');
    const feedbackData = [
      {
        student: students[0]._id,
        course: createdCourses[0]._id,
        rating: 5,
        message: 'Excellent course! The instructor explained concepts very clearly and the assignments were challenging but fair.'
      },
      {
        student: students[1]._id,
        course: createdCourses[0]._id,
        rating: 4,
        message: 'Good introduction to computer science. Could use more practical examples.'
      },
      {
        student: students[0]._id,
        course: createdCourses[1]._id,
        rating: 4,
        message: 'Data structures are complex but the professor made it understandable. Great course overall.'
      },
      {
        student: students[2]._id,
        course: createdCourses[2]._id,
        rating: 5,
        message: 'Amazing web development course! Learned so much about modern frameworks and best practices.'
      },
      {
        student: students[1]._id,
        course: createdCourses[3]._id,
        rating: 3,
        message: 'Database concepts are important but the course was a bit dry. More interactive sessions would help.'
      },
      {
        student: students[2]._id,
        course: createdCourses[4]._id,
        rating: 5,
        message: 'Perfect blend of theory and practice. The software engineering principles will definitely help in my career.'
      }
    ];

    const createdFeedback = await Feedback.insertMany(feedbackData);
    console.log(`${createdFeedback.length} feedback entries created successfully`);

    console.log('\n=== SEED DATA COMPLETED ===');
    console.log('\nLogin Credentials:');
    console.log('Admin: admin@example.com / Admin123!');
    console.log('Student: student@example.com / Student123!');
    console.log('Student: jane@example.com / Student123!');
    console.log('Student: bob@example.com / Student123!');
    console.log('\nCourses created:', createdCourses.length);
    console.log('Students created:', students.length);
    console.log('Feedback entries:', createdFeedback.length);

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

// Run the seed function
seedData();