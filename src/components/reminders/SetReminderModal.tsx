import React, { useState } from 'react';
import { Prescription, PrescriptionItem } from '../../types/consultation';
import { Patient, Doctor } from '../../types';
import { createMedicationReminder } from '../../services/medicationReminderService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useToast } from '../../context/ToastContext';
import { Bell, Phone, Clock, Calendar, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

interface SetReminderModalProps {
  prescription: Prescription;
  item: PrescriptionItem;
  patient: Patient;
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onReminderCreated: () => void;
}

export const SetReminderModal: React.FC<SetReminderModalProps> = ({
  prescription,
  item,
  patient,
  doctor,
  isOpen,
  onClose,
  onReminderCreated,
}) => {
  const { showToast } = useToast();

  const [scheduledTimes, setScheduledTimes] = useState<string[]>(
    item.frequency.toLowerCase().includes('twice') || item.frequency.toLowerCase().includes('bd')
      ? ['08:00 AM', '08:00 PM']
      : item.frequency.toLowerCase().includes('thrice') || item.frequency.toLowerCase().includes('tds')
      ? ['08:00 AM', '02:00 PM', '08:00 PM']
      : ['08:00 AM']
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const isAsNeeded = item.frequency.toLowerCase().includes('sos') || item.frequency.toLowerCase().includes('as needed');

  const handleActivate = async () => {
    if (isAsNeeded) {
      showToast('As Needed Medication', 'Medications prescribed as needed (SOS) do not support automatic recurring reminders.', 'warning');
      return;
    }

    if (!patient.phone) {
      showToast('Phone Number Required', 'Patient record must include a valid phone number to configure voice reminders.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await createMedicationReminder(
        prescription,
        item,
        patient,
        { id: doctor.id, name: doctor.name, clinicName: doctor.clinicName },
        scheduledTimes,
        'VOICE_CALL'
      );

      setIsSubmitting(false);
      showToast('Reminder Activated', `Automated voice reminder scheduled for ${item.medicineName}.`, 'success');
      onReminderCreated();
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      showToast('Activation Error', err.message || 'Failed to activate reminder.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Set Medication Voice Reminder"
      subtitle={`Configure automated telephony reminder for ${item.medicineName}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleActivate}
            isLoading={isSubmitting}
            disabled={isAsNeeded || !patient.phone}
            leftIcon={<Bell className="w-4 h-4" />}
          >
            {isSubmitting ? 'Activating...' : 'Activate Reminder'}
          </Button>
        </>
      }
    >
      <div className="space-y-4 text-xs">
        {isAsNeeded && (
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl text-amber-900 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>As Needed (SOS) Medication:</strong> Automatic recurring reminders are not available for PRN/SOS medications.
            </p>
          </div>
        )}

        {!patient.phone && (
          <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-red-900 flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <p className="leading-relaxed">
              <strong>Patient Phone Missing:</strong> Please update patient contact details with a valid phone number before activating voice calls.
            </p>
          </div>
        )}

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-navy-900 text-sm">{item.medicineName} {item.strength ? `(${item.strength})` : ''}</span>
            <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold text-[10px] border border-brand-100">
              {item.frequency}
            </span>
          </div>
          <p className="text-navy-700"><strong className="text-navy-500">Dosage:</strong> {item.dosage}</p>
          <p className="text-navy-700"><strong className="text-navy-500">Duration:</strong> {item.duration}</p>
          <p className="text-navy-700"><strong className="text-navy-500">Patient Phone:</strong> <span className="font-mono font-bold text-navy-900">{patient.phone || 'Not recorded'}</span></p>
        </div>

        <div className="space-y-2">
          <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider">
            Scheduled Daily Call Times
          </label>
          <div className="flex flex-wrap gap-2">
            {scheduledTimes.map((time, idx) => (
              <span key={idx} className="px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 font-mono font-bold border border-brand-200 text-xs inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                {time}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-navy-500">Times are automatically derived from prescription frequency ({item.frequency}).</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-blue-900 space-y-1">
          <div className="flex items-center space-x-2 font-bold text-[11px] text-blue-950">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Telephony Voice Call Channel</span>
          </div>
          <p className="text-[11px] text-blue-800 leading-relaxed">
            The patient will receive a privacy-compliant automated voice call at the scheduled times announcing their medication reminder.
          </p>
        </div>
      </div>
    </Modal>
  );
};
