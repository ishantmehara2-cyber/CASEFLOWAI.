import React, { useState } from 'react';
import { MedicationReminder } from '../../types';
import { PatientAvatar } from '../ui/PatientAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { Bell, Clock, Pill, MoreVertical, ArrowRight, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

interface UpcomingRemindersCardProps {
  reminders: MedicationReminder[];
  className?: string;
  onAddReminder?: () => void;
}

export const UpcomingRemindersCard: React.FC<UpcomingRemindersCardProps> = ({
  reminders,
  className,
  onAddReminder,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  const handleReminderAction = (rem: MedicationReminder, action: string) => {
    setActiveMenuId(null);
    showToast('Reminder Action', `${action} for ${rem.patientName} (${rem.medication})`, 'success');
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 ${className}`}>
      {/* Card Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-amber-50 text-amber-600 border border-amber-100">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">Upcoming Medication Reminders</h3>
            <p className="text-xs text-navy-500">Scheduled for today</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reminders')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center"
        >
          <span>View All</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>

      {/* Reminders List or Empty State */}
      {reminders.length === 0 ? (
        <div className="pt-3">
          <EmptyState
            icon={<Bell className="w-8 h-8 text-navy-300" />}
            title="No upcoming medication reminders"
            description="Schedule medication alerts for your active clinical patients."
            actionLabel="Create Reminder"
            onAction={onAddReminder || (() => navigate('/reminders'))}
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100 mt-2">
          {reminders.map((rem) => (
            <div
              key={rem.id}
              className="py-3 flex items-center justify-between hover:bg-slate-50/60 p-2 rounded-lg transition-colors group"
            >
              <div className="flex items-center space-x-3 min-w-0">
                {/* Time Indicator */}
                <div className="flex flex-col items-center justify-center w-14 h-11 bg-slate-50 border border-slate-200/80 rounded-lg shrink-0">
                  <Clock className="w-3.5 h-3.5 text-navy-400 mb-0.5" />
                  <span className="text-[10px] font-bold text-navy-800">{rem.time}</span>
                </div>

                {/* Patient Avatar & Details */}
                <PatientAvatar
                  image={rem.patientPhoto}
                  name={rem.patientName}
                  size="md"
                />

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-navy-900 truncate group-hover:text-brand-600 transition-colors">
                    {rem.patientName}
                  </p>
                  <div className="flex items-center text-xs text-navy-600 space-x-1.5 mt-0.5">
                    <Pill className="w-3 h-3 text-brand-500 shrink-0" />
                    <span className="truncate font-medium">{rem.medication}</span>
                    <span className="text-navy-400">•</span>
                    <span className="text-navy-500 text-[11px]">{rem.dosage}</span>
                  </div>
                </div>
              </div>

              {/* Right: Status & Actions */}
              <div className="flex items-center space-x-2 shrink-0 ml-2">
                <StatusBadge status={rem.status} size="sm" showDot={false} />

                <div className="relative">
                  <button
                    onClick={() => setActiveMenuId(activeMenuId === rem.id ? null : rem.id)}
                    className="p-1 text-navy-400 hover:text-navy-700 hover:bg-slate-100 rounded transition-colors"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {activeMenuId === rem.id && (
                    <>
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setActiveMenuId(null)}
                      />
                      <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-dropdown border border-slate-200 py-1 z-20 text-xs font-medium text-left">
                        <button
                          onClick={() => handleReminderAction(rem, 'Triggered SMS Reminder')}
                          className="w-full px-3 py-1.5 text-navy-700 hover:bg-slate-50"
                        >
                          Send SMS Alert
                        </button>
                        <button
                          onClick={() => handleReminderAction(rem, 'Marked as Delivered')}
                          className="w-full px-3 py-1.5 text-navy-700 hover:bg-slate-50"
                        >
                          Mark Completed
                        </button>
                        <button
                          onClick={() => handleReminderAction(rem, 'Rescheduled')}
                          className="w-full px-3 py-1.5 text-navy-700 hover:bg-slate-50"
                        >
                          Reschedule
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
