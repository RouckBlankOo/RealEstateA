const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/api/models/userModel');

const MONGODB_URI = "mongodb://localhost:27017/RealEstate";

async function testUserCreation() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');

    // Delete existing user first
    await User.deleteMany({ email: 'support@realestate.com' });
    console.log('✅ Deleted any existing support accounts');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Support123!', salt);
    console.log('✅ Password hashed');

    // Create new user
    const newUser = new User({
      email: 'support@realestate.com',
      password: hashedPassword,
      fullName: 'Support Admin',
      firstName: 'Support',
      lastName: 'Admin',
      role: ['support', 'admin'],
      phoneNumber: '+1234567890',
      emailVerified: true,
      phoneVerified: true,
      profileCompleted: true,
      isActive: true
    });

    console.log('✅ User object created, attempting to save...');
    await newUser.save();
    console.log('✅ User saved successfully!');

    // Verify user was created
    const foundUser = await User.findOne({ email: 'support@realestate.com' });
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    support@realestate.com');
    console.log('Password: Support123!');
    console.log('Roles:   ', foundUser.role);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testUserCreation();
