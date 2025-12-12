/**
 * Check Support User in Database
 * Run: node scripts/check-support-user.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/real_estate_db';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: String,
  phoneNumber: String,
  isVerified: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function checkSupportUser() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');

    const supportUser = await User.findOne({ email: 'support@gmail.com' });
    
    if (!supportUser) {
      console.log('❌ Support user NOT found in database!');
      console.log('Run: node scripts/create-support-admin.js');
    } else {
      console.log('✅ Support user found!\n');
      console.log('📋 User Details:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 ID:', supportUser._id);
      console.log('📧 Email:', supportUser.email);
      console.log('🎭 Role:', supportUser.role);
      console.log('📛 Name:', supportUser.firstName, supportUser.lastName);
      console.log('📞 Phone:', supportUser.phoneNumber);
      console.log('✅ Verified:', supportUser.isVerified);
      console.log('📅 Created:', supportUser.createdAt);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      if (supportUser.role === 'support' || supportUser.role === 'admin') {
        console.log('✅ Role is correct! User should be able to login.');
      } else {
        console.log('❌ Role is incorrect!');
        console.log(`   Expected: 'support' or 'admin'`);
        console.log(`   Actual: '${supportUser.role}'`);
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkSupportUser();
