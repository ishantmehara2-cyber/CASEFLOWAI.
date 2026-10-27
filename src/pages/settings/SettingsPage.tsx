import React, { useState, useEffect } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { useCurrentDoctor } from '../../hooks/useCurrentDoctor';
import { Button } from '../../components/ui/Button';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { PatientAvatar } from '../../components/ui/PatientAvatar';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { useToast } from '../../context/ToastContext';
import {
  User,
  Building2,
  Phone,
  Mail,
  Award,
  ShieldCheck,
  Camera,
  Trash2,
  Save,
  Sparkles,
  Lock,
  Globe,
  MapPin,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { doctor, loading, error, refresh, updateProfile, uploadPhoto } = useCurrentDoctor();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'profile' | 'clinic' | 'contact' | 'branding' | 'account'>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    specialization: '',
    qualification: '',
    yearsOfExperience: '',
    medicalCouncil: '',
    medicalRegistrationNumber: '',
    email: '',
    clinicName: '',
    clinicAddress: '',
    clinicCity: '',
    clinicState: '',
    clinicPin: '',
    clinicPhone: '',
    clinicEmail: '',
    website: '',
    clinicLicenseNumber: '',
  });

  useEffect(() => {
    if (doctor) {
      setFormData({
        firstName: doctor.firstName || '',
        lastName: doctor.lastName || '',
        phone: doctor.phone || '',
        specialization: doctor.specialization || '',
        qualification: doctor.qualification || '',
        yearsOfExperience: doctor.yearsOfExperience?.toString() || '',
        medicalCouncil: doctor.medicalCouncil || '',
        medicalRegistrationNumber: doctor.medicalRegistrationNumber || '',
        email: doctor.email || '',
        clinicName: doctor.clinicName || '',
        clinicAddress: doctor.clinicAddress || '',
        clinicCity: doctor.clinicCity || '',
        clinicState: doctor.clinicState || '',
        clinicPin: doctor.clinicPin || '',
        clinicPhone: doctor.clinicPhone || '',
        clinicEmail: doctor.clinicEmail || '',
        website: doctor.website || '',
        clinicLicenseNumber: doctor.clinicLicenseNumber || '',
      });
    }
  }, [doctor]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName.trim()) {
      showToast('Validation Error', 'First name is required.', 'error');
      return;
    }
    if (!formData.lastName.trim()) {
      showToast('Validation Error', 'Last name is required.', 'error');
      return;
    }
    if (!formData.specialization.trim()) {
      showToast('Validation Error', 'Specialization is required.', 'error');
      return;
    }
    if (!formData.qualification.trim()) {
      showToast('Validation Error', 'Qualification is required.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phone: formData.phone.trim(),
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        yearsOfExperience: formData.yearsOfExperience ? Number(formData.yearsOfExperience) : undefined,
        medicalCouncil: formData.medicalCouncil.trim(),
        clinicName: formData.clinicName.trim(),
        clinicAddress: formData.clinicAddress.trim(),
        clinicCity: formData.clinicCity.trim(),
        clinicState: formData.clinicState.trim(),
        clinicPin: formData.clinicPin.trim(),
        clinicPhone: formData.clinicPhone.trim(),
        clinicEmail: formData.clinicEmail.trim(),
        website: formData.website.trim(),
        clinicLicenseNumber: formData.clinicLicenseNumber.trim(),
      });

      showToast('Profile Updated', 'Profile updated successfully.', 'success');
      await refresh();
    } catch (err: any) {
      showToast('Update Failed', err?.message || 'Unable to update your profile. Please try again.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    setIsUploadingPhoto(true);
    try {
      await uploadPhoto(file);
      showToast('Photo Updated', 'Profile photo updated successfully.', 'success');
    } catch (err: any) {
      showToast('Upload Failed', err?.message || 'Unable to upload profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    setIsUploadingPhoto(true);
    try {
      await updateProfile({ profilePhoto: undefined });
      showToast('Photo Removed', 'Profile photo removed successfully.', 'info');
    } catch (err: any) {
      showToast('Error', 'Unable to remove profile photo.', 'error');
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  if (loading && !doctor) {
    return (
      <AppShell>
        <div className="space-y-6 max-w-5xl mx-auto py-4">
          <CardSkeleton className="h-24" />
          <CardSkeleton className="h-96" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell doctor={doctor || undefined}>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200/60">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-navy-900">
              Clinic & Profile Settings
            </h1>
            <p className="text-sm text-navy-600 mt-1">
              Manage your professional identity, clinical credentials, and practice information.
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
              Verified & Approved Doctor
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Settings Navigation Tabs */}
        <div className="flex overflow-x-auto space-x-2 border-b border-slate-200 pb-2 scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-brand-600 text-white shadow-subtle'
                : 'bg-white text-navy-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Profile & Professional</span>
          </button>
          <button
            onClick={() => setActiveTab('clinic')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-2 ${
              activeTab === 'clinic'
                ? 'bg-brand-600 text-white shadow-subtle'
                : 'bg-white text-navy-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Clinic Information</span>
          </button>
          <button
            onClick={() => setActiveTab('contact')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-2 ${
              activeTab === 'contact'
                ? 'bg-brand-600 text-white shadow-subtle'
                : 'bg-white text-navy-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Contact Information</span>
          </button>
          <button
            onClick={() => setActiveTab('branding')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-2 ${
              activeTab === 'branding'
                ? 'bg-brand-600 text-white shadow-subtle'
                : 'bg-white text-navy-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Branding Preview</span>
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors shrink-0 inline-flex items-center gap-2 ${
              activeTab === 'account'
                ? 'bg-brand-600 text-white shadow-subtle'
                : 'bg-white text-navy-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Account & Security</span>
          </button>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Tab 1: Profile & Professional Information */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Photo Card */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
                <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-brand-600" />
                  <span>Doctor Profile Photo</span>
                </h2>
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <PatientAvatar
                    image={doctor?.profilePhoto}
                    name={doctor?.name || 'Doctor'}
                    size="xl"
                  />
                  <div className="space-y-2 text-center sm:text-left">
                    <p className="text-xs text-navy-600">
                      Upload a professional portrait (JPG or PNG, max 5MB). This photo will appear across your dashboard and patient reports.
                    </p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1">
                      <label className="cursor-pointer inline-flex items-center px-3.5 py-2 rounded-lg bg-brand-600 text-white text-xs font-semibold hover:bg-brand-700 transition-colors shadow-subtle">
                        <Camera className="w-3.5 h-3.5 mr-2" />
                        <span>{isUploadingPhoto ? 'Uploading...' : 'Upload New Photo'}</span>
                        <input
                          type="file"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handlePhotoUpload}
                          disabled={isUploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {doctor?.profilePhoto && (
                        <button
                          type="button"
                          onClick={handleRemovePhoto}
                          disabled={isUploadingPhoto}
                          className="inline-flex items-center px-3.5 py-2 rounded-lg bg-slate-100 text-red-600 text-xs font-semibold hover:bg-red-50 border border-slate-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Personal & Professional Details Card */}
              <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
                <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-brand-600" />
                  <span>Professional & Personal Information</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="First Name" required>
                    <Input
                      value={formData.firstName}
                      onChange={(e) => handleChange('firstName', e.target.value)}
                      placeholder="Priya"
                    />
                  </FormField>
                  <FormField label="Last Name" required>
                    <Input
                      value={formData.lastName}
                      onChange={(e) => handleChange('lastName', e.target.value)}
                      placeholder="Sharma"
                    />
                  </FormField>

                  <FormField label="Specialization" required>
                    <Input
                      value={formData.specialization}
                      onChange={(e) => handleChange('specialization', e.target.value)}
                      placeholder="General Physician"
                    />
                  </FormField>
                  <FormField label="Qualification" required>
                    <Input
                      value={formData.qualification}
                      onChange={(e) => handleChange('qualification', e.target.value)}
                      placeholder="MBBS, MD"
                    />
                  </FormField>

                  <FormField label="Years of Experience">
                    <Input
                      type="number"
                      value={formData.yearsOfExperience}
                      onChange={(e) => handleChange('yearsOfExperience', e.target.value)}
                      placeholder="8"
                    />
                  </FormField>
                  <FormField label="Medical Council / Authority">
                    <Input
                      value={formData.medicalCouncil}
                      onChange={(e) => handleChange('medicalCouncil', e.target.value)}
                      placeholder="Maharashtra Medical Council"
                    />
                  </FormField>

                  <FormField label="Medical Registration Number" helpText="Verified credential (read-only)">
                    <Input
                      value={formData.medicalRegistrationNumber}
                      disabled
                      className="bg-slate-50 text-navy-500 cursor-not-allowed"
                    />
                  </FormField>
                  <FormField label="Primary Account Email" helpText="Authentication email (read-only)">
                    <Input
                      value={formData.email}
                      disabled
                      className="bg-slate-50 text-navy-500 cursor-not-allowed"
                    />
                  </FormField>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Clinic Information */}
          {activeTab === 'clinic' && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-brand-600" />
                <span>Clinic Practice Information</span>
              </h2>
              <p className="text-xs text-navy-600">
                This clinic information will appear on your prescription letterheads, patient reports, and patient summaries.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Clinic Name" required className="sm:col-span-2">
                  <Input
                    value={formData.clinicName}
                    onChange={(e) => handleChange('clinicName', e.target.value)}
                    placeholder="Apollo Clinical Care Center"
                  />
                </FormField>

                <FormField label="Clinic Address" className="sm:col-span-2">
                  <Input
                    value={formData.clinicAddress}
                    onChange={(e) => handleChange('clinicAddress', e.target.value)}
                    placeholder="124, Healthcare Avenue, Bandra West"
                  />
                </FormField>

                <FormField label="City">
                  <Input
                    value={formData.clinicCity}
                    onChange={(e) => handleChange('clinicCity', e.target.value)}
                    placeholder="Mumbai"
                  />
                </FormField>

                <FormField label="State">
                  <Input
                    value={formData.clinicState}
                    onChange={(e) => handleChange('clinicState', e.target.value)}
                    placeholder="Maharashtra"
                  />
                </FormField>

                <FormField label="PIN Code">
                  <Input
                    value={formData.clinicPin}
                    onChange={(e) => handleChange('clinicPin', e.target.value)}
                    placeholder="400050"
                  />
                </FormField>

                <FormField label="Clinic Phone">
                  <Input
                    value={formData.clinicPhone}
                    onChange={(e) => handleChange('clinicPhone', e.target.value)}
                    placeholder="+91 22 2654 8900"
                  />
                </FormField>

                <FormField label="Clinic Email">
                  <Input
                    type="email"
                    value={formData.clinicEmail}
                    onChange={(e) => handleChange('clinicEmail', e.target.value)}
                    placeholder="contact@apolloclinicbandra.med"
                  />
                </FormField>

                <FormField label="Website URL">
                  <Input
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="https://apolloclinicbandra.med"
                  />
                </FormField>

                <FormField label="Clinic License / Registration Number" className="sm:col-span-2">
                  <Input
                    value={formData.clinicLicenseNumber}
                    onChange={(e) => handleChange('clinicLicenseNumber', e.target.value)}
                    placeholder="CLN-89421-MH"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Tab 3: Contact Information */}
          {activeTab === 'contact' && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-brand-600" />
                <span>Doctor Contact Information</span>
              </h2>
              <p className="text-xs text-navy-600">
                Update your primary phone number for appointment notifications and patient coordination.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <FormField label="Primary Contact Phone" required>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </FormField>

                <FormField label="Primary Login Email" helpText="Managed by secure authentication system">
                  <Input
                    value={formData.email}
                    disabled
                    className="bg-slate-50 text-navy-500 cursor-not-allowed"
                  />
                </FormField>
              </div>
            </div>
          )}

          {/* Tab 4: Branding Preview (Preparation for later phase) */}
          {activeTab === 'branding' && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-brand-600" />
                    <span>Clinic Branding & Prescription Header Preview</span>
                  </h2>
                  <p className="text-xs text-navy-600 mt-1">
                    Preview of how your clinic branding will appear on patient prescriptions and medical summaries.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200">
                  Phase 3 Preview
                </span>
              </div>

              {/* Simulated Prescription Header Card */}
              <div className="bg-slate-50 rounded-xl p-6 border border-slate-200 space-y-4 shadow-subtle">
                <div className="flex items-start justify-between border-b border-slate-200 pb-4">
                  <div className="flex items-center space-x-3">
                    <PatientAvatar
                      image={doctor?.profilePhoto}
                      name={doctor?.name || 'Doctor'}
                      size="lg"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-navy-900">
                        {doctor?.name || 'Dr. Priya Sharma'}
                      </h3>
                      <p className="text-xs text-brand-700 font-semibold">{doctor?.specialization}</p>
                      <p className="text-[11px] text-navy-500">{doctor?.qualification}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <h4 className="text-xs font-bold text-navy-900">{doctor?.clinicName}</h4>
                    <p className="text-[11px] text-navy-500">{doctor?.clinicAddress}</p>
                    <p className="text-[11px] text-navy-500">{doctor?.clinicPhone} • {doctor?.clinicEmail}</p>
                  </div>
                </div>
                <div className="text-center py-2">
                  <p className="text-[11px] text-navy-400 font-medium italic">
                    [ Full QR & Letterhead Customizer templates will be fully enabled in upcoming branding phase ]
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Account & Security */}
          {activeTab === 'account' && (
            <div className="bg-white rounded-2xl p-6 shadow-card border border-slate-200/80 space-y-4">
              <h2 className="text-base font-bold text-navy-900 flex items-center gap-2">
                <Lock className="w-5 h-5 text-brand-600" />
                <span>Account Status & Security</span>
              </h2>
              <p className="text-xs text-navy-600">
                Your clinical account is securely authenticated and verified by administrative authorization.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-navy-900">Administrative Approval Status</p>
                    <p className="text-[11px] text-navy-500">Managed by hospital/system administration</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    APPROVED
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div>
                    <p className="text-xs font-bold text-navy-900">Account Role</p>
                    <p className="text-[11px] text-navy-500">Primary Clinical Doctor Workspace</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-brand-100 text-brand-800 border border-brand-200">
                    {doctor?.role || 'doctor'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-card border border-slate-200/80 flex items-center justify-between">
            <p className="text-xs text-navy-500">
              Changes will immediately reflect across your dashboard and clinic modules.
            </p>
            <Button
              type="submit"
              size="lg"
              isLoading={isSaving}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </AppShell>
  );
};
