import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { addPatientVisit } from '../../services/patientMedicalMemoryService';
import { PatientVisit, Doctor } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AddVisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  doctor: Doctor;
  onVisitAdded: (v: PatientVisit) => void;
}

export const AddVisitModal: React.FC<AddVisitModalProps> = ({
  isOpen,
  onClose,
  patientId,
  doctor,
  onVisitAdded,
}) => {
  const { showToast } = useToast();
  const [visitType, setVisitType] = useState<'Initial Consultation' | 'Follow-up' | 'General Consultation' | 'Review'>('General Consultation');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'Completed' | 'Scheduled' | 'In Progress'>('Completed');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      showToast('Validation Error', 'Please enter chief complaint.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newVisit = await addPatientVisit(
        patientId,
        {
          doctorId: doctor.id,
          doctorName: doctor.name,
          clinicName: doctor.clinicName,
          visitType,
          chiefComplaint,
          notes,
          status,
        },
        doctor
      );
      setIsLoading(false);
      showToast('Clinical Encounter Saved', `${visitType} recorded successfully.`, 'success');
      onVisitAdded(newVisit);
      onClose();
      setChiefComplaint('');
      setNotes('');
    } catch (e) {
      setIsLoading(false);
      showToast('Error', 'Failed to save visit record.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Clinical Visit / Encounter"
      subtitle="Log patient encounter to longitudinal medical memory"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Visit Record
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Visit Type">
            <Select
              value={visitType}
              onChange={(e) => setVisitType(e.target.value as any)}
              options={[
                { label: 'General Consultation', value: 'General Consultation' },
                { label: 'Follow-up Visit', value: 'Follow-up' },
                { label: 'Initial Intake Consultation', value: 'Initial Consultation' },
                { label: 'Report Review', value: 'Review' },
              ]}
            />
          </FormField>

          <FormField label="Encounter Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { label: 'Completed', value: 'Completed' },
                { label: 'In Progress', value: 'In Progress' },
                { label: 'Scheduled', value: 'Scheduled' },
              ]}
            />
          </FormField>
        </div>

        <FormField label="Chief Complaint / Reason for Visit" required>
          <Input
            placeholder="e.g. Mild fever, dry cough for 3 days and blood sugar review"
            value={chiefComplaint}
            onChange={(e) => setChiefComplaint(e.target.value)}
          />
        </FormField>

        <FormField label="Vitals & Clinical Notes">
          <Textarea
            placeholder="Vitals (BP, Temp, Pulse), physical findings, and initial observations..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
        </FormField>
      </form>
    </Modal>
  );
};
