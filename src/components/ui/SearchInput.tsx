import React from 'react';
import { Input, InputProps } from './Input';
import { Search, X } from 'lucide-react';

export interface SearchInputProps extends Omit<InputProps, 'leftIcon'> {
  onClear?: () => void;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search patients by name, ID or phone number...',
  className,
  ...props
}) => {
  return (
    <Input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={className}
      leftIcon={<Search className="w-4 h-4 text-navy-400" />}
      rightIcon={
        value && onClear ? (
          <button
            type="button"
            onClick={onClear}
            className="p-1 hover:text-navy-700 transition-colors rounded-full"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : undefined
      }
      {...props}
    />
  );
};
