import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { FileUpload } from '../ui/FileUpload';
import { useToast } from '../../context/ToastContext';
import { Patient } from '../../types';
import { addPatient } from '../../services/patientService';
import { logActivity } from '../../services/activityService';

interface AddPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPatientAdded?: (patient: Patient) => void;
}

export const AddPatientModal: React.FC<AddPatientModalProps> = ({
  isOpen,
  onClose,
  onPatientAdded,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Please enter patient full name.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const newPatient = await addPatient({
        name,
        age: parseInt(age) || 30,
        gender,
        phone,
        email,
      });

      await logActivity({
        type: 'patient',
        title: 'New patient registered',
        subtitle: `${newPatient.name} (${newPatient.patientId})`,
      });

      showToast('Patient Registered', `${name} (${newPatient.patientId}) added to clinical system.`, 'success');

      if (onPatientAdded) onPatientAdded(newPatient);

      setIsLoading(false);
      onClose();
      // Reset form
      setName('');
      setAge('');
      setPhone('');
      setEmail('');
    } catch (err) {
      setIsLoading(false);
      showToast('Registration Error', 'Failed to save patient record. Please try again.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Register New Patient"
      subtitle="Create clinical intake record for CaseFlowAI"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Patient Record
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <Input
              placeholder="e.g. Ananya Roy"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Age" required>
            <Input
              type="number"
              placeholder="e.g. 32"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Gender">
            <Select
              value={gender}
              onChange={(e) => setGender(e.target.value as any)}
              options={[
                { label: 'Male', value: 'Male' },
                { label: 'Female', value: 'Female' },
                { label: 'Other', value: 'Other' },
              ]}
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              placeholder="+91 98765 00000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
        </div>

        <FormField label="Email Address">
          <Input
            type="email"
            placeholder="patient@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </FormField>

        <FormField label="Patient Photo / Intake ID Scan (Optional)">
          <FileUpload label="Upload intake scan or registration photo" />
        </FormField>
      </form>
    </Modal>
  );
};
