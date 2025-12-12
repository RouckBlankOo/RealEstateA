/**
 * Verify support account - using MongoClient directly
 */

const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

async function verifyAccount() {
    const uri = "mongodb://localhost:27017";
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log('✅ Connected to MongoDB');

        const database = client.db('RealEstate');
        const merchants = database.collection('merchants');

        // Find the account
        const user = await merchants.findOne({ email: 'support@realestate.com' });

        if (!user) {
            console.log('❌ Account not found!');
            return;
        }

        console.log('\n📧 Found account:', user.email);
        console.log('Current role:', user.role);
        console.log('Email verified:', user.emailVerified);

        // Update to verify and set roles
        await merchants.updateOne(
            { email: 'support@realestate.com' },
            {
                $set: {
                    emailVerified: true,
                    phoneVerified: true,
                    profileCompleted: true,
                    role: ['support', 'admin'],
                    fullName: 'Support Admin',
                    isActive: true
                }
            }
        );

        // Verify it worked
        const updated = await merchants.findOne({ email: 'support@realestate.com' });

        console.log('\n✅ Account Updated!');
        console.log('Email verified:', updated.emailVerified);
        console.log('Role:', updated.role);
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('✅ You can now log in with:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Email:    support@realestate.com');
        console.log('Password: Support123!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('\n🌐 Dashboard: http://localhost:3001\n');

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

verifyAccount();
