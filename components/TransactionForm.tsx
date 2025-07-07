"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TRANSACTION_CATEGORIES, TransactionCategory, Transaction } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';

interface TransactionFormData {
  amount: number;
  description: string;
  date: string;
  category: TransactionCategory;
  type: 'expense' | 'income';
}

interface TransactionFormProps {
  onSuccess?: () => void;
  transaction?: Transaction;
  mode?: 'create' | 'edit';
  mutate?: () => void;
}

export default function TransactionForm({ onSuccess, transaction, mode = 'create', mutate }: TransactionFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<TransactionFormData>({
    defaultValues: transaction ? {
      amount: Math.abs(transaction.amount),
      description: transaction.description,
      date: transaction.date.split('T')[0],
      category: transaction.category,
      type: transaction.type,
    } : {
      type: 'expense',
      category: 'Other',
    }
  });

  useEffect(() => {
    if (transaction) {
      setValue('amount', Math.abs(transaction.amount));
      setValue('description', transaction.description);
      setValue('date', transaction.date.split('T')[0]);
      setValue('category', transaction.category);
      setValue('type', transaction.type);
    }
  }, [transaction, setValue]);

  const transactionType = watch('type');

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        mode === 'edit' && transaction 
          ? `/api/transactions/${transaction._id}` 
          : '/api/transactions',
        {
          method: mode === 'edit' ? 'PUT' : 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...data,
            amount: data.type === 'expense' ? -Math.abs(data.amount) : Math.abs(data.amount),
          }),
        }
      );

      if (!response.ok) {
        throw new Error(mode === 'edit' ? 'Failed to update transaction' : 'Failed to create transaction');
      }

      if (mode === 'create') {
        reset();
        toast({
          title: "Success! 🎉",
          description: "Transaction added successfully",
          variant: "success",
        });
      } else {
        toast({
          title: "Updated! ✨",
          description: "Transaction updated successfully",
          variant: "success",
        });
      }
      mutate?.();
      onSuccess?.();
    } catch (error) {
      console.error(`Error ${mode === 'edit' ? 'updating' : 'creating'} transaction:`, error);
      toast({
        title: "Error! ❌",
        description: mode === 'edit' ? 'Failed to update transaction' : 'Failed to add transaction',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label>Type</Label>
            <Select
              defaultValue={transaction?.type || "expense"}
              onValueChange={(value: 'expense' | 'income') => setValue('type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expense">Expense</SelectItem>
                <SelectItem value="income">Income</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { required: 'Amount is required', min: 0.01 })}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              {...register('description', { required: 'Description is required' })}
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Category</Label>
            <Select
              defaultValue={transaction?.category || "Other"}
              onValueChange={(value: TransactionCategory) => setValue('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {TRANSACTION_CATEGORIES
                  .filter(category => transactionType === 'income' ? category === 'Income' : category !== 'Income')
                  .map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              {...register('date', { required: 'Date is required' })}
            />
            {errors.date && (
              <p className="text-sm text-red-500">{errors.date.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Transaction' : 'Add Transaction')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 