import { Doctor } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { currentDoctor as fallbackDoctor } from '../data/doctorData';

initStorage();

export async function getCurrentDoctor(): Promise<Doctor> {
  // Simulate asynchronous database fetch
  await new Promise((resolve) => setTimeout(resolve, 80));
  const doc = getItem<Doctor>(STORAGE_KEYS.DOCTOR, fallbackDoctor);
  if (doc && !doc.firstName && doc.name) {
    const parts = doc.name.replace(/^Dr\.\s*/i, '').trim().split(' ');
    doc.firstName = parts[0] || 'Priya';
    doc.lastName = parts.slice(1).join(' ') || 'Sharma';
  }
  return doc;
}

export async function updateDoctorProfile(updatedDoctor: Partial<Doctor>): Promise<Doctor> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const current = getItem<Doctor>(STORAGE_KEYS.DOCTOR, fallbackDoctor);

  // Security: Prevent overriding approvalStatus or id directly from untrusted input
  const safeUpdates = { ...updatedDoctor };
  delete safeUpdates.approvalStatus;
  delete safeUpdates.id;

  const updated: Doctor = {
    ...current,
    ...safeUpdates,
  };

  // Synchronize full name when firstName or lastName is updated
  const fName = updated.firstName || current.firstName || 'Priya';
  const lName = updated.lastName || current.lastName || 'Sharma';
  updated.name = `Dr. ${fName} ${lName}`.trim();

  // Ensure approvalStatus remains Approved
  updated.approvalStatus = 'Approved';

  setItem(STORAGE_KEYS.DOCTOR, updated);
  return updated;
}

export async function uploadDoctorProfilePhoto(file: File): Promise<Doctor> {
  if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
    throw new Error('Please upload a valid JPG, JPEG or PNG image file.');
  }
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('Profile photo size must be less than 5MB.');
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const updated = await updateDoctorProfile({ profilePhoto: dataUrl });
        resolve(updated);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
