import mongoose from 'mongoose';
import { TRANSACTION_CATEGORIES } from '@/lib/types';

const transactionSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  category: {
    type: String,
    required: true,
    enum: TRANSACTION_CATEGORIES,
    default: 'Other',
  },
  type: {
    type: String,
    required: true,
    enum: ['expense', 'income'],
    default: 'expense',
  }
}, {
  timestamps: true,
});

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction; 