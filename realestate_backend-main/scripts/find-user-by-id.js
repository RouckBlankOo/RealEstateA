/**
 * Find User by ID
 * Run: node scripts/find-user-by-id.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

// Try both database names
const databases = [
  'mongodb://localhost:27017/RealEstate',
  'mongodb://localhost:27017/realestate',
  'mongodb://localhost:27017/real_estate_db'
];

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  role: mongoose.Schema.Types.Mixed,
  phoneNumber: String,
  isVerified: Boolean,
  createdAt: Date
}, { strict: false });

async function findUserInDatabase(dbUri) {
  try {
    const dbName = dbUri.split('/').pop();
    console.log(`\n🔍 Checking database: ${dbName}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    await mongoose.connect(dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    const User = mongoose.model('User', userSchema);
    
    // Find user by the ID from the login response
    const userById = await User.findById('692ea57883eca356004bef43');
    
    if (userById) {
      console.log('✅ Found user with ID: 692ea57883eca356004bef43');
      console.log('📧 Email:', userById.email);
      console.log('🎭 Role:', userById.role);
      console.log('📛 Name:', userById.firstName, userById.lastName);
      return { db: dbName, user: userById };
    }
    
    // Also check for support email
    const userByEmail = await User.findOne({ email: 'support@gmail.com' });
    
    if (userByEmail) {
      console.log('✅ Found user with email: support@gmail.com');
      console.log('👤 ID:', userByEmail._id);
      console.log('🎭 Role:', userByEmail.role);
      console.log('📛 Name:', userByEmail.firstName, userByEmail.lastName);
      return { db: dbName, user: userByEmail };
    }
    
    console.log('❌ No matching user found');
    
    await mongoose.disconnect();
    mongoose.models = {};
    mongoose.modelSchemas = {};
    
    return null;
  } catch (error) {
    console.error('❌ Error:', error.message);
    await mongoose.disconnect();
    mongoose.models = {};
    mongoose.modelSchemas = {};
    return null;
  }
}

async function findUser() {
  console.log('\n╔═══════════════════════════════════════╗');
  console.log('║     Find Support User in Databases    ║');
  console.log('╚═══════════════════════════════════════╝');
  
  for (const dbUri of databases) {
    const result = await findUserInDatabase(dbUri);
    if (result) {
      console.log(`\n✅ User found in database: ${result.db}`);
      console.log(`\nUpdate command for this user:`);
      console.log(`node scripts/update-to-support-role.js`);
      break;
    }
  }
  
  console.log('\n✅ Done!\n');
  process.exit(0);
}

findUser();
