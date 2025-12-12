// MongoDB Database Cleanup Script
// This script will drop the conflicting RealEstate database

const { MongoClient } = require('mongodb');

async function cleanupDatabase() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    
    console.log('Current databases:');
    dbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
    // Check if RealEstate database exists and drop it
    const realEstateDb = client.db('RealEstate');
    const collections = await realEstateDb.listCollections().toArray();
    
    if (collections.length > 0) {
      console.log('\nDropping RealEstate database...');
      await realEstateDb.dropDatabase();
      console.log('✅ RealEstate database dropped successfully');
    } else {
      console.log('\nRealEstate database is empty or doesn\'t exist');
    }
    
    // Verify final state
    const finalDbs = await adminDb.listDatabases();
    console.log('\nFinal databases:');
    finalDbs.databases.forEach(db => {
      console.log(`- ${db.name}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

cleanupDatabase();