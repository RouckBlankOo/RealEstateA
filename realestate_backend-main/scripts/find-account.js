/**
        const adminDb = client.db().admin();
        const dbList = await adminDb.listDatabases();

        console.log('\n📁 Available Databases:');
        dbList.databases.forEach(db => {
            console.log(`  - ${db.name}`);
        });

        // Try each database that looks relevant
        const possibleDbs = ['RealEstate', 'realestate', 'test', 'admin'];

        for (const dbName of possibleDbs) {
            console.log(`\n🔍 Checking database: ${dbName}`);
            const db = client.db(dbName);
            const collections = await db.listCollections().toArray();

            console.log(`  Collections: ${collections.map(c => c.name).join(', ')}`);

            // Check merchants collection if it exists
            if (collections.some(c => c.name === 'merchants')) {
                const merchants = db.collection('merchants');
                const count = await merchants.countDocuments({});
                console.log(`  - merchants collection has ${count} documents`);

                const supportUser = await merchants.findOne({ email: 'support@realestate.com' });
                if (supportUser) {
                    console.log(`  ✅ FOUND support account in ${dbName}!`);
                    console.log(`     Email verified: ${supportUser.emailVerified}`);
                    console.log(`     Role: ${JSON.stringify(supportUser.role)}`);
                }
            }
        }

    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        await client.close();
    }
}

findAccount();
