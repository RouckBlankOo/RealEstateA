/**
 * Create Support Admin Account
 * This script creates a default support admin account for the dashboard
 * Run: node scripts/create-support-admin.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// MongoDB connection string
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/RealEstate';

// Default support admin credentials
const SUPPORT_ADMIN = {
  firstName: 'Support',
  lastName: 'Admin',
  email: 'support@gmail.com',
  password: 'password123', // This will be hashed
  role: 'support',
  phoneNumber: '+1234567890',
  isVerified: true
};

// User Schema (matching your existing model)
const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['buyer', 'seller', 'admin', 'support'], default: 'buyer' },
  phoneNumber: { type: String },
  isVerified: { type: Boolean, default: false },
  profilePicture: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

/**
 * Create support admin account
 */
async function createSupportAdmin() {
  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connected to MongoDB');

    // Check if support admin already exists
    const existingAdmin = await User.findOne({ email: SUPPORT_ADMIN.email });
    
    if (existingAdmin) {
      console.log('\n⚠️  Support admin already exists!');
      console.log('\n📋 Dashboard Login Credentials:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email:    support@gmail.com');
      console.log('🔑 Password: password123');
      console.log('🌐 URL:      http://localhost:3001');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      console.log('👤 User ID:', existingAdmin._id);
      console.log('🎭 Role:', existingAdmin.role);
      console.log('📅 Created:', existingAdmin.createdAt);
      
      await mongoose.connection.close();
      return;
    }

    // Hash password
    console.log('\n🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(SUPPORT_ADMIN.password, 10);

    // Create support admin
    console.log('👤 Creating support admin account...');
    const supportAdmin = await User.create({
      ...SUPPORT_ADMIN,
      password: hashedPassword,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Support admin account created successfully!\n');
    console.log('📋 Dashboard Login Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email:    support@gmail.com');
    console.log('🔑 Password: password123');
    console.log('🌐 URL:      http://localhost:3001');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('👤 User ID:', supportAdmin._id);
    console.log('🎭 Role:', supportAdmin.role);
    console.log('✉️  Verified:', supportAdmin.isVerified);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Start the Support Dashboard:');
    console.log('   cd Support_Front');
    console.log('   npm run dev');
    console.log('\n2. Open in browser: http://localhost:3001');
    console.log('\n3. Login with the credentials above');
    console.log('\n4. Navigate to: http://localhost:3001/dashboard/tickets\n');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
  } catch (error) {
    console.error('\n❌ Error creating support admin:', error.message);
    
    if (error.code === 11000) {
      console.error('⚠️  Duplicate key error - email already exists');
    }
    
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Create Support Admin Account Script  ║');
  console.log('╚════════════════════════════════════════╝\n');
  
  createSupportAdmin()
    .then(() => {
      console.log('✨ Script completed successfully!\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error.message);
      process.exit(1);
    });
}

module.exports = { createSupportAdmin };
