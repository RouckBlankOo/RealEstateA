const mongoose = require('mongoose');
const User = require('../src/api/models/userModel');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/RealEstate";

async function deleteSupportAccount() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB Connected');

    // Delete existing support account
    const result = await User.deleteOne({ email: 'support@realestate.com' });
    
    if (result.deletedCount > 0) {
      console.log('✅ Support account deleted successfully!');
    } else {
      console.log('⚠️  No support account found to delete');
    }

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

deleteSupportAccount();
