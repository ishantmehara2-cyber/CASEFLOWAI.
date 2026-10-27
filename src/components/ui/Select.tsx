import React from 'react';
import { cn } from '../../utils/cn';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  options: { label: string; value: string | number }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, options, ...props }, ref) => {
    return (
      <div className="relative w-full">
        <select
          ref={ref}
          className={cn(
            'w-full bg-white text-navy-900 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 pr-9 appearance-none transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-subtle cursor-pointer',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>
    );
  }
);

Select.displayName = 'Select';
