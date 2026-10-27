import React from 'react';
import { Activity, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showTagline = false,
  className,
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={cn('flex items-center space-x-2.5 select-none', className)}>
      {/* Soft blue icon emblem */}
      <div className={cn('relative flex items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-sm shrink-0', iconSizes[size])}>
        <Activity className="w-4 h-4 text-white stroke-[2.5]" />
        <ShieldCheck className="w-2.5 h-2.5 text-brand-200 absolute -bottom-0.5 -right-0.5" />
      </div>
      <div className="flex flex-col leading-tight">
        <div className="flex items-center">
          <span className={cn('font-bold tracking-tight text-navy-900', textSizes[size])}>
            Case<span className="text-brand-600">Flow</span>
          </span>
          <span className="ml-1 text-xs px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-200/60 tracking-wider uppercase">
            AI
          </span>
        </div>
        {showTagline && (
          <span className="text-[10px] font-medium text-navy-500 tracking-wide uppercase mt-0.5">
            Giving Healthcare a Memory
          </span>
        )}
      </div>
    </div>
  );
};
