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
  message?: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const budget = await Budget.findById(id);
    
    if (!budget) {
      return new NextResponse('Budget not found', { status: 404 });
    }
    
    return NextResponse.json(budget);
  } catch (error) {
    console.error('Error fetching budget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();
    
    console.log('Updating budget with data:', body);
    
    if (!body.name || !body.amount || !body.month) {
      return new NextResponse('Missing required fields: name, amount, and month are required', { status: 400 });
    }
    
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return new NextResponse('Amount must be a positive number', { status: 400 });
    }
    
    if (!body.category || body.category.trim() === '') {
      body.category = null;
    }
    
    const budget = await Budget.findByIdAndUpdate(
      id,
      body,
      { new: true, runValidators: true }
    );
    
    if (!budget) {
      return new NextResponse('Budget not found', { status: 404 });
    }
    
    console.log('Budget updated successfully:', budget);
    return NextResponse.json(budget);
  } catch (error: unknown) {
    console.error('Error updating budget:', error);
    
    const mongoError = error as MongoError;
    
    if (mongoError.code === 11000) {
      return new NextResponse('Budget for this category and month already exists', { status: 400 });
    }
    
    if (mongoError.name === 'ValidationError') {
      const validationErrors = Object.values(mongoError.errors || {}).map((err: ValidationError) => err.message).join(', ');
      return new NextResponse(`Validation error: ${validationErrors}`, { status: 400 });
    }
    
    return new NextResponse(`Internal Server Error: ${mongoError.message || 'Unknown error'}`, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const budget = await Budget.findByIdAndDelete(id);
    
    if (!budget) {
      return new NextResponse('Budget not found', { status: 404 });
    }
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 