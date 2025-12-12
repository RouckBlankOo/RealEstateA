/**
 * Force create support account
 */

require('dotenv').config();
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');

async function createSupportAccount() {
    const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";

    const client = new MongoClient(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    try {
        await client.connect();
        console.log('Connected to MongoDB');

        const database = client.db('RealEstate');
        const merchants = database.collection('merchants');

        // Delete existing support account if any
        await merchants.deleteOne({ email: 'support@realestate.com' });

        // Hash password
        const hashedPassword = await bcrypt.hash('Support123!', 12);

        // Create new support account
        const newUser = {
            _id: new ObjectId(),
            fullName: 'Support Admin',
            email: 'support@realestate.com',
            password: hashedPassword,
            role: ['support', 'admin'],
            phoneNumber: '+1234567890',
            emailVerified: true,
            phoneVerified: true,
            profileCompleted: true,
            isActive: true,
            online: false,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await merchants.insertOne(newUser);

        console.log('\n✅ SUCCESS! Support account created!');
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Login Credentials:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    support@realestate.com');
        console.log('Password: Support123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`\nUser ID: ${result.insertedId}`);
        console.log('\n🌐 Dashboard URL: http://localhost:3001');
        console.log('\n✅ You can now log in to the dashboard!');

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await client.close();
    }
}

createSupportAccount();
