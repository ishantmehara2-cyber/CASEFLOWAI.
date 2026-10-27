import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ReminderHistoryModal } from '../../components/reminders/ReminderHistoryModal';
import { getAllReminders, setReminderStatus, sendTestVoiceCall } from '../../services/medicationReminderService';
import { getCurrentDoctor } from '../../services/doctorService';
import { MedicationReminderRecord, ReminderStatus } from '../../types/reminder';
import { Doctor } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Bell,
  Phone,
  Search,
  Clock,
  Calendar,
  ShieldCheck,
  Pause,
  Play,
  XCircle,
  ExternalLink,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const RemindersPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reminders, setReminders] = useState<MedicationReminderRecord[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const [activeReminder, setActiveReminder] = useState<MedicationReminderRecord | null>(null);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [doc, allRems] = await Promise.all([getCurrentDoctor(), getAllReminders()]);
      setDoctor(doc);
      setReminders(allRems);
    } catch (e) {
      console.error('Failed to load reminders console:', e);
      showToast('Error', 'Unable to load medication reminders.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (reminderId: string, newStatus: ReminderStatus) => {
    try {
      await setReminderStatus(reminderId, newStatus);
      showToast('Reminder Status Updated', `Reminder status changed to ${newStatus}.`, 'success');
      loadData();
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to update reminder status.', 'error');
    }
  };

  const handleTestCall = async (reminderId: string) => {
    try {
      showToast('Initiating Test Call', 'Connecting to telephony provider...', 'info');
      const res = await sendTestVoiceCall(reminderId);
      showToast('Test Call Successful', res.message, 'success');
      loadData();
    } catch (err: any) {
      showToast('Call Failed', err.message || 'Failed to initiate test call.', 'error');
    }
  };

  const filteredReminders = reminders.filter((rem) => {
    const matchesSearch =
      rem.medicationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rem.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || rem.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const activeCount = reminders.filter((r) => r.status === 'ACTIVE').length;

  if (isLoading) {
    return (
      <AppShell>
        <PageLoader message="Loading Medication Reminders & Voice Call console..." />
      </AppShell>
    );
  }

  return (
    <AppShell doctor={doctor || undefined} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2.5">
              <Bell className="w-7 h-7 text-brand-600" />
              Medication Reminders & Voice Call Console
            </h1>
            <p className="text-xs font-medium text-navy-500 mt-1">
              Automated post-prescription medication adherence tracking and telephony voice reminder delivery.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>{activeCount} Active Voice Reminders</span>
            </div>
          </div>
        </div>

        {/* Filters & Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ALL' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
                }`}
              >
                All ({reminders.length})
              </button>
              <button
                onClick={() => setStatusFilter('ACTIVE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'ACTIVE' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
                }`}
              >
                Active
              </button>
              <button
                onClick={() => setStatusFilter('PAUSED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === 'PAUSED' ? 'bg-brand-600 text-white shadow-xs' : 'bg-slate-100 text-navy-600 hover:bg-slate-200'
                }`}
              >
                Paused
              </button>
            </div>

            <div className="w-full sm:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search medication or patient..."
                className="text-xs"
              />
            </div>
          </div>

          {filteredReminders.length === 0 ? (
            <EmptyState
              icon={<Bell className="w-8 h-8 text-navy-300" />}
              title="No medication reminders found"
              description="Configure voice medication reminders from finalized prescriptions in patient profiles or prescriptions console."
              actionLabel="Go to Prescriptions Console"
              onAction={() => navigate('/prescriptions')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/70">
                    <th className="p-3">Medication</th>
                    <th className="p-3">Patient</th>
                    <th className="p-3">Schedule</th>
                    <th className="p-3">Channel</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReminders.map((rem) => (
                    <tr key={rem.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-navy-900">
                        <div>
                          <span>{rem.medicationName}</span>
                          <span className="block text-[10px] text-navy-500 font-normal">{rem.dosageSnapshot}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => navigate(`/patients/${rem.patientId}`)}
                          className="hover:underline font-bold text-brand-600 flex items-center gap-1"
                        >
                          <span>{rem.patientId}</span>
                          <span className="text-navy-700 font-normal">({rem.patientName})</span>
                        </button>
                      </td>
                      <td className="p-3 text-navy-700">
                        <span className="font-mono font-bold text-navy-900">{rem.frequency}</span>
                        <span className="block text-[10px] text-navy-500">{rem.scheduledTimes.join(' • ')}</span>
                      </td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200">
                          {rem.channel.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            rem.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : rem.status === 'PAUSED'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {rem.status}
                        </span>
                      </td>
                      <td className="p-3 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestCall(rem.id)}
                          leftIcon={<Phone className="w-3.5 h-3.5 text-brand-600" />}
                        >
                          Test Call
                        </Button>

                        {rem.status === 'ACTIVE' ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(rem.id, 'PAUSED')}
                            leftIcon={<Pause className="w-3.5 h-3.5 text-amber-600" />}
                            className="text-amber-700 hover:bg-amber-50"
                          >
                            Pause
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleStatusChange(rem.id, 'ACTIVE')}
                            leftIcon={<Play className="w-3.5 h-3.5 text-emerald-600" />}
                            className="text-emerald-700 hover:bg-emerald-50"
                          >
                            Resume
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setActiveReminder(rem);
                            setIsHistoryModalOpen(true);
                          }}
                          leftIcon={<Activity className="w-3.5 h-3.5" />}
                        >
                          History
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Reminder History Modal */}
      <ReminderHistoryModal
        reminder={activeReminder}
        isOpen={isHistoryModalOpen}
        onClose={() => {
          setIsHistoryModalOpen(false);
          setActiveReminder(null);
        }}
        onTestCall={handleTestCall}
      />
    </AppShell>
  );
};
