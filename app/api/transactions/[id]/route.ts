import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Transaction from '@/models/Transaction';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const transaction = await Transaction.findByIdAndDelete(id);
    
    if (!transaction) {
      return new NextResponse(null, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();
    const body = await request.json();

    const transaction = await Transaction.findByIdAndUpdate(
      id,
      {
        amount: body.amount,
        description: body.description,
        date: body.date,
        category: body.category,
        type: body.type,
      },
      { new: true, runValidators: true }
    );

    if (!transaction) {
      return new NextResponse('Transaction not found', { status: 404 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 