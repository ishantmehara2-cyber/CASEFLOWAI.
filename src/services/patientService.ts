import { Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { generatePatientQr, getPatientQr } from './patientQrService';

initStorage();

export async function getPatients(): Promise<Patient[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);

  // Ensure every patient has an active QR identity generated
  const enrichedPatients = await Promise.all(
    patients.map(async (patient) => {
      let qrRecord = await getPatientQr(patient.patientId);
      if (!qrRecord) {
        qrRecord = await generatePatientQr(patient.patientId, patient.doctorId || 'doc-001');
      }
      return {
        ...patient,
        qrRecord,
      };
    })
  );

  return enrichedPatients;
}

export async function addPatient(
  patientData: Omit<Patient, 'id' | 'patientId' | 'lastVisit' | 'reportCount' | 'status'> & Partial<Patient>
): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);

  const generatedPatientId = `CF-P-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    patientId: generatedPatientId,
    name: patientData.name,
    age: patientData.age || 30,
    gender: patientData.gender || 'Male',
    phone: patientData.phone || '',
    email: patientData.email || '',
    lastVisit: 'Today, Just now',
    reportCount: 0,
    status: 'Active',
    profilePhoto: patientData.profilePhoto,
    doctorId: patientData.doctorId || 'doc-001',
  };

  // Generate QR record for the new patient
  const qrRecord = await generatePatientQr(newPatient.patientId, newPatient.doctorId);
  newPatient.qrRecord = qrRecord;

  const updated = [newPatient, ...patients];
  setItem(STORAGE_KEYS.PATIENTS, updated);

  return newPatient;
}

export async function getPatientById(id: string): Promise<Patient | undefined> {
  const patients = await getPatients();
  const trimmed = id.trim().toLowerCase();
  return patients.find((p) => p.id.toLowerCase() === trimmed || p.patientId.toLowerCase() === trimmed);
}
