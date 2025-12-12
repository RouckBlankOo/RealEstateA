/**
 * Setup Script - Create Default Support Account
 * 
 * This script creates a default support account for the dashboard
 * Run: node scripts/create-support-account.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/api/models/userModel');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/RealEstate";

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
    process.exit(1);
  }
};

// Create default support account
async function createDefaultSupportAccount() {
  try {
    await connectDB();

    const defaultAccount = {
      fullName: 'Support Admin',
      email: 'support@realestate.com',
      password: 'Support123!',
      role: ['support', 'admin'],
      phoneNumber: '+1234567890'
    };

    // Check if account already exists
    const existingUser = await User.findOne({ email: defaultAccount.email });
    
    if (existingUser) {
      console.log('⚠️  Support account already exists!');
      console.log('\n📧 Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    support@realestate.com');
      console.log('Password: Support123!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n💡 If you forgot the password, delete this user and run the script again.');
      
      // Update role to ensure it has support and admin
      if (!existingUser.role.includes('support') || !existingUser.role.includes('admin')) {
        existingUser.role = ['support', 'admin'];
        await existingUser.save();
        console.log('✅ Updated user role to support and admin');
      }
      
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultAccount.password, salt);

    // Create user
    const newUser = new User({
      fullName: defaultAccount.fullName,
      email: defaultAccount.email,
      password: hashedPassword,
      role: defaultAccount.role,
      phoneNumber: defaultAccount.phoneNumber
    });

    await newUser.save();

    console.log('\n✅ Default Support Account Created Successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    support@realestate.com');
    console.log('Password: Support123!');
    console.log('Roles:    support, admin');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Dashboard URL: http://localhost:3000');
    console.log('\n⚠️  IMPORTANT: Change the password after first login!');
    console.log('\n🔐 You can now login to the Support Dashboard');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error creating support account:', error.message);
    
    if (error.code === 11000) {
      console.log('\n⚠️  Email already exists. Try deleting the existing user first.');
    }
    
    process.exit(1);
  }
}

// Run the script
createDefaultSupportAccount();
