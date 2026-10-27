import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { PageLoader } from '../../components/ui/PageLoader';
import { useToast } from '../../context/ToastContext';
import { getCurrentDoctor, updateDoctorProfile, uploadDoctorProfilePhoto, removeDoctorProfilePhoto } from '../../services/doctorService';
import { Doctor } from '../../types';
import {
  User,
  Stethoscope,
  Building,
  Phone,
  Sparkles,
  ShieldCheck,
  Save,
  RotateCcw,
  Upload,
  Trash2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Info,
  Calendar,
  Award,
  MapPin,
  Globe,
  Mail,
  FileText,
  BadgeCheck,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'clinic' | 'contact' | 'branding' | 'account'>('profile');

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [initialData, setInitialData] = useState<Partial<Doctor>>({});
  const [formData, setFormData] = useState<{
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    specialization: string;
    qualification: string;
    yearsOfExperience: number | string;
    medicalCouncil: string;
    medicalRegistrationNumber: string;
    clinicName: string;
    clinicAddress: string;
    clinicCity: string;
    clinicState: string;
    clinicPin: string;
    clinicPhone: string;
    clinicEmail: string;
    clinicWebsite: string;
    clinicLicenseNumber: string;
    email: string;
  }>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    gender: '',
    phone: '',
    specialization: '',
    qualification: '',
    yearsOfExperience: 1,
    medicalCouncil: '',
    medicalRegistrationNumber: '',
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicPin: '',
    clinicPhone: '',
    clinicEmail: '',
    clinicWebsite: '',
    clinicLicenseNumber: '',
    email: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imgError, setImgError] = useState<boolean>(false);

  const loadDoctorProfile = useCallback(async () => {
    setIsLoading(true);
    try {
      const doc = await getCurrentDoctor();
      setDoctor(doc);
      setImgError(false);

      const parsedData = {
        firstName: doc.firstName || '',
        lastName: doc.lastName || '',
        dateOfBirth: doc.dateOfBirth || '',
        gender: doc.gender || 'Male',
        phone: doc.phone || '',
        specialization: doc.specialization || '',
        qualification: doc.qualification || '',
        yearsOfExperience: doc.yearsOfExperience !== undefined ? doc.yearsOfExperience : 1,
        medicalCouncil: doc.medicalCouncil || '',
        medicalRegistrationNumber: doc.medicalRegistrationNumber || '',
        clinicName: doc.clinicName || '',
        clinicAddress: doc.clinicAddress || '',
        clinicCity: doc.clinicCity || '',
        clinicState: doc.clinicState || '',
        clinicPin: doc.clinicPin || '',
        clinicPhone: doc.clinicPhone || doc.phone || '',
        clinicEmail: doc.clinicEmail || doc.email || '',
        clinicWebsite: doc.clinicWebsite || '',
        clinicLicenseNumber: doc.clinicLicenseNumber || '',
        email: doc.email || '',
      };

      setFormData(parsedData);
      setInitialData(parsedData);
    } catch (err: any) {
      console.error('Failed to load doctor settings:', err);
      showToast('Error', 'Unable to load doctor settings. Please refresh.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadDoctorProfile();
  }, [loadDoctorProfile]);

  // Detect unsaved changes
  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!formData.specialization.trim()) newErrors.specialization = 'Specialization is required.';
    if (!formData.qualification.trim()) newErrors.qualification = 'Qualification is required.';
    if (!formData.clinicName.trim()) newErrors.clinicName = 'Clinic name is required.';

    if (formData.yearsOfExperience !== '' && (isNaN(Number(formData.yearsOfExperience)) || Number(formData.yearsOfExperience) < 0)) {
      newErrors.yearsOfExperience = 'Years of experience must be a valid positive number.';
    }

    if (formData.clinicPin && !/^\d{6}$/.test(formData.clinicPin.trim())) {
      newErrors.clinicPin = 'PIN code must be a 6-digit Indian PIN format.';
    }

    if (formData.clinicEmail && !/\S+@\S+\.\S+/.test(formData.clinicEmail.trim())) {
      newErrors.clinicEmail = 'Please enter a valid clinic email address.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      showToast('Validation Error', 'Please correct the highlighted errors before saving.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      const updated = await updateDoctorProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        dateOfBirth: formData.dateOfBirth,
        gender: formData.gender,
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        yearsOfExperience: Number(formData.yearsOfExperience) || 0,
        medicalCouncil: formData.medicalCouncil.trim(),
        clinicName: formData.clinicName.trim(),
        clinicAddress: formData.clinicAddress.trim(),
        clinicCity: formData.clinicCity.trim(),
        clinicState: formData.clinicState.trim(),
        clinicPin: formData.clinicPin.trim(),
        clinicPhone: formData.clinicPhone.trim(),
        clinicEmail: formData.clinicEmail.trim(),
        clinicWebsite: formData.clinicWebsite.trim(),
        clinicLicenseNumber: formData.clinicLicenseNumber.trim(),
      });

      setDoctor(updated);
      setInitialData(formData);
      showToast('Profile Updated Successfully', `Doctor profile and clinic credentials for Dr. ${updated.firstName} ${updated.lastName} have been saved.`, 'success');
    } catch (err: any) {
      console.error('Failed to update doctor profile:', err);
      showToast('Update Failed', err.message || 'Unable to update profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    setFormData(initialData as any);
    setErrors({});
    showToast('Changes Discarded', 'Reverted form values to last saved state.', 'info');
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingPhoto(true);
    try {
      const photoUrl = await uploadDoctorProfilePhoto(file);
      if (doctor) {
        setDoctor({ ...doctor, profilePhoto: photoUrl });
      }
      setImgError(false);
      showToast('Photo Uploaded', 'Profile photo updated successfully.', 'success');
    } catch (err: any) {
      console.error('Photo upload error:', err);
      showToast('Upload Error', err.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      const updated = await removeDoctorProfilePhoto();
      setDoctor(updated);
      setImgError(false);
      showToast('Photo Removed', 'Profile photo cleared. Displaying initials fallback.', 'info');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to remove photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const getInitials = () => {
    const fn = formData.firstName || doctor?.firstName || '';
    const ln = formData.lastName || doctor?.lastName || '';
    if (fn && ln) return `${fn.charAt(0)}${ln.charAt(0)}`.toUpperCase();
    if (doctor?.name) {
      const parts = doctor.name.replace(/^Dr\.\s*/i, '').trim().split(' ').filter(Boolean);
      if (parts.length >= 2) return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase();
    }
    return 'DR';
  };

  if (isLoading) {
    return (
      <AppShell doctor={doctor || undefined}>
        <PageLoader message="Loading doctor credentials & clinic settings..." />
      </AppShell>
    );
  }

  const specializationsList = [
    { label: 'General Physician', value: 'General Physician' },
    { label: 'Cardiologist', value: 'Cardiologist' },
    { label: 'Pediatrician', value: 'Pediatrician' },
    { label: 'Dermatologist', value: 'Dermatologist' },
    { label: 'Neurologist', value: 'Neurologist' },
    { label: 'Orthopedic Surgeon', value: 'Orthopedic Surgeon' },
    { label: 'Gynecologist', value: 'Gynecologist' },
    { label: 'Psychiatrist', value: 'Psychiatrist' },
    { label: 'ENT Specialist', value: 'ENT Specialist' },
    { label: 'Ophthalmologist', value: 'Ophthalmologist' },
    { label: 'General Surgeon', value: 'General Surgeon' },
    { label: 'Oncologist', value: 'Oncologist' },
    { label: 'Pulmonologist', value: 'Pulmonologist' },
    { label: 'Gastroenterologist', value: 'Gastroenterologist' },
    { label: 'Radiologist', value: 'Radiologist' },
    { label: 'Urologist', value: 'Urologist' },
    { label: 'Other Specialization', value: 'Other' },
  ];

  return (
    <AppShell doctor={doctor || undefined}>
      <div className="space-y-6 pb-12">
        {/* Top Title & Header Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
                Clinic & Profile Settings
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 inline-flex items-center gap-1">
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Doctor Account
              </span>
            </div>
            <p className="text-xs font-medium text-navy-500 mt-1">
              Manage your persistent clinical credentials, contact details, and clinic branding.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {isDirty && (
              <Button
                variant="outline"
                size="md"
                onClick={handleDiscard}
                disabled={isSaving}
                leftIcon={<RotateCcw className="w-4 h-4" />}
              >
                Discard Changes
              </Button>
            )}

            <Button
              size="md"
              onClick={handleSave}
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>

        {/* Unsaved Changes Warning Banner */}
        {isDirty && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle animate-fade-in">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">You have unsaved changes</p>
                <p className="text-[11px] text-amber-800">
                  Save your changes to update your profile across the dashboard and reports.
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <Button size="sm" variant="outline" onClick={handleDiscard} className="border-amber-300 text-amber-900 hover:bg-amber-100">
                Discard
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={isSaving}>
                Save Changes
              </Button>
            </div>
          </div>
        )}

        {/* Main Grid: Sidebar Navigation + Settings Content Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Settings Left Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-1">
            <nav className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-subtle space-y-1">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'profile'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <User className="w-4 h-4 text-brand-600" />
                <span>Doctor Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('professional')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'professional'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-brand-600" />
                <span>Professional Credentials</span>
              </button>

              <button
                onClick={() => setActiveTab('clinic')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'clinic'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Building className="w-4 h-4 text-brand-600" />
                <span>Clinic Information</span>
              </button>

              <button
                onClick={() => setActiveTab('contact')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'contact'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Phone className="w-4 h-4 text-brand-600" />
                <span>Contact Details</span>
              </button>

              <button
                onClick={() => setActiveTab('branding')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'branding'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <Sparkles className="w-4 h-4 text-brand-600" />
                <span>Clinic Branding (Preview)</span>
              </button>

              <button
                onClick={() => setActiveTab('account')}
                className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'account'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200 shadow-subtle'
                    : 'text-navy-600 hover:bg-slate-50 hover:text-navy-900'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-brand-600" />
                <span>Account & Security</span>
              </button>
            </nav>

            {/* Application Info Badge Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-subtle space-y-2">
              <p className="text-[10px] font-bold text-navy-400 uppercase tracking-wider">Verification File</p>
              <p className="text-xs font-mono font-bold text-navy-900">{doctor?.applicationId || 'CF-APP-1001'}</p>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-navy-600">
                <span>Approval Status:</span>
                <span className="font-bold text-emerald-700">APPROVED</span>
              </div>
            </div>
          </div>

          {/* Settings Tab Main Content Panel */}
          <div className="lg:col-span-9 space-y-6">
            {/* TAB 1: DOCTOR PROFILE */}
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-fade-in">
                {/* Photo Card */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Profile Photo</h2>
                    <p className="text-xs text-navy-500">
                      Upload your professional doctor headshot. Displayed in consultations and prescription exports.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                    {/* Photo Box */}
                    <div className="relative shrink-0">
                      {doctor?.profilePhoto && !imgError ? (
                        <img
                          src={doctor.profilePhoto}
                          alt={doctor.name}
                          className="w-24 h-24 rounded-full object-cover border-4 border-brand-100 shadow-subtle"
                          onError={() => setImgError(true)}
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-600 to-navy-900 text-white font-extrabold text-2xl flex items-center justify-center border-4 border-brand-100 shadow-subtle tracking-widest">
                          {getInitials()}
                        </div>
                      )}

                      {isUploadingPhoto && (
                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-xs">
                          <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="space-y-3 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handlePhotoUpload}
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          className="hidden"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          isLoading={isUploadingPhoto}
                          leftIcon={<Upload className="w-4 h-4 text-brand-600" />}
                        >
                          Upload Photo
                        </Button>

                        {doctor?.profilePhoto && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={handleRemovePhoto}
                            disabled={isUploadingPhoto}
                            leftIcon={<Trash2 className="w-4 h-4 text-red-500" />}
                            className="text-red-600 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        )}
                      </div>

                      <p className="text-[11px] text-navy-400">
                        Supports JPG, PNG, or WEBP. Maximum file size: 5 MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Personal Information Form */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Personal Information</h2>
                    <p className="text-xs text-navy-500">Official doctor name as shown on legal identity documents.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="First Name" required error={errors.firstName}>
                      <Input
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        placeholder="e.g. Priya"
                      />
                    </FormField>

                    <FormField label="Last Name" required error={errors.lastName}>
                      <Input
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        placeholder="e.g. Sharma"
                      />
                    </FormField>

                    <FormField label="Date of Birth">
                      <Input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Gender">
                      <Select
                        value={formData.gender}
                        onChange={(e) => handleInputChange('gender', e.target.value)}
                        options={[
                          { label: 'Female', value: 'Female' },
                          { label: 'Male', value: 'Male' },
                          { label: 'Other', value: 'Other' },
                          { label: 'Prefer not to say', value: 'Prefer not to say' },
                        ]}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: PROFESSIONAL CREDENTIALS */}
            {activeTab === 'professional' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Medical Registration & Specialization</h2>
                    <p className="text-xs text-navy-500">
                      Medical council accreditation details used for prescription generation and clinical compliance.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Specialization" required error={errors.specialization}>
                      <Select
                        value={formData.specialization}
                        onChange={(e) => handleInputChange('specialization', e.target.value)}
                        options={specializationsList}
                      />
                    </FormField>

                    <FormField label="Qualification" required error={errors.qualification} helpText="e.g. MBBS, MD (Internal Medicine)">
                      <Input
                        value={formData.qualification}
                        onChange={(e) => handleInputChange('qualification', e.target.value)}
                        placeholder="e.g. MBBS, MD"
                      />
                    </FormField>

                    <FormField label="Years of Clinical Experience" error={errors.yearsOfExperience}>
                      <Input
                        type="number"
                        min="0"
                        max="70"
                        value={formData.yearsOfExperience}
                        onChange={(e) => handleInputChange('yearsOfExperience', e.target.value)}
                      />
                    </FormField>

                    <FormField label="Medical Council / Registration Authority">
                      <Input
                        value={formData.medicalCouncil}
                        onChange={(e) => handleInputChange('medicalCouncil', e.target.value)}
                        placeholder="e.g. Medical Council of India / Delhi Medical Council"
                      />
                    </FormField>

                    {/* Read-Only Verified Medical Registration Number */}
                    <div className="col-span-1 sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-navy-400" />
                          <span>Medical Registration Number (MCI / State Council)</span>
                        </label>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Credential
                        </span>
                      </div>
                      <Input
                        value={formData.medicalRegistrationNumber}
                        readOnly
                        disabled
                        className="bg-slate-100/80 font-mono font-bold text-navy-900 border-slate-300 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-navy-500">
                        To update verified registration credentials, submit an official verification request to support.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: CLINIC INFORMATION */}
            {activeTab === 'clinic' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Clinic / Healthcare Facility Details</h2>
                    <p className="text-xs text-navy-500">Address and contact numbers printed on prescription headers and patient reports.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="col-span-1 sm:col-span-2">
                      <FormField label="Clinic / Hospital Name" required error={errors.clinicName}>
                        <Input
                          value={formData.clinicName}
                          onChange={(e) => handleInputChange('clinicName', e.target.value)}
                          placeholder="e.g. Apollo Clinical Care Center"
                        />
                      </FormField>
                    </div>

                    <div className="col-span-1 sm:col-span-2">
                      <FormField label="Clinic Address">
                        <Textarea
                          value={formData.clinicAddress}
                          onChange={(e) => handleInputChange('clinicAddress', e.target.value)}
                          placeholder="e.g. 42 Health Care Avenue, Block B"
                          rows={2}
                          className="min-h-[70px]"
                        />
                      </FormField>
                    </div>

                    <FormField label="City">
                      <Input
                        value={formData.clinicCity}
                        onChange={(e) => handleInputChange('clinicCity', e.target.value)}
                        placeholder="e.g. New Delhi"
                      />
                    </FormField>

                    <FormField label="State">
                      <Input
                        value={formData.clinicState}
                        onChange={(e) => handleInputChange('clinicState', e.target.value)}
                        placeholder="e.g. Delhi"
                      />
                    </FormField>

                    <FormField label="PIN Code" error={errors.clinicPin}>
                      <Input
                        value={formData.clinicPin}
                        onChange={(e) => handleInputChange('clinicPin', e.target.value)}
                        placeholder="e.g. 110001"
                      />
                    </FormField>

                    <FormField label="Clinic Phone Number">
                      <Input
                        value={formData.clinicPhone}
                        onChange={(e) => handleInputChange('clinicPhone', e.target.value)}
                        placeholder="e.g. +91 11 2685 7000"
                      />
                    </FormField>

                    <FormField label="Clinic Official Email" error={errors.clinicEmail}>
                      <Input
                        type="email"
                        value={formData.clinicEmail}
                        onChange={(e) => handleInputChange('clinicEmail', e.target.value)}
                        placeholder="e.g. contact@apollocare.med"
                      />
                    </FormField>

                    <FormField label="Clinic Website">
                      <Input
                        value={formData.clinicWebsite}
                        onChange={(e) => handleInputChange('clinicWebsite', e.target.value)}
                        placeholder="e.g. https://apollocare.med"
                      />
                    </FormField>

                    <FormField label="Clinical Registration / Establishment License Number" helpText="Optional local healthcare license number">
                      <Input
                        value={formData.clinicLicenseNumber}
                        onChange={(e) => handleInputChange('clinicLicenseNumber', e.target.value)}
                        placeholder="e.g. DL-CLINIC-2024-998"
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CONTACT DETAILS */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Account Contact Information</h2>
                    <p className="text-xs text-navy-500">Contact information associated with your verified doctor identity.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Read-Only Account Email */}
                    <div className="col-span-1 sm:col-span-2 bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-semibold text-navy-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-navy-400" />
                          <span>Primary Authentication Email</span>
                        </label>
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Auth Email
                        </span>
                      </div>
                      <Input
                        value={formData.email}
                        readOnly
                        disabled
                        className="bg-slate-100/80 font-mono font-medium text-navy-900 border-slate-300 cursor-not-allowed"
                      />
                      <p className="text-[11px] text-navy-500">
                        Primary authentication email cannot be altered directly. Secure verification workflow required.
                      </p>
                    </div>

                    <FormField label="Doctor Personal Phone Number">
                      <Input
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="e.g. +91 98765 43210"
                      />
                    </FormField>

                    <FormField label="Preferred Contact Method">
                      <Select
                        options={[
                          { label: 'Email Communication', value: 'email' },
                          { label: 'Mobile SMS / Phone', value: 'phone' },
                          { label: 'WhatsApp Messenger', value: 'whatsapp' },
                        ]}
                      />
                    </FormField>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: BRANDING PREVIEW (PHASE PREPARATION) */}
            {activeTab === 'branding' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h2 className="text-base font-bold text-navy-900">Clinic Letterhead & Prescription Header Preview</h2>
                      <p className="text-xs text-navy-500">Live preview of auto-formatted prescription letterhead generated from your doctor profile.</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 inline-flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Auto-Formatted
                    </span>
                  </div>

                  {/* Mock Prescription Letterhead Card */}
                  <div className="bg-slate-50 rounded-2xl p-6 border-2 border-dashed border-slate-300 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b-2 border-navy-900 pb-4 gap-4">
                      <div className="space-y-1">
                        <h3 className="text-xl font-extrabold text-navy-900 uppercase tracking-tight">
                          {formData.clinicName || 'Apollo Clinical Care Center'}
                        </h3>
                        <p className="text-xs font-medium text-navy-600">
                          {formData.clinicAddress || '42 Health Care Avenue'}, {formData.clinicCity || 'New Delhi'} {formData.clinicPin}
                        </p>
                        <p className="text-[11px] text-navy-500">
                          Ph: {formData.clinicPhone || '+91 11 2685 7000'} • Email: {formData.clinicEmail || 'contact@apollocare.med'}
                        </p>
                      </div>

                      <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200 space-y-0.5">
                        <p className="text-sm font-bold text-navy-900">
                          Dr. {formData.firstName || 'Priya'} {formData.lastName || 'Sharma'}
                        </p>
                        <p className="text-xs font-semibold text-brand-700">{formData.specialization || 'General Physician'}</p>
                        <p className="text-[11px] font-mono text-navy-600">{formData.qualification || 'MBBS, MD'}</p>
                        <p className="text-[10px] font-mono font-bold text-navy-500">
                          Reg No: {formData.medicalRegistrationNumber || 'MCI-884920'}
                        </p>
                      </div>
                    </div>

                    <div className="py-8 text-center text-xs text-navy-400 font-medium">
                      [ Clinical Prescription & Patient Encounter Notes Canvas ]
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ACCOUNT & SECURITY */}
            {activeTab === 'account' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-5">
                  <div className="border-b border-slate-100 pb-3">
                    <h2 className="text-base font-bold text-navy-900">Account Credentials & System Security</h2>
                    <p className="text-xs text-navy-500">Security parameters and verified application metadata.</p>
                  </div>

                  <div className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-navy-400 font-semibold uppercase text-[10px]">Application Tracking ID</p>
                        <p className="font-mono font-bold text-navy-900 mt-1">{doctor?.applicationId || 'CF-APP-1001'}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-navy-400 font-semibold uppercase text-[10px]">Account Approval Status</p>
                        <span className="inline-block mt-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded text-xs">
                          APPROVED (Verified Clinical Doctor)
                        </span>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-navy-400 font-semibold uppercase text-[10px]">Username ID</p>
                        <p className="font-mono font-bold text-brand-700 mt-1">{doctor?.email}</p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <p className="text-navy-400 font-semibold uppercase text-[10px]">Password Security</p>
                        <p className="font-semibold text-navy-800 mt-1">SHA-256 Hashed Password</p>
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl text-blue-900 space-y-1">
                      <div className="flex items-center space-x-2 font-bold text-xs text-blue-950">
                        <Info className="w-4 h-4 text-blue-600" />
                        <span>Security Notice: Password Management</span>
                      </div>
                      <p className="text-[11px] leading-relaxed text-blue-800">
                        For security and HIPAA/MCI compliance, doctor passwords are stored using salted cryptographic hashes. Contact the system administrator if you require a credential reset.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
};
