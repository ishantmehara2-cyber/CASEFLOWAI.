import React from 'react';
import { Input, InputProps } from './Input';
import { Clock } from 'lucide-react';

export const TimePicker: React.FC<InputProps> = (props) => {
  return (
    <Input
      type="time"
      leftIcon={<Clock className="w-4 h-4 text-navy-400" />}
      {...props}
    />
  );
};
