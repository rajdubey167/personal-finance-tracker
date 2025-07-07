import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function fixIndexes() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    const collection = db.collection('budgets');
    
    // List all indexes
    console.log('Current indexes:');
    const indexes = await collection.listIndexes().toArray();
    console.log(indexes);
    
    // Drop problematic indexes
    for (const index of indexes) {
      // Skip the _id index
      if (index.name === '_id_') continue;
      
      // Drop any other index
      console.log(`Dropping index: ${index.name}`);
      await collection.dropIndex(index.name);
    }
    
    // Verify indexes after dropping
    console.log('\nRemaining indexes:');
    const remainingIndexes = await collection.listIndexes().toArray();
    console.log(remainingIndexes);
    
    console.log('\n✅ Successfully removed all problematic indexes');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

fixIndexes(); 