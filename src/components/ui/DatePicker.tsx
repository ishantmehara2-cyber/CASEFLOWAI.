import React from 'react';
import { Input, InputProps } from './Input';
import { Calendar } from 'lucide-react';

export const DatePicker: React.FC<InputProps> = (props) => {
  return (
    <Input
      type="date"
      leftIcon={<Calendar className="w-4 h-4 text-navy-400" />}
      {...props}
    />
  );
};
