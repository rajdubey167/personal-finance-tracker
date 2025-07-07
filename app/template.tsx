'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useTransactions } from '@/lib/hooks';

export default function Template({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useTransactions();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return children;
} 