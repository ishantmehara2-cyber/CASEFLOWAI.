import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { PatientPhotoUpload } from '../patients/PatientPhotoUpload';
import { useToast } from '../../context/ToastContext';
import { Patient } from '../../types';
import { addPatient } from '../../services/patientService';
import { logActivity } from '../../services/activityService';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, User, Phone, ShieldCheck, ArrowRight, UserPlus, HeartPulse } from 'lucide-react';

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
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { session } = useAuth();

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('28');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');

  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergiesText, setAllergiesText] = useState('');
  const [existingConditionsText, setExistingConditionsText] = useState('');

  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');

  const [profilePhoto, setProfilePhoto] = useState<string | undefined>(undefined);

  // States
  const [isLoading, setIsLoading] = useState(false);
  const [createdPatient, setCreatedPatient] = useState<Patient | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setDateOfBirth('');
    setAge('28');
    setGender('Male');
    setPhone('');
    setEmail('');
    setAddress('');
    setCity('');
    setState('');
    setPincode('');
    setBloodGroup('O+');
    setAllergiesText('');
    setExistingConditionsText('');
    setEmergencyContactName('');
    setEmergencyContactPhone('');
    setProfilePhoto(undefined);
    setCreatedPatient(null);
    setErrors({});
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!phone.trim() || phone.length < 10) newErrors.phone = 'Please enter a valid phone number.';
    if (email && (!email.includes('@') || !email.includes('.'))) newErrors.email = 'Please enter a valid email address.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      showToast('Validation Error', 'Please correct highlighted errors in registration form.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      const doctorId = session?.doctorId || session?.userId || 'doc-001';

      const newPatient = await addPatient({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        name: fullName,
        age: parseInt(age) || 28,
        dateOfBirth,
        gender,
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        bloodGroup,
        allergiesText: allergiesText.trim(),
        existingConditionsText: existingConditionsText.trim(),
        emergencyContactName: emergencyContactName.trim(),
        emergencyContactPhone: emergencyContactPhone.trim(),
        profilePhoto,
        doctorId,
      });

      await logActivity({
        type: 'patient',
        title: 'New patient registered',
        subtitle: `${newPatient.name} (${newPatient.patientId})`,
      });

      setIsLoading(false);
      setCreatedPatient(newPatient);
      showToast('Patient Registered Successfully', `${fullName} (${newPatient.patientId}) added to database.`, 'success');

      if (onPatientAdded) onPatientAdded(newPatient);
    } catch (err) {
      setIsLoading(false);
      showToast('Registration Error', 'Failed to save patient record. Please try again.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetForm();
        onClose();
      }}
      title={createdPatient ? 'Patient Intake Complete' : 'Register New Patient'}
      subtitle={createdPatient ? 'CaseFlowAI Patient ID generated successfully' : 'Create clinical intake record for CaseFlowAI'}
      maxWidth="lg"
      footer={
        createdPatient ? (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                onClose();
              }}
            >
              Back to Patients Directory
            </Button>
            <Button
              size="sm"
              onClick={() => {
                const targetId = createdPatient.id;
                resetForm();
                onClose();
                navigate(`/patients/${targetId}`);
              }}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              View Patient Profile
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetForm();
                onClose();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} isLoading={isLoading}>
              {isLoading ? 'Creating Patient...' : 'Create Patient Record'}
            </Button>
          </>
        )
      }
    >
      {createdPatient ? (
        /* Success Screen State */
        <div className="py-6 px-4 text-center space-y-4 animate-fade-in">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto shadow-subtle border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 uppercase tracking-wider inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Patient Registered Successfully
            </span>
            <h3 className="text-2xl font-extrabold text-navy-900 mt-3">
              {createdPatient.name}
            </h3>
            <p className="text-sm font-mono font-bold text-brand-700 mt-1">
              Patient ID: {createdPatient.patientId}
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-navy-700 max-w-md mx-auto space-y-1 text-left">
            <p className="font-bold text-navy-900 border-b border-slate-200 pb-1 uppercase tracking-wider text-[10px]">
              Clinical Intake Summary
            </p>
            <p><span className="text-navy-500">Gender / Age:</span> {createdPatient.gender || 'Patient'} • {createdPatient.age} yrs</p>
            <p><span className="text-navy-500">Contact:</span> {createdPatient.phone || 'N/A'}</p>
            <p><span className="text-navy-500">Blood Group:</span> {createdPatient.bloodGroup || 'O+'}</p>
            <p><span className="text-navy-500">Secure QR Identity:</span> Generated & Active</p>
          </div>
        </div>
      ) : (
        /* Registration Form State */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Patient Photo Upload */}
          <PatientPhotoUpload
            value={profilePhoto}
            onChange={setProfilePhoto}
          />

          {/* Section 1: Personal Information */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-600" /> Personal Information
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="First Name" required error={errors.firstName}>
                <Input
                  placeholder="e.g. Rahul"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </FormField>

              <FormField label="Last Name" required error={errors.lastName}>
                <Input
                  placeholder="e.g. Sharma"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="Date of Birth">
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </FormField>

              <FormField label="Age (Years)" required>
                <Input
                  type="number"
                  placeholder="e.g. 28"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </FormField>

              <FormField label="Gender" required>
                <Select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  options={[
                    { label: 'Male', value: 'Male' },
                    { label: 'Female', value: 'Female' },
                    { label: 'Other', value: 'Other' },
                    { label: 'Prefer not to say', value: 'Prefer not to say' },
                  ]}
                />
              </FormField>
            </div>
          </div>

          {/* Section 2: Contact Information */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-600" /> Contact Information
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Phone Number" required error={errors.phone}>
                <Input
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </FormField>

              <FormField label="Email Address" error={errors.email}>
                <Input
                  type="email"
                  placeholder="rahul@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </FormField>
            </div>

            <FormField label="Residential Address">
              <Input
                placeholder="House / Street / Apartment"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField label="City">
                <Input
                  placeholder="e.g. New Delhi"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </FormField>

              <FormField label="State">
                <Input
                  placeholder="e.g. Delhi"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </FormField>

              <FormField label="PIN Code">
                <Input
                  placeholder="e.g. 110001"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Section 3: Medical Information (Optional) */}
          <div className="space-y-3">
            <p className="text-xs font-bold text-brand-700 uppercase tracking-wider border-b border-slate-100 pb-1 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-brand-600" /> Initial Medical Baseline (Optional)
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    { label: 'Unknown', value: 'Unknown' },
                  ]}
                />
              </FormField>

              <FormField label="Known Allergies (Optional)">
                <Input
                  placeholder="e.g. Penicillin, Sulfa"
                  value={allergiesText}
                  onChange={(e) => setAllergiesText(e.target.value)}
                />
              </FormField>

              <FormField label="Existing Conditions (Optional)">
                <Input
                  placeholder="e.g. Type 2 Diabetes, Hypertension"
                  value={existingConditionsText}
                  onChange={(e) => setExistingConditionsText(e.target.value)}
                />
              </FormField>
            </div>
          </div>

          {/* Section 4: Emergency Contact (Optional) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-slate-100 pt-3">
            <FormField label="Emergency Contact Name">
              <Input
                placeholder="e.g. Sunita Sharma (Spouse)"
                value={emergencyContactName}
                onChange={(e) => setEmergencyContactName(e.target.value)}
              />
            </FormField>

            <FormField label="Emergency Contact Phone">
              <Input
                placeholder="+91 98765 00000"
                value={emergencyContactPhone}
                onChange={(e) => setEmergencyContactPhone(e.target.value)}
              />
            </FormField>
          </div>
        </form>
      )}
    </Modal>
  );
};
