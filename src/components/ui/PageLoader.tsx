import React from 'react';
import { Activity } from 'lucide-react';

export const PageLoader: React.FC<{ message?: string }> = ({
  message = 'Loading workspace...',
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center">
      <div className="relative flex items-center justify-center mb-4">
        <div className="w-12 h-12 rounded-full border-2 border-brand-200 border-t-brand-600 animate-spin" />
        <Activity className="w-5 h-5 text-brand-600 absolute" />
      </div>
      <p className="text-sm font-medium text-navy-700">{message}</p>
      <p className="text-xs text-navy-400 mt-1">CaseFlowAI Clinical System</p>
    </div>
  );
};
