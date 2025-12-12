/**
 * Quick Fix: Update support@gmail.com to support role
 * Run: node scripts/quick-fix-support.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Use exact database from .env
const MONGO_URI = 'mongodb://localhost:27017/realestate';

async function quickFix() {
  try {
    console.log('\n🔧 Quick Fix: Updating support@gmail.com to support role\n');
    console.log('📡 Connecting to:', MONGO_URI);
    
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected!\n');
    
    // Get User model
    const User = mongoose.connection.collection('users');
    
    // Find the user
    const user = await User.findOne({ email: 'support@gmail.com' });
    
    if (!user) {
      console.log('❌ User not found. Creating new one...\n');
      
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.insertOne({
        firstName: 'Support',
        lastName: 'Team',
        email: 'support@gmail.com',
        password: hashedPassword,
        role: 'support',
        phoneNumber: '+1234567890',
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ Created new support user!');
    } else {
      console.log('📋 Current user:');
      console.log('   ID:', user._id);
      console.log('   Role:', user.role);
      console.log('   Name:', user.firstName, user.lastName);
      console.log('');
      
      // Update role to string 'support' and reset password
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await User.updateOne(
        { email: 'support@gmail.com' },
        { 
          $set: { 
            role: 'support',
            password: hashedPassword,
            isVerified: true,
            updatedAt: new Date()
          } 
        }
      );
      
      console.log('✅ Updated user role to: support');
    }
    
    console.log('\n📋 Dashboard Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    support@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🌐 URL:      http://localhost:3001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('✅ Try logging in now!\n');
    
    await mongoose.connection.close();
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

quickFix();
