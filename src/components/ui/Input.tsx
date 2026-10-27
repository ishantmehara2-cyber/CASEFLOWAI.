import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full bg-white text-navy-900 placeholder:text-navy-400 border border-slate-200 rounded-lg text-sm px-3.5 py-2.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-subtle',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-400">
            {rightIcon}
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
