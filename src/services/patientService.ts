import { Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';

initStorage();

export async function getPatients(): Promise<Patient[]> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  return getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
}

export async function addPatient(patientData: Omit<Patient, 'id' | 'patientId' | 'lastVisit' | 'reportCount' | 'status'> & Partial<Patient>): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);

  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    patientId: `CF-00${Math.floor(100 + Math.random() * 900)}`,
    name: patientData.name,
    age: patientData.age || 30,
    gender: patientData.gender || 'Male',
    phone: patientData.phone || '',
    email: patientData.email || '',
    lastVisit: 'Today, Just now',
    reportCount: 0,
    status: 'Active',
    profilePhoto: patientData.profilePhoto,
  };

  const updated = [newPatient, ...patients];
  setItem(STORAGE_KEYS.PATIENTS, updated);

  return newPatient;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const patients = await getPatients();
  return patients.find((p) => p.id === id);
}
