import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { DocumentUpload, UploadedDocFile } from '../../components/ui/DocumentUpload';
import { useToast } from '../../context/ToastContext';
import { registerDoctor, checkUsernameAvailability } from '../../services/authService';
import {
  User,
  Building,
  Lock,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';

export const DoctorRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form Fields
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const [specialization, setSpecialization] = useState('General Physician');
  const [medicalRegistrationNumber, setMedicalRegistrationNumber] = useState('');
  const [qualification, setQualification] = useState('MBBS, MD');
  const [yearsOfExperience, setYearsOfExperience] = useState('8');
  const [medicalCouncil, setMedicalCouncil] = useState('Medical Council of India');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Real-time username check state
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isUsernameAvailable, setIsUsernameAvailable] = useState<boolean | null>(null);

  // Uploaded Documents
  const [documents, setDocuments] = useState<UploadedDocFile[]>([]);

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Real-time Username Availability Check
  useEffect(() => {
    if (!username.trim() || username.length < 3) {
      setIsUsernameAvailable(null);
      return;
    }

    setIsCheckingUsername(true);
    const timer = setTimeout(async () => {
      const available = await checkUsernameAvailability(username);
      setIsUsernameAvailable(available);
      setIsCheckingUsername(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [username]);

  // Password Strength Calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(password);

  const handleDocumentUploaded = (doc: UploadedDocFile) => {
    setDocuments((prev) => [...prev.filter((d) => d.documentType !== doc.documentType), doc]);
    showToast('Document Attached', `${doc.fileName} uploaded successfully.`, 'success');
  };

  const handleDocumentRemoved = (docType: string) => {
    setDocuments((prev) => prev.filter((d) => d.documentType !== docType));
  };

  const getDoc = (docType: string) => documents.find((d) => d.documentType === docType) || null;

  const validateStep1 = () => {
    const newErr: Record<string, string> = {};
    if (!firstName.trim()) newErr.firstName = 'First name is required';
    if (!lastName.trim()) newErr.lastName = 'Last name is required';
    if (!email.trim() || !email.includes('@')) newErr.email = 'Valid email address is required';
    if (!phone.trim()) newErr.phone = 'Phone number is required';
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const validateStep2 = () => {
    const newErr: Record<string, string> = {};
    if (!medicalRegistrationNumber.trim()) newErr.medicalRegistrationNumber = 'Registration number is required';
    if (!qualification.trim()) newErr.qualification = 'Qualification is required';
    if (!clinicName.trim()) newErr.clinicName = 'Clinic / Hospital name is required';
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const validateStep3 = () => {
    const newErr: Record<string, string> = {};
    if (!username.trim() || username.length < 3) newErr.username = 'Username must be at least 3 characters';
    if (isUsernameAvailable === false) newErr.username = 'Username already exists. Please choose another.';
    if (password.length < 8) newErr.password = 'Password must be at least 8 characters';
    if (password !== confirmPassword) newErr.confirmPassword = 'Passwords do not match';
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const validateStep4 = () => {
    const newErr: Record<string, string> = {};
    if (!getDoc('registration_certificate')) {
      newErr.documents = 'Medical Registration Certificate is required for verification.';
    }
    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep4()) {
      showToast('Validation Error', 'Please upload required registration certificate before submitting.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      const record = await registerDoctor(
        {
          firstName,
          lastName,
          dateOfBirth,
          gender,
          phone,
          email,
          specialization,
          medicalRegistrationNumber,
          qualification,
          yearsOfExperience: parseInt(yearsOfExperience) || 1,
          medicalCouncil,
          clinicName,
          clinicAddress,
          username,
          password,
        },
        documents
      );

      setIsSubmitting(false);
      showToast('Registration Submitted', 'Your registration is awaiting administrator verification.', 'success');
      navigate(`/registration-status?appId=${record.applicationId}`);
    } catch (err: any) {
      setIsSubmitting(false);
      showToast('Registration Error', err.message || 'Failed to submit registration.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl text-center">
        <BrandLogo size="lg" showTagline={false} className="justify-center mb-4" />
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy-900">
          Doctor Registration Portal
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-navy-600">
          Apply for a verified clinical workspace account on CaseFlowAI
        </p>
      </div>

      {/* Wizard Progress Steps Indicator */}
      <div className="sm:mx-auto sm:w-full sm:max-w-2xl mt-6">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-subtle flex items-center justify-between text-xs font-semibold text-navy-600">
          <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-brand-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-navy-400'}`}>1</span>
            <span className="hidden sm:inline">Personal</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-brand-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-navy-400'}`}>2</span>
            <span className="hidden sm:inline">Professional</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-brand-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-navy-400'}`}>3</span>
            <span className="hidden sm:inline">Account</span>
          </div>
          <span className="text-slate-300">•</span>
          <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-brand-600 font-bold' : ''}`}>
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${step >= 4 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-navy-400'}`}>4</span>
            <span className="hidden sm:inline">Documents</span>
          </div>
        </div>
      </div>

      {/* Main Registration Card Form */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-2xl">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3 flex items-center space-x-2 text-brand-700 font-bold text-sm">
                  <User className="w-4 h-4 text-brand-600" />
                  <span>Personal Information</span>
                </div>

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
                      placeholder="e.g. Mehta"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Date of Birth">
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Gender">
                    <Select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      options={[
                        { label: 'Male', value: 'Male' },
                        { label: 'Female', value: 'Female' },
                        { label: 'Other', value: 'Other' },
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Phone Number" required error={errors.phone}>
                    <Input
                      placeholder="+91 98765 12345"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Email Address" required error={errors.email}>
                    <Input
                      type="email"
                      placeholder="dr.rahul@example.med"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {step === 2 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3 flex items-center space-x-2 text-brand-700 font-bold text-sm">
                  <Building className="w-4 h-4 text-brand-600" />
                  <span>Professional Credentials & Clinic Details</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Medical Registration Number" required error={errors.medicalRegistrationNumber}>
                    <Input
                      placeholder="e.g. MCI-99481"
                      value={medicalRegistrationNumber}
                      onChange={(e) => setMedicalRegistrationNumber(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Specialization" required>
                    <Select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      options={[
                        { label: 'General Physician', value: 'General Physician' },
                        { label: 'Cardiologist', value: 'Cardiologist' },
                        { label: 'Pediatrician', value: 'Pediatrician' },
                        { label: 'Dermatologist', value: 'Dermatologist' },
                        { label: 'Neurologist', value: 'Neurologist' },
                        { label: 'Orthopedic Surgeon', value: 'Orthopedic Surgeon' },
                      ]}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Qualification" required error={errors.qualification}>
                    <Input
                      placeholder="e.g. MBBS, MD (Medicine)"
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Years of Experience">
                    <Input
                      type="number"
                      placeholder="e.g. 12"
                      value={yearsOfExperience}
                      onChange={(e) => setYearsOfExperience(e.target.value)}
                    />
                  </FormField>
                </div>

                <FormField label="Medical Council / Authority">
                  <Input
                    placeholder="e.g. Medical Council of India"
                    value={medicalCouncil}
                    onChange={(e) => setMedicalCouncil(e.target.value)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Clinic / Hospital Name" required error={errors.clinicName}>
                    <Input
                      placeholder="e.g. City Heart & Health Care"
                      value={clinicName}
                      onChange={(e) => setClinicName(e.target.value)}
                    />
                  </FormField>

                  <FormField label="Clinic Address">
                    <Input
                      placeholder="e.g. 12 Healthcare Blvd, Sector 4"
                      value={clinicAddress}
                      onChange={(e) => setClinicAddress(e.target.value)}
                    />
                  </FormField>
                </div>
              </div>
            )}

            {/* Step 3: Account Credentials */}
            {step === 3 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3 flex items-center space-x-2 text-brand-700 font-bold text-sm">
                  <Lock className="w-4 h-4 text-brand-600" />
                  <span>Account Login Credentials</span>
                </div>

                {/* Username Field with Availability Check */}
                <FormField
                  label="Desired Username"
                  required
                  error={errors.username}
                  helpText="Use a unique clinical username or email"
                >
                  <div className="relative">
                    <Input
                      placeholder="e.g. dr.rahul.mehta"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs">
                      {isCheckingUsername && (
                        <span className="text-navy-400">Checking...</span>
                      )}
                      {!isCheckingUsername && isUsernameAvailable === true && (
                        <span className="text-emerald-600 font-semibold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Available
                        </span>
                      )}
                      {!isCheckingUsername && isUsernameAvailable === false && (
                        <span className="text-red-600 font-semibold flex items-center gap-1">
                          <X className="w-3.5 h-3.5" /> Unavailable
                        </span>
                      )}
                    </div>
                  </div>
                </FormField>

                <FormField label="Password" required error={errors.password}>
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-navy-500">
                        <span>Password strength:</span>
                        <span className="font-bold">
                          {passScore <= 2 ? 'Weak' : passScore <= 4 ? 'Medium' : 'Strong'}
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden flex gap-0.5">
                        <div className={`h-full flex-1 ${passScore >= 1 ? 'bg-red-500' : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passScore >= 3 ? 'bg-amber-500' : 'bg-transparent'}`} />
                        <div className={`h-full flex-1 ${passScore >= 5 ? 'bg-emerald-500' : 'bg-transparent'}`} />
                      </div>
                    </div>
                  )}
                </FormField>

                <FormField label="Confirm Password" required error={errors.confirmPassword}>
                  <Input
                    type="password"
                    placeholder="Re-enter password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </FormField>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {step === 4 && (
              <div className="space-y-4 animate-fade-in">
                <div className="border-b border-slate-100 pb-3 flex items-center space-x-2 text-brand-700 font-bold text-sm">
                  <FileCheck2 className="w-4 h-4 text-brand-600" />
                  <span>Upload Required Verification Documents</span>
                </div>

                <p className="text-xs text-navy-600 leading-relaxed">
                  An administrator will inspect these documents to verify your medical council license before activating your clinical workspace.
                </p>

                {errors.documents && (
                  <p className="text-xs text-red-600 font-semibold flex items-center">
                    <AlertCircle className="w-3.5 h-3.5 mr-1" /> {errors.documents}
                  </p>
                )}

                <DocumentUpload
                  label="Medical Registration Certificate"
                  documentType="registration_certificate"
                  required
                  value={getDoc('registration_certificate')}
                  onFileUploaded={handleDocumentUploaded}
                  onFileRemoved={handleDocumentRemoved}
                />

                <DocumentUpload
                  label="Professional ID / Medical Council ID"
                  documentType="professional_id"
                  value={getDoc('professional_id')}
                  onFileUploaded={handleDocumentUploaded}
                  onFileRemoved={handleDocumentRemoved}
                />

                <DocumentUpload
                  label="Degree / Specialization Certificate"
                  documentType="degree_certificate"
                  value={getDoc('degree_certificate')}
                  onFileUploaded={handleDocumentUploaded}
                  onFileRemoved={handleDocumentRemoved}
                />
              </div>
            )}

            {/* Navigation & Submit Buttons */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              {step > 1 ? (
                <Button
                  type="button"
                  variant="outline"
                  size="md"
                  onClick={() => setStep(step - 1)}
                  leftIcon={<ArrowLeft className="w-4 h-4" />}
                >
                  Back
                </Button>
              ) : (
                <Link
                  to="/login"
                  className="text-xs font-semibold text-navy-600 hover:text-brand-600"
                >
                  Already registered? Sign In
                </Link>
              )}

              {step < 4 ? (
                <Button
                  type="button"
                  size="md"
                  onClick={handleNextStep}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Continue to Step {step + 1}
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="md"
                  isLoading={isSubmitting}
                  rightIcon={<ShieldCheck className="w-4 h-4" />}
                >
                  Submit Registration
                </Button>
              )}
            </div>
          </form>
        </div>

        {/* Security Footer Notice */}
        <div className="mt-6 text-center text-xs text-navy-500 flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-semibold text-navy-700">CaseFlowAI Clinical Identity Verification Engine</span>
        </div>
      </div>
    </div>
  );
};
