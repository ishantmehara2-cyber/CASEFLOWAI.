import React from 'react';
import { ActivityItem } from '../../types';
import { FileUp, UserPlus, Pill, Clock, Activity } from 'lucide-react';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
  className?: string;
}

export const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  activities,
  className,
}) => {
  const getActivityIcon = (type: ActivityItem['type']) => {
    switch (type) {
      case 'report':
        return {
          icon: <FileUp className="w-4 h-4 text-purple-600" />,
          bg: 'bg-purple-50 border-purple-100',
        };
      case 'patient':
        return {
          icon: <UserPlus className="w-4 h-4 text-emerald-600" />,
          bg: 'bg-emerald-50 border-emerald-100',
        };
      case 'prescription':
        return {
          icon: <Pill className="w-4 h-4 text-brand-600" />,
          bg: 'bg-brand-50 border-brand-100',
        };
      case 'reminder':
        return {
          icon: <Clock className="w-4 h-4 text-amber-600" />,
          bg: 'bg-amber-50 border-amber-100',
        };
      default:
        return {
          icon: <Activity className="w-4 h-4 text-brand-600" />,
          bg: 'bg-brand-50 border-brand-100',
        };
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-slate-100 text-navy-700 border border-slate-200">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">Recent Activity</h3>
            <p className="text-xs text-navy-500">Live clinical audit feed</p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 flex items-center">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse" />
          Live
        </span>
      </div>

      {/* Activity Timeline or Empty State */}
      {activities.length === 0 ? (
        <div className="py-8 text-center text-xs text-navy-400">
          No recent activity logged.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {activities.map((act) => {
            const style = getActivityIcon(act.type);

            return (
              <div key={act.id} className="flex items-start space-x-3 text-xs">
                <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${style.bg}`}>
                  {style.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-navy-900">{act.title}</p>
                  <p className="text-navy-600 text-xs mt-0.5 font-medium">{act.subtitle}</p>
                </div>
                <span className="text-[11px] font-medium text-navy-400 shrink-0 whitespace-nowrap">
                  {act.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
