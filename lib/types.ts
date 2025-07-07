export const TRANSACTION_CATEGORIES = [
  'Food & Dining',
  'Housing',
  'Transportation',
  'Utilities',
  'Healthcare',
  'Entertainment',
  'Shopping',
  'Education',
  'Personal Care',
  'Travel',
  'Investments',
  'Income',
  'Other'
] as const;

export type TransactionCategory = typeof TRANSACTION_CATEGORIES[number];

export interface Transaction {
  _id: string;
  amount: number;
  description: string;
  date: string;
  category: TransactionCategory;
  type: 'expense' | 'income';
  createdAt?: string;
  updatedAt?: string;
}

export interface Budget {
  _id: string;
  category?: Exclude<TransactionCategory, 'Income'>;
  amount: number;
  month: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BudgetWithProgress extends Budget {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'under' | 'over' | 'at';
} 