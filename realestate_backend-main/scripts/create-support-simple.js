/**
 * Simple script to create a support account
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/RealEstate";

async function createAccount() {
    try {
        // Connect to MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB Connected');

        // Define inline schema
        const userSchema = new mongoose.Schema({
            email: String,
            password: String,
            fullName: String,
            phoneNumber: String,
            role: [String],
            emailVerified: { type: Boolean, default: false },
            phoneVerified: { type: Boolean, default: false },
            profileCompleted: { type: Boolean, default: false },
            isActive: { type: Boolean, default: true }
        }, { timestamps: true });

        const User = mongoose.model('User', userSchema);

        // Check if account exists
        const existing = await User.findOne({ email: 'support@realestate.com' });

        if (existing) {
            console.log('✅ Account already exists!');
            console.log('Email: support@realestate.com');
            console.log('Password: Support123!');
            await mongoose.connection.close();
            process.exit(0);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Support123!', salt);

        // Create user
        const newUser = new User({
            fullName: 'Support Admin',
            email: 'support@realestate.com',
            password: hashedPassword,
            role: ['support', 'admin'],
            phoneNumber: '+1234567890',
            emailVerified: true,
            phoneVerified: true,
            profileCompleted: true,
            isActive: true
        });

        await newUser.save();

        console.log('\n✅ Support Account Created Successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    support@realestate.com');
        console.log('Password: Support123!');
        console.log('Roles:    support, admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        await mongoose.connection.close();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createAccount();
