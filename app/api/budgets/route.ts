import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Budget from '@/models/Budget';

interface ValidationError {
  message: string;
}

interface MongoError {
  code: number;
  keyValue?: Record<string, string>;
  name: string;
  errors?: Record<string, ValidationError>;
}

export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    
    let query: { isActive: boolean; month?: string } = { isActive: true };
    if (month) {
      query = { ...query, month };
    }
    
    const budgets = await Budget.find(query).sort({ category: 1 });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    console.log('Creating budget with data:', body);
    
    if (!body.name || !body.amount || !body.month) {
      return new NextResponse('Missing required fields: name, amount, and month are required', { status: 400 });
    }
    
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return new NextResponse('Amount must be a positive number', { status: 400 });
    }
    
    if (!body.category || body.category.trim() === '') {
      body.category = null;
    }
    
    const budget = new Budget(body);
    await budget.save();
    
    console.log('Budget created successfully:', budget);
    return NextResponse.json(budget, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating budget:', error);
    
    const mongoError = error as MongoError;
    
    // Handle MongoDB duplicate key error
    if (mongoError.code === 11000) {
      const keyValue = mongoError.keyValue;
      if (keyValue && keyValue.category) {
        return new NextResponse(`A budget for "${keyValue.category}" category in this month already exists. Please update the existing budget or choose a different month.`, { status: 400 });
      } else {
        return new NextResponse('A budget for this category and month already exists', { status: 400 });
      }
    }
    
    if (mongoError.name === 'ValidationError') {
      const validationErrors = Object.values(mongoError.errors || {}).map((err: ValidationError) => err.message).join(', ');
      return new NextResponse(`Validation error: ${validationErrors}`, { status: 400 });
    }
    
    // Generic error for any other issues
    return new NextResponse('Unable to create budget. Please try again.', { status: 500 });
  }
} 