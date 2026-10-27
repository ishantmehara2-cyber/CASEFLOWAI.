import { Doctor } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { currentDoctor as fallbackDoctor } from '../data/doctorData';

initStorage();

export async function getCurrentDoctor(): Promise<Doctor> {
  // Simulate asynchronous database fetch
  await new Promise((resolve) => setTimeout(resolve, 80));
  const doc = getItem<Doctor>(STORAGE_KEYS.DOCTOR, fallbackDoctor);
  return doc;
}

export async function updateDoctorProfile(updatedDoctor: Partial<Doctor>): Promise<Doctor> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const current = getItem<Doctor>(STORAGE_KEYS.DOCTOR, fallbackDoctor);
  const updated = { ...current, ...updatedDoctor };
  setItem(STORAGE_KEYS.DOCTOR, updated);
  return updated;
}
