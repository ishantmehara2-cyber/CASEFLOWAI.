import { Doctor, DoctorRegistrationRecord } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { getStoredSession } from './authService';
import { currentDoctor as fallbackDoctor } from '../data/doctorData';

initStorage();

/**
 * Retrieves the profile of the currently authenticated doctor.
 * Derived directly from the persistent doctor registration database record (STORAGE_KEYS.REGISTRATIONS).
 */
export async function getCurrentDoctor(): Promise<Doctor> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const session = getStoredSession();
  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);

  let record: DoctorRegistrationRecord | undefined;

  // 1. Find by active session doctorId or authUserId
  if (session?.doctorId) {
    record = registrations.find(
      (r) => r.id === session.doctorId || r.authUserId === session.userId
    );
  }

  // 2. Fallback to session email
  if (!record && session?.email) {
    record = registrations.find(
      (r) => r.email.toLowerCase() === session.email.toLowerCase()
    );
  }

  // 3. Fallback to first approved doctor record (e.g., seed doctor)
  if (!record && registrations.length > 0) {
    record = registrations.find((r) => r.approvalStatus === 'APPROVED') || registrations[0];
  }

  if (record) {
    const fullName = `Dr. ${record.firstName || ''} ${record.lastName || ''}`.trim();
    return {
      id: record.id,
      name: fullName,
      firstName: record.firstName,
      lastName: record.lastName,
      specialization: record.specialization || 'General Physician',
      profilePhoto: record.profilePhoto,
      email: record.email,
      phone: record.phone,
      dateOfBirth: record.dateOfBirth,
      gender: record.gender,
      clinicName: record.clinicName || 'Clinical Care Center',
      medicalRegistrationNumber: record.medicalRegistrationNumber,
      qualification: record.qualification,
      yearsOfExperience: record.yearsOfExperience,
      medicalCouncil: record.medicalCouncil,
      clinicAddress: record.clinicAddress,
      clinicCity: record.clinicCity || '',
      clinicState: record.clinicState || '',
      clinicPin: record.clinicPin || '',
      clinicPhone: record.clinicPhone || record.phone || '',
      clinicEmail: record.clinicEmail || record.email || '',
      clinicWebsite: record.clinicWebsite || '',
      clinicLicenseNumber: record.clinicLicenseNumber || '',
      approvalStatus: record.approvalStatus,
      rejectionReason: record.rejectionReason,
      applicationId: record.applicationId,
    };
  }

  // Final fallback to static doctor data if no database records exist
  return getItem<Doctor>(STORAGE_KEYS.DOCTOR, fallbackDoctor);
}

/**
 * Updates permitted profile and clinic fields for the authenticated doctor in the database.
 * Strictly prevents modification of administrative / verification fields.
 */
export async function updateDoctorProfile(
  updates: Partial<DoctorRegistrationRecord> & Partial<Doctor>
): Promise<Doctor> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const session = getStoredSession();
  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);

  let targetId = session?.doctorId;
  if (!targetId && session?.email) {
    const matched = registrations.find(
      (r) => r.email.toLowerCase() === session.email.toLowerCase()
    );
    targetId = matched?.id;
  }
  if (!targetId && registrations.length > 0) {
    targetId = registrations[0].id;
  }

  const index = registrations.findIndex((r) => r.id === targetId);
  if (index === -1) {
    throw new Error('Doctor registration record not found.');
  }

  const existing = registrations[index];

  // SECURITY GUARD: Strip non-editable administrative verification fields
  const safeUpdates = { ...updates };
  delete (safeUpdates as any).approvalStatus;
  delete (safeUpdates as any).approvedBy;
  delete (safeUpdates as any).approvedAt;
  delete (safeUpdates as any).rejectionReason;
  delete (safeUpdates as any).applicationId;
  delete (safeUpdates as any).passwordHash;
  delete (safeUpdates as any).id;
  delete (safeUpdates as any).authUserId;

  const updatedFirstName =
    safeUpdates.firstName !== undefined ? safeUpdates.firstName : existing.firstName;
  const updatedLastName =
    safeUpdates.lastName !== undefined ? safeUpdates.lastName : existing.lastName;
  const updatedName = `Dr. ${updatedFirstName || ''} ${updatedLastName || ''}`.trim();

  const updatedRegistration: DoctorRegistrationRecord = {
    ...existing,
    ...safeUpdates,
    firstName: updatedFirstName,
    lastName: updatedLastName,
    updatedAt: new Date().toISOString(),
  };

  // Persist updated record in database array
  registrations[index] = updatedRegistration;
  setItem(STORAGE_KEYS.REGISTRATIONS, registrations);

  // Sync current active session
  if (session && session.doctorId === targetId) {
    const updatedSession = {
      ...session,
      name: updatedName,
    };
    setItem(STORAGE_KEYS.SESSION, updatedSession);
  }

  const updatedDoctor: Doctor = {
    id: updatedRegistration.id,
    name: updatedName,
    firstName: updatedRegistration.firstName,
    lastName: updatedRegistration.lastName,
    specialization: updatedRegistration.specialization,
    profilePhoto: updatedRegistration.profilePhoto,
    email: updatedRegistration.email,
    phone: updatedRegistration.phone,
    dateOfBirth: updatedRegistration.dateOfBirth,
    gender: updatedRegistration.gender,
    clinicName: updatedRegistration.clinicName,
    medicalRegistrationNumber: updatedRegistration.medicalRegistrationNumber,
    qualification: updatedRegistration.qualification,
    yearsOfExperience: updatedRegistration.yearsOfExperience,
    medicalCouncil: updatedRegistration.medicalCouncil,
    clinicAddress: updatedRegistration.clinicAddress,
    clinicCity: updatedRegistration.clinicCity || '',
    clinicState: updatedRegistration.clinicState || '',
    clinicPin: updatedRegistration.clinicPin || '',
    clinicPhone: updatedRegistration.clinicPhone || updatedRegistration.phone || '',
    clinicEmail: updatedRegistration.clinicEmail || updatedRegistration.email || '',
    clinicWebsite: updatedRegistration.clinicWebsite || '',
    clinicLicenseNumber: updatedRegistration.clinicLicenseNumber || '',
    approvalStatus: updatedRegistration.approvalStatus,
    rejectionReason: updatedRegistration.rejectionReason,
    applicationId: updatedRegistration.applicationId,
  };

  // Sync active doctor state
  setItem(STORAGE_KEYS.DOCTOR, updatedDoctor);

  // Dispatch custom DOM event for immediate real-time sync across UI components
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('caseflow_doctor_updated'));
  }

  return updatedDoctor;
}

/**
 * Converts uploaded photo file to a secure Data URL and persists in doctor record.
 */
export async function uploadDoctorProfilePhoto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      return reject(new Error('Invalid image format. Please upload JPG, PNG, or WEBP.'));
    }

    if (file.size > 5 * 1024 * 1024) {
      return reject(new Error('File size exceeds 5MB limit. Please select a smaller photo.'));
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = reader.result as string;
        await updateDoctorProfile({ profilePhoto: dataUrl });
        resolve(dataUrl);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Clears the profile photo URL and reverts to clean initials fallback.
 */
export async function removeDoctorProfilePhoto(): Promise<Doctor> {
  return updateDoctorProfile({ profilePhoto: '' });
}
