import React from 'react';
import { cn } from '../../utils/cn';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          'w-full bg-white text-navy-900 placeholder:text-navy-400 border border-slate-200 rounded-lg text-sm p-3.5 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-subtle min-h-[100px]',
          error && 'border-red-500 focus:ring-red-500/20 focus:border-red-500',
          className
        )}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';
