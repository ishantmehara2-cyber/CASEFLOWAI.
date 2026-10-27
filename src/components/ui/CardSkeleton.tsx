import React from 'react';
import { cn } from '../../utils/cn';

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={cn('bg-white p-5 rounded-xl border border-slate-200/80 shadow-subtle animate-pulse space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div className="h-4 bg-slate-200 rounded w-1/3" />
        <div className="w-8 h-8 bg-slate-200 rounded-lg" />
      </div>
      <div className="h-8 bg-slate-200 rounded w-1/2" />
      <div className="h-3 bg-slate-100 rounded w-2/3" />
    </div>
  );
};
