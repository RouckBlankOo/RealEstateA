/**
 * Find All Support Users
 * Run: node scripts/find-all-support-users.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/real_estate_db';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: mongoose.Schema.Types.Mixed, // Can be string or array
  phoneNumber: String,
  isVerified: Boolean,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function findAllSupportUsers() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('✅ Connected to MongoDB\n');

    // Find all users with email containing 'support'
    const allSupportUsers = await User.find({ 
      email: { $regex: /support/i } 
    });
    
    console.log(`Found ${allSupportUsers.length} user(s) with 'support' in email:\n`);
    
    allSupportUsers.forEach((user, index) => {
      console.log(`User ${index + 1}:`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('👤 ID:', user._id);
      console.log('📧 Email:', user.email);
      console.log('🎭 Role:', user.role, '(Type:', typeof user.role, ')');
      console.log('📛 Name:', user.firstName, user.lastName);
      console.log('📞 Phone:', user.phoneNumber);
      console.log('✅ Verified:', user.isVerified);
      console.log('📅 Created:', user.createdAt);
      console.log('');
    });

    // Delete the wrong support user and keep only the correct one
    const wrongUser = await User.findOne({ 
      email: 'support@gmail.com',
      _id: '692ea57883eca356004bef43'
    });
    
    if (wrongUser) {
      console.log('⚠️  Found duplicate user with wrong role!');
      console.log('❌ Deleting user with ID:', wrongUser._id);
      await User.deleteOne({ _id: wrongUser._id });
      console.log('✅ Deleted successfully!\n');
    }

    await mongoose.connection.close();
    console.log('✅ Done!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

findAllSupportUsers();
