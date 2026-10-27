import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopHeader } from './TopHeader';
import { Doctor } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  doctor?: Doctor;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  searchQuery,
  onSearchChange,
  doctor,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col w-full overflow-x-hidden">
      {/* Sidebar navigation (w-64 fixed on desktop) */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Container Area: Fills remaining viewport width (calc(100vw - sidebar)) */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0 w-full transition-all">
        <TopHeader
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          doctor={doctor}
        />
        {/* Full-width main container without restrictive narrow max-w-7xl constraint */}
        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
};
