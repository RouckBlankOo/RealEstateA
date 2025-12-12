/**
 * Create Dummy Support Account
 * Simple script to create a test account for support dashboard
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../src/api/models/userModel');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/RealEstate";

async function connectDB() {
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
}

async function createDummySupportAccount() {
  try {
    await connectDB();

    const accountDetails = {
      email: 'support@gmail.com',
      password: 'password123',
      fullName: 'Support Team',
      firstName: 'Support',
      lastName: 'Team',
      role: ['buyer', 'seller'], // Using existing roles
      phoneNumber: '+9999999999' // Unique phone number
    };

    // Check if account already exists
    const existingUser = await User.findOne({ email: accountDetails.email });
    
    if (existingUser) {
      console.log('⚠️  Account already exists!');
      console.log('\n📧 Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Email:    support@gmail.com');
      console.log('Password: password123');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(accountDetails.password, salt);

    // Create user
    const newUser = new User({
      email: accountDetails.email,
      password: hashedPassword,
      fullName: accountDetails.fullName,
      firstName: accountDetails.firstName,
      lastName: accountDetails.lastName,
      role: accountDetails.role,
      phoneNumber: accountDetails.phoneNumber,
      emailVerified: true,
      phoneVerified: true,
      profileCompleted: true,
      isActive: true
    });

    await newUser.save();

    console.log('\n✅ Dummy Support Account Created Successfully!');
    console.log('\n📧 Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Email:    support@gmail.com');
    console.log('Password: password123');
    console.log('Roles:    buyer, seller');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Use this account to login to the Support Dashboard');
    console.log('🔐 Dashboard URL: http://localhost:3000\n');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error creating account:', error.message);
    
    if (error.code === 11000) {
      console.log('\n⚠️  Email already exists in database.');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
}

createDummySupportAccount();
