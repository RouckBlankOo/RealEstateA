/**
 * Check MongoDB collections and data
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "RealEstate";

async function checkDatabase() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);

        // List all collections
        const collections = await db.listCollections().toArray();
        console.log('\n📁 Collections in database:');
        collections.forEach(coll => {
            console.log(`  - ${coll.name}`);
        });

        // Check merchants collection
        console.log('\n👥 Checking merchants collection...');
        const merchants = db.collection('merchants');
        const count = await merchants.countDocuments({});
        console.log(`Total merchants: ${count}`);

        // Check for support account
        const supportUser = await merchants.findOne({ email: 'support@realestate.com' });

        if (supportUser) {
            console.log('\n✅ Support account found!');
            console.log('Details:');
            console.log(`  ID: ${supportUser._id}`);
            console.log(`  Email: ${supportUser.email}`);
            console.log(`  Name: ${supportUser.fullName}`);
            console.log(`  Role: ${JSON.stringify(supportUser.role)}`);
            console.log(`  Email Verified: ${supportUser.emailVerified}`);
        } else {
            console.log('\n❌ Support account NOT found!');

            // Show any existing users
            console.log('\nExisting users:');
            const allUsers = await merchants.find({}).limit(5).toArray();
            allUsers.forEach(user => {
                console.log(`  - ${user.email || user.phoneNumber} (${user.fullName || 'No name'})`);
            });
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

checkDatabase();
