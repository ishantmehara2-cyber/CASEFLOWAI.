import React from 'react';
import { Loader2 } from 'lucide-react';

export const ButtonLoader: React.FC<{ size?: number }> = ({ size = 16 }) => {
  return <Loader2 style={{ width: size, height: size }} className="animate-spin text-current" />;
};
