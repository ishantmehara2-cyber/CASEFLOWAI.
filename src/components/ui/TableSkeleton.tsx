import React from 'react';

export const TableSkeleton: React.FC<{ rows?: number }> = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-4 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-4" />
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center space-x-4 py-2 border-b border-slate-100 last:border-0">
            <div className="w-8 h-8 bg-slate-200 rounded-full shrink-0" />
            <div className="flex-1 space-y-1">
              <div className="h-4 bg-slate-200 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/5" />
            </div>
            <div className="h-4 bg-slate-200 rounded w-16" />
            <div className="h-6 bg-slate-200 rounded-full w-20" />
          </div>
        ))}
      </div>
    </div>
  );
};
