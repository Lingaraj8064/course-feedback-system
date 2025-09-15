const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const connectDB = require('./config/database');

const testUsers = async () => {
  try {
    console.log('🔍 Connecting to database...');
    await connectDB();

    // Check if users exist
    const allUsers = await User.find({});
    console.log('\n📊 Users in database:', allUsers.length);
    
    allUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - Role: ${user.role} - Blocked: ${user.isBlocked}`);
    });

    // Test admin user specifically
    const admin = await User.findOne({ email: 'admin@example.com' });
    console.log('\n👑 Admin user:', admin ? 'EXISTS' : 'NOT FOUND');
    
    if (admin) {
      console.log('Admin details:', {
        name: admin.name,
        email: admin.email,
        role: admin.role,
        isBlocked: admin.isBlocked,
        hasPassword: !!admin.password
      });
    }

    // Test student user
    const student = await User.findOne({ email: 'student@example.com' });
    console.log('\n🎓 Student user:', student ? 'EXISTS' : 'NOT FOUND');
    
    if (student) {
      console.log('Student details:', {
        name: student.name,
        email: student.email,
        role: student.role,
        isBlocked: student.isBlocked,
        hasPassword: !!student.password
      });
    }

    // Test password comparison
    if (admin) {
      const testPassword = 'Admin123!';
      const isValid = await admin.matchPassword(testPassword);
      console.log('\n🔐 Admin password test:', isValid ? 'VALID' : 'INVALID');
    }

    if (student) {
      const testPassword = 'Student123!';
      const isValid = await student.matchPassword(testPassword);
      console.log('🔐 Student password test:', isValid ? 'VALID' : 'INVALID');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
};

testUsers();