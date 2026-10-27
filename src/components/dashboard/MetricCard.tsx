import React from 'react';
import { MetricData } from '../../types';
import { Users, Calendar, FileText, Bell, TrendingUp, AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

interface MetricCardProps {
  data: MetricData;
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({ data, className }) => {
  const renderIcon = (iconName: MetricData['icon']) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5 text-brand-600" />;
      case 'calendar':
        return <Calendar className="w-5 h-5 text-brand-600" />;
      case 'document':
        return <FileText className="w-5 h-5 text-purple-600" />;
      case 'bell':
        return <Bell className="w-5 h-5 text-amber-600" />;
      default:
        return <Users className="w-5 h-5 text-brand-600" />;
    }
  };

  const getIconContainerStyle = (iconName: MetricData['icon']) => {
    switch (iconName) {
      case 'users':
      case 'calendar':
        return 'bg-brand-50 border-brand-100';
      case 'document':
        return 'bg-purple-50 border-purple-100';
      case 'bell':
        return 'bg-amber-50 border-amber-100';
      default:
        return 'bg-brand-50 border-brand-100';
    }
  };

  return (
    <div
      className={cn(
        'bg-white rounded-xl p-5 border border-slate-200/80 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-navy-500 uppercase tracking-wider">{data.label}</p>
          <h3 className="text-2xl sm:text-3xl font-bold text-navy-900 mt-1 tracking-tight">{data.value}</h3>
        </div>
        <div
          className={cn(
            'p-2.5 rounded-xl border shrink-0',
            getIconContainerStyle(data.icon)
          )}
        >
          {renderIcon(data.icon)}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-xs">
        {data.change.startsWith('+') ? (
          <span className="inline-flex items-center text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
            <TrendingUp className="w-3 h-3 mr-1" />
            {data.change}
          </span>
        ) : data.trendType === 'warning' ? (
          <span className="inline-flex items-center text-amber-600 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
            <AlertCircle className="w-3 h-3 mr-1" />
            {data.change}
          </span>
        ) : (
          <span className="inline-flex items-center text-brand-600 font-semibold bg-brand-50 px-1.5 py-0.5 rounded border border-brand-100">
            {data.change}
          </span>
        )}
        <span className="text-navy-500">{data.supportingText}</span>
      </div>
    </div>
  );
};
