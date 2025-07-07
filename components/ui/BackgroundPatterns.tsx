"use client";

import { cn } from '@/lib/utils';

export const FinancePattern = ({ className }: { className?: string }) => (
  <div className={cn("absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/30 pointer-events-none", className)} />
);

export const GradientBackground = ({ className }: { className?: string }) => (
  <div className={cn("absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 pointer-events-none", className)} />
); 