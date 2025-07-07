"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { TRANSACTION_CATEGORIES, Budget } from '@/lib/types';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

const budgetSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  category: z.string().optional(),
  month: z.string().min(1, 'Month is required'),
});

type BudgetFormData = z.infer<typeof budgetSchema>;

interface BudgetFormProps {
  onSuccess?: () => void;
  mutate?: () => void;
  initialData?: Partial<BudgetFormData>;
  mode?: 'create' | 'edit';
  budget?: Budget;
}

export default function BudgetForm({ onSuccess, mutate, initialData, mode, budget }: BudgetFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isCategoryBudget, setIsCategoryBudget] = useState(!!(initialData?.category || budget?.category));
  const { toast } = useToast();
  
  // Use budget data for edit mode, otherwise use initialData
  const formData = mode === 'edit' && budget ? {
    name: budget.name,
    amount: budget.amount,
    category: budget.category || '',
    month: budget.month,
  } : {
    name: initialData?.name || '',
    amount: initialData?.amount || 0,
    category: initialData?.category || '',
    month: initialData?.month || format(new Date(), 'yyyy-MM'),
  };
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: formData,
  });

  const onSubmit = async (data: BudgetFormData) => {
    setIsLoading(true);
    try {
      const url = mode === 'edit' && budget ? `/api/budgets/${budget._id}` : '/api/budgets';
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData);
      }

      toast({
        title: 'Success!',
        description: mode === 'edit' ? 'Budget updated successfully.' : 'Budget created successfully.',
      });

      reset();
      mutate?.();
      onSuccess?.();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : `Failed to ${mode === 'edit' ? 'update' : 'create'} budget`;
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
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
            <Label htmlFor="name">Budget Name</Label>
            <Input
              id="name"
              {...register('name')}
              placeholder="e.g., Groceries Budget"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="categoryBudget"
              checked={isCategoryBudget}
              onCheckedChange={(checked: boolean | 'indeterminate') => setIsCategoryBudget(checked === true)}
            />
            <Label htmlFor="categoryBudget">Category-specific budget</Label>
          </div>

          {isCategoryBudget && (
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                defaultValue={initialData?.category || ""}
                onValueChange={(value: string) => setValue('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSACTION_CATEGORIES
                    .filter(category => category !== 'Income')
                    .map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              {...register('amount', { valueAsNumber: true })}
              placeholder="0.00"
              className={errors.amount ? 'border-red-500' : ''}
            />
            {errors.amount && (
              <p className="text-sm text-red-500">{errors.amount.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              {...register('month')}
              className={errors.month ? 'border-red-500' : ''}
            />
            {errors.month && (
              <p className="text-sm text-red-500">{errors.month.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (mode === 'edit' ? 'Updating...' : 'Adding...') : (mode === 'edit' ? 'Update Budget' : 'Add Budget')}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 