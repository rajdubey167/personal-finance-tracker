import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function dropBudgetIndex() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db();
    
    // Drop the unique index on category and month
    await db.collection('budgets').dropIndex('category_1_month_1');
    
    console.log('✅ Successfully dropped the unique index on category and month');
  } catch (error) {
    if (error.code === 26) {
      console.log('ℹ️ Index does not exist, nothing to drop');
    } else {
      console.error('❌ Error dropping index:', error.message);
    }
  } finally {
    await client.close();
  }
}

dropBudgetIndex(); 