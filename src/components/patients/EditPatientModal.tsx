import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { updatePatientOverview } from '../../services/patientMedicalMemoryService';
import { Patient } from '../../types';
import { useToast } from '../../context/ToastContext';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  doctorName?: string;
  onPatientUpdated: (p: Patient) => void;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctorName = 'Dr. Priya Sharma',
  onPatientUpdated,
}) => {
  const { showToast } = useToast();
  const [name, setName] = useState(patient.name);
  const [age, setAge] = useState(patient.age.toString());
  const [gender, setGender] = useState(patient.gender || 'Male');
  const [phone, setPhone] = useState(patient.phone || '');
  const [email, setEmail] = useState(patient.email || '');
  const [bloodGroup, setBloodGroup] = useState(patient.bloodGroup || 'O+');
  const [address, setAddress] = useState(patient.address || '');
  const [emergencyName, setEmergencyName] = useState(patient.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergencyContactPhone || '');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast('Validation Error', 'Please enter patient name.', 'error');
      return;
    }

    setIsLoading(true);
    try {
      const updated = await updatePatientOverview(
        patient.id,
        {
          name,
          age: parseInt(age) || patient.age,
          gender: gender as any,
          phone,
          email,
          bloodGroup,
          address,
          emergencyContactName: emergencyName,
          emergencyContactPhone: emergencyPhone,
        },
        doctorName
      );
      setIsLoading(false);
      showToast('Patient Profile Updated', 'Patient demographic details saved.', 'success');
      onPatientUpdated(updated);
      onClose();
    } catch (e) {
      setIsLoading(false);
      showToast('Error', 'Failed to update patient profile.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Patient Profile"
      subtitle="Update demographic, contact, and emergency details"
      maxWidth="lg"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Full Name" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </FormField>

          <FormField label="Age">
            <Input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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

          <FormField label="Blood Group">
            <Select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              options={[
                { label: 'O+', value: 'O+' },
                { label: 'O-', value: 'O-' },
                { label: 'A+', value: 'A+' },
                { label: 'A-', value: 'A-' },
                { label: 'B+', value: 'B+' },
                { label: 'B-', value: 'B-' },
                { label: 'AB+', value: 'AB+' },
                { label: 'AB-', value: 'AB-' },
              ]}
            />
          </FormField>

          <FormField label="Phone Number">
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Email Address">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </FormField>

          <FormField label="Residential Address">
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 14 Sector 9, New Delhi"
            />
          </FormField>
        </div>

        <div className="border-t border-slate-100 pt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="Emergency Contact Name">
            <Input
              value={emergencyName}
              onChange={(e) => setEmergencyName(e.target.value)}
              placeholder="e.g. Sunita Sharma (Spouse)"
            />
          </FormField>

          <FormField label="Emergency Contact Phone">
            <Input
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="+91 98765 00000"
            />
          </FormField>
        </div>
      </form>
    </Modal>
  );
};
