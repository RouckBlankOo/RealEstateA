/**
 * Update Existing User to Support Role
 * Run: node scripts/update-to-support-role.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/realestate';

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: mongoose.Schema.Types.Mixed,
  phoneNumber: String,
  isVerified: Boolean,
  createdAt: Date,
  updatedAt: Date
});

const User = mongoose.model('User', userSchema);

async function updateToSupportRole() {
  try {
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('\n✅ Connected to MongoDB (RealEstate database)\n');

    // Find the existing support@gmail.com user
    const existingUser = await User.findOne({ email: 'support@gmail.com' });
    
    if (!existingUser) {
      console.log('❌ User not found with email: support@gmail.com');
      await mongoose.connection.close();
      return;
    }

    console.log('📋 Current User Details:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👤 ID:', existingUser._id);
    console.log('📧 Email:', existingUser.email);
    console.log('🎭 Current Role:', existingUser.role);
    console.log('📛 Name:', existingUser.firstName, existingUser.lastName);
    console.log('📞 Phone:', existingUser.phoneNumber);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Update user to support role and reset password
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    existingUser.role = 'support'; // Change from array to string
    existingUser.password = hashedPassword;
    existingUser.isVerified = true;
    existingUser.updatedAt = new Date();
    
    await existingUser.save();

    console.log('✅ User updated successfully!\n');
    console.log('📋 Dashboard Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    support@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🌐 URL:      http://localhost:3001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👤 User ID:', existingUser._id);
    console.log('🎭 New Role:', existingUser.role);
    console.log('✅ Verified:', existingUser.isVerified);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Try logging in again at: http://localhost:3001');
    console.log('2. Use the credentials above');
    console.log('3. You should now be able to access the dashboard!\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await mongoose.connection.close();
    process.exit(1);
  }
}

console.log('\n╔════════════════════════════════════════╗');
console.log('║  Update User to Support Role Script   ║');
console.log('╚════════════════════════════════════════╝');

updateToSupportRole()
  .then(() => {
    console.log('✨ Script completed successfully!\n');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error.message);
    process.exit(1);
  });
