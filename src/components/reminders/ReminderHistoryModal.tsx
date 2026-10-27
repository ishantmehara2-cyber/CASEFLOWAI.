import React from 'react';
import { MedicationReminderRecord } from '../../types/reminder';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Bell, Phone, Clock, CheckCircle2, AlertTriangle, ShieldCheck, Activity } from 'lucide-react';

interface ReminderHistoryModalProps {
  reminder: MedicationReminderRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onTestCall: (reminderId: string) => void;
}

export const ReminderHistoryModal: React.FC<ReminderHistoryModalProps> = ({
  reminder,
  isOpen,
  onClose,
  onTestCall,
}) => {
  if (!isOpen || !reminder) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Reminder History: ${reminder.medicationName}`}
      subtitle={`Patient: ${reminder.patientName} (${reminder.patientId})`}
      footer={
        <>
          <Button
            size="sm"
            variant="outline"
            onClick={() => onTestCall(reminder.id)}
            leftIcon={<Phone className="w-4 h-4 text-brand-600" />}
          >
            Send Test Voice Call
          </Button>
          <Button size="sm" onClick={onClose}>
            Close
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {/* Reminder Details Box */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-900 text-sm">{reminder.medicationName} ({reminder.dosageSnapshot})</span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
              {reminder.status}
            </span>
          </div>
          <p className="text-navy-700"><strong className="text-navy-500">Frequency:</strong> {reminder.frequency} • <strong className="text-navy-500">Times:</strong> {reminder.scheduledTimes.join(', ')}</p>
          <p className="text-navy-700"><strong className="text-navy-500">Phone:</strong> <span className="font-mono font-bold text-navy-900">{reminder.patientPhone}</span></p>
          <p className="text-navy-700"><strong className="text-navy-500">Prescription:</strong> #{reminder.prescriptionNumber}</p>
        </div>

        {/* Delivery Events Log */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-4 h-4 text-brand-600" /> Delivery Event Log ({reminder.events?.length || 0})
          </h4>

          {!reminder.events || reminder.events.length === 0 ? (
            <p className="text-xs text-navy-400 py-3 text-center">No delivery events logged yet.</p>
          ) : (
            <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
              {reminder.events.map((evt) => (
                <div key={evt.id} className="bg-white p-3 rounded-xl border border-slate-200/85 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-navy-900">{evt.channel.replace('_', ' ')}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${evt.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                        {evt.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-navy-500 font-mono">Scheduled: {evt.scheduledAt} • Provider: {evt.provider}</p>
                  </div>

                  {evt.callDuration && (
                    <span className="text-[11px] font-mono font-bold text-navy-700 bg-slate-100 px-2 py-1 rounded">
                      {evt.callDuration}s call
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
