import useSWR from 'swr';
import { Transaction, Budget, BudgetWithProgress } from './types';
import { format, parseISO } from 'date-fns';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export const swrConfig = {
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  dedupingInterval: 30000, // Increased to reduce API calls
  refreshInterval: 0,
  keepPreviousData: true,
  errorRetryCount: 1, // Reduced retry count
  errorRetryInterval: 2000, // Increased retry interval
  focusThrottleInterval: 10000, // Increased throttle
  suspense: false, // Disable suspense for better performance
  fallback: {}, // Add fallback data
};

export function useTransactions(limit?: number) {
  const { data, error, isLoading, mutate } = useSWR<Transaction[]>('/api/transactions', fetcher, swrConfig);

  const transactions = data ? (limit ? data.slice(0, limit) : data) : [];

  return {
    transactions,
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBudgets(month?: string) {
  const url = month ? `/api/budgets?month=${month}` : '/api/budgets';
  const { data, error, isLoading, mutate } = useSWR<Budget[]>(url, fetcher, swrConfig);

  return {
    budgets: data || [],
    isLoading,
    isError: error,
    mutate,
  };
}

export function useBudgetsWithProgress(month?: string) {
  const { budgets, isLoading, isError, mutate } = useBudgets(month);
  const { transactions } = useTransactions();

  const budgetsWithProgress: BudgetWithProgress[] = budgets.map(budget => {
    // Filter transactions for the budget month
    const monthTransactions = transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      const transactionMonth = format(transactionDate, 'yyyy-MM');
      return transactionMonth === budget.month && transaction.type === 'expense';
    });

    let spent: number;
    
    if (budget.category) {
      // Category-specific budget: only count transactions in that category
      spent = monthTransactions
        .filter(t => t.category === budget.category)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    } else {
      // Monthly budget: count all expense transactions
      spent = monthTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }

    const remaining = budget.amount - spent;
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    let status: 'under' | 'over' | 'at' = 'under';
    if (spent > budget.amount) {
      status = 'over';
    } else if (Math.abs(spent - budget.amount) < 0.01) {
      status = 'at';
    }

    return {
      ...budget,
      spent,
      remaining,
      percentage,
      status,
    };
  });

  return {
    budgetsWithProgress,
    isLoading,
    isError,
    mutate,
  };
} 