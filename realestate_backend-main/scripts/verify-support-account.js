/**
 * Verify the support account email and update role
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017";
const DB_NAME = "RealEstate";

async function verifyAndUpdateAccount() {
    const client = new MongoClient(MONGODB_URI);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const db = client.db(DB_NAME);
        const merchants = db.collection('merchants');

        // Find the support account
        const user = await merchants.findOne({ email: 'support@realestate.com' });

        if (!user) {
            console.log('❌ Support account not found!');
            return;
        }

        console.log('\n📧 Found account:', user.email);
        console.log('Current status:');
        console.log(`  - Email Verified: ${user.emailVerified}`);
        console.log(`  - Role: ${JSON.stringify(user.role)}`);

        // Update the account
        const result = await merchants.updateOne(
            { email: 'support@realestate.com' },
            {
                $set: {
                    emailVerified: true,
                    phoneVerified: true,
                    profileCompleted: true,
                    fullName: 'Support Admin',
                    role: ['support', 'admin'],
                    isActive: true
                }
            }
        );

        console.log('\n✅ Account updated!');
        console.log(`Modified: ${result.modifiedCount} document(s)`);

        // Verify the update
        const updatedUser = await merchants.findOne({ email: 'support@realestate.com' });
        console.log('\n📧 Updated account details:');
        console.log(`  - Email: ${updatedUser.email}`);
        console.log(`  - Name: ${updatedUser.fullName}`);
        console.log(`  - Role: ${JSON.stringify(updatedUser.role)}`);
        console.log(`  - Email Verified: ${updatedUser.emailVerified}`);
        console.log(`  - Phone Verified: ${updatedUser.phoneVerified}`);

        console.log('\n✅ SUCCESS! You can now log in with:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    support@realestate.com');
        console.log('Password: Support123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Dashboard: http://localhost:3001');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
    } finally {
        await client.close();
        console.log('\n✅ Connection closed');
    }
}

verifyAndUpdateAccount();
