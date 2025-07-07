"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Receipt,
  PiggyBank,
  LineChart,
  Menu,
  X,
  DollarSign,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useCallback, memo } from 'react';
import { FinancePattern } from '@/components/ui/BackgroundPatterns';
import SWRProvider from '@/components/providers/SWRProvider';

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: LayoutDashboard,
    description: 'Overview of your finances',
    pattern: 'finance'
  },
  { 
    name: 'Transactions', 
    href: '/transactions', 
    icon: Receipt,
    description: 'Manage your transactions',
    pattern: 'finance'
  },
  { 
    name: 'Budgets', 
    href: '/budgets', 
    icon: PiggyBank,
    description: 'Set and track budgets',
    pattern: 'finance'
  },
  { 
    name: 'Insights', 
    href: '/insights', 
    icon: LineChart,
    description: 'Financial insights & analytics',
    pattern: 'finance'
  },
] as const;

const NavigationLink = memo(({ 
  item, 
  isActive,
  onClick
}: { 
  item: typeof navigation[number];
  isActive: boolean;
  onClick?: () => void;
}) => (
  <Link
    href={item.href}
    onClick={onClick}
    prefetch={true}
    className={cn(
      "group relative flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all duration-300 ease-in-out transform hover:scale-105",
      "border-2 border-transparent",
      isActive
        ? "bg-gray-800 text-white shadow-lg shadow-gray-800/25 border-gray-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 hover:border-gray-300"
    )}
  >
    <div className={cn(
      "flex items-center space-x-3 w-full",
      isActive && "text-white"
    )}>
      <div className={cn(
        "p-2 rounded-lg transition-all duration-300",
        isActive 
          ? "bg-white/20 text-white" 
          : "bg-gray-100 text-gray-600 group-hover:bg-gray-200 group-hover:text-gray-800"
      )}>
        <item.icon className="h-6 w-6" />
      </div>
      <div className="flex-1">
        <div className="font-semibold text-base">{item.name}</div>
        <div className={cn(
          "text-sm transition-colors duration-300",
          isActive ? "text-gray-200" : "text-gray-500 group-hover:text-gray-700"
        )}>
          {item.description}
        </div>
      </div>
    </div>
    
    {/* Active indicator */}
    {isActive && (
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-2 bg-white rounded-full animate-pulse" />
    )}
  </Link>
));
NavigationLink.displayName = 'NavigationLink';

const Sidebar = memo(({ 
  pathname,
  isSidebarOpen,
  onClose
}: { 
  pathname: string;
  isSidebarOpen: boolean;
  onClose: () => void;
}) => (
  <>
    {/* Backdrop for mobile */}
    {isSidebarOpen && (
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />
    )}
    
    <div
      className={cn(
        "fixed inset-y-0 left-0 z-50 w-80 transform bg-[#FEFEFD] shadow-2xl transition-all duration-300 ease-in-out",
        "border-r border-gray-200",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}
    >
      {/* Background pattern */}
      <FinancePattern className="opacity-10" />
      
      <div className="relative flex h-full flex-col">
        {/* Header */}
        <div className="flex h-20 items-center justify-between px-6 border-b border-gray-200 bg-[#FEFEFD]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-800 rounded-lg">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Finance Tracker
              </h1>
              <p className="text-sm text-gray-600">Smart money management</p>
            </div>
          </div>
          
          {/* Close button for mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 p-4">
          {navigation.map((item) => (
            <NavigationLink
              key={item.href}
              item={item}
              isActive={pathname === item.href}
              onClick={onClose}
            />
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-[#FEFEFD]">
          <div className="flex items-center space-x-3 p-3 rounded-lg bg-white shadow-sm">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Settings className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <div className="text-base font-medium text-gray-900">Settings</div>
              <div className="text-sm text-gray-500">App preferences</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
));
Sidebar.displayName = 'Sidebar';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setIsSidebarOpen(false);
  }, []);

  return (
    <SWRProvider>
      <div className="min-h-screen bg-gradient-to-br from-white via-[#FEFEFD] to-[#FDFCFA]">
        {/* Background pattern */}
        <FinancePattern className="opacity-5" />
        
        {/* Mobile sidebar toggle */}
        <div className="lg:hidden fixed top-4 left-4 z-50">
          <Button
            variant="outline"
            size="icon"
            onClick={toggleSidebar}
            className="bg-white/80 backdrop-blur-sm border-gray-200 shadow-lg hover:bg-white"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>

        {/* Sidebar */}
        <Sidebar
          pathname={pathname}
          isSidebarOpen={isSidebarOpen}
          onClose={closeSidebar}
        />

        {/* Main content */}
        <div className={cn(
          "transition-all duration-300 ease-in-out",
          "lg:ml-80"
        )}>
          <main className="py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
            {children}
          </main>
        </div>
      </div>
    </SWRProvider>
  );
} 