import { connectToDatabase } from './db.js';

async function dropBudgetIndex() {
  try {
    const { db } = await connectToDatabase();
    
    // Drop the unique index on category and month
    await db.collection('budgets').dropIndex('category_1_month_1');
    
    console.log('Successfully dropped the unique index on category and month');
  } catch (error) {
    console.error('Error dropping index:', error);
  }
}

dropBudgetIndex(); 