/**
 * Direct MongoDB insert for support account
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "RealEstate";

async function insertAccount() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const users = db.collection('users');

        // Check if exists
        const existing = await users.findOne({ email: 'support@realestate.com' });

        if (existing) {
            console.log('\n✅ Support account already exists!');
            console.log('\n📧 Login Credentials:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('Email:    support@realestate.com');
            console.log('Password: Support123!');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('Support123!', salt);

        // Create document
        const result = await users.insertOne({
            fullName: 'Support Admin',
            email: 'support@realestate.com',
            password: hashedPassword,
            role: ['support', 'admin'],
            phoneNumber: '+1234567890',
            emailVerified: true,
            phoneVerified: true,
            profileCompleted: true,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('\n✅ Support Account Created Successfully!');
        console.log('\n📧 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    support@realestate.com');
        console.log('Password: Support123!');
        console.log('Roles:    support, admin');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\\nUser ID: ${result.insertedId}`);

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

insertAccount();
