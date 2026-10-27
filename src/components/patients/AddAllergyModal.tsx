import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { addPatientAllergy } from '../../services/patientMedicalMemoryService';
import { PatientAllergy } from '../../types';
import { useToast } from '../../context/ToastContext';

interface AddAllergyModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  doctorName?: string;
  onAllergyAdded: (a: PatientAllergy) => void;
}

export const AddAllergyModal: React.FC<AddAllergyModalProps> = ({
  isOpen,
  onClose,
  patientId,
  doctorName = 'Dr. Priya Sharma',
  onAllergyAdded,
}) => {
  const { showToast } = useToast();
  const [allergen, setAllergen] = useState('');
  const [reaction, setReaction] = useState('');
  const [severity, setSeverity] = useState<'Mild' | 'Moderate' | 'Severe'>('Moderate');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allergen.trim() || !reaction.trim()) {
      showToast('Validation Error', 'Please enter allergen and reaction.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const newAllergy = await addPatientAllergy(
        patientId,
        { allergen, reaction, severity, notes, recordedBy: doctorName },
        doctorName
      );
      setIsLoading(false);
      showToast('Allergy Alert Saved', `Added ${severity} alert for ${allergen}.`, 'warning');
      onAllergyAdded(newAllergy);
      onClose();
      setAllergen('');
      setReaction('');
      setNotes('');
    } catch (e) {
      setIsLoading(false);
      showToast('Error', 'Failed to save allergy alert.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Patient Allergy Alert"
      subtitle="Critical allergy warning for clinical workspace prominence"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Allergy Alert
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Allergen Name" required>
          <Input
            placeholder="e.g. Penicillin, Sulfa Drugs, NSAIDs, Latex"
            value={allergen}
            onChange={(e) => setAllergen(e.target.value)}
          />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Clinical Reaction" required>
            <Input
              placeholder="e.g. Skin Rash, Anaphylaxis, Facial Swelling"
              value={reaction}
              onChange={(e) => setReaction(e.target.value)}
            />
          </FormField>

          <FormField label="Severity Level">
            <Select
              value={severity}
              onChange={(e) => setSeverity(e.target.value as any)}
              options={[
                { label: 'Mild', value: 'Mild' },
                { label: 'Moderate', value: 'Moderate' },
                { label: 'Severe (Life-threatening)', value: 'Severe' },
              ]}
            />
          </FormField>
        </div>

        <FormField label="Clinical Notes & Precautions">
          <Textarea
            placeholder="Specific contraindications, past incident context..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="text-xs"
          />
        </FormField>
      </form>
    </Modal>
  );
};
