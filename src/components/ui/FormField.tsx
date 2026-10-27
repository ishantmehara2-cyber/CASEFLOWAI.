import React from 'react';
import { cn } from '../../utils/cn';

interface FormFieldProps {
  label?: string;
  error?: string;
  helpText?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  helpText,
  required,
  children,
  className,
}) => {
  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      {label && (
        <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
      {!error && helpText && <p className="text-xs text-navy-500 mt-1">{helpText}</p>}
    </div>
  );
};
