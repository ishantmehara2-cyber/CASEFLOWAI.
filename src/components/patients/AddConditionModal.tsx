import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { addPatientCondition } from '../../services/patientMedicalMemoryService';
import { MedicalCondition } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AddConditionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  doctorName?: string;
  onConditionAdded: (c: MedicalCondition) => void;
}

export const AddConditionModal: React.FC<AddConditionModalProps> = ({
  isOpen,
  onClose,
  patientId,
  doctorName = 'Dr. Priya Sharma',
  onConditionAdded,
}) => {
  const { showToast } = useToast();
  const [condition, setCondition] = useState('');
  const [status, setStatus] = useState<'Active' | 'Resolved' | 'Managed'>('Active');
  const [diagnosedDate, setDiagnosedDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!condition.trim()) {
      showToast('Validation Error', 'Please enter a condition name.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newCond = await addPatientCondition(
        patientId,
        { condition, status, diagnosedDate, notes },
        doctorName
      );
      setIsLoading(false);
      showToast('Condition Saved', `${condition} added to patient medical memory.`, 'success');
      onConditionAdded(newCond);
      onClose();
      setCondition('');
      setNotes('');
    } catch (e) {
      setIsLoading(false);
      showToast('Error', 'Failed to save condition.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Medical Condition"
      subtitle="Add persistent condition to patient longitudinal memory"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Condition
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Condition / Diagnosis" required>
          <Input
            placeholder="e.g. Type 2 Diabetes Mellitus"
            value={condition}
            onChange={(e) => setCondition(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Current Clinical Status">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              options={[
                { label: 'Active', value: 'Active' },
                { label: 'Managed', value: 'Managed' },
                { label: 'Resolved', value: 'Resolved' },
              ]}
            />
          </FormField>

          <FormField label="Diagnosed Date">
            <Input
              type="date"
              value={diagnosedDate}
              onChange={(e) => setDiagnosedDate(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Clinical Notes (Optional)">
          <Textarea
            placeholder="Add relevant notes, treatment response, or HbA1c/BP baselines..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
        </FormField>
      </form>
    </Modal>
  );
};
