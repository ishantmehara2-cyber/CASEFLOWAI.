import React from 'react';
import { PatientStatus } from '../../types';
import { cn } from '../../utils/cn';

interface StatusBadgeProps {
  status: PatientStatus;
  size?: 'sm' | 'md';
  className?: string;
  showDot?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'md',
  className,
  showDot = true,
}) => {
  const getStatusStyles = (status: PatientStatus) => {
    switch (status) {
      case 'Active':
      case 'Approved':
      case 'Completed':
        return {
          bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
          dot: 'bg-emerald-500',
        };
      case 'Follow-up':
      case 'Scheduled':
      case 'Pending':
        return {
          bg: 'bg-brand-50 text-brand-700 border-brand-200/60',
          dot: 'bg-brand-500',
        };
      case 'Review':
        return {
          bg: 'bg-purple-50 text-purple-700 border-purple-200/60',
          dot: 'bg-purple-500',
        };
      case 'Rejected':
      case 'Failed':
        return {
          bg: 'bg-red-50 text-red-700 border-red-200/60',
          dot: 'bg-red-500',
        };
      default:
        return {
          bg: 'bg-slate-50 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
        };
    }
  };

  const style = getStatusStyles(status);

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border transition-colors',
        style.bg,
        sizes[size],
        className
      )}
    >
      {showDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />}
      {status}
    </span>
  );
};
