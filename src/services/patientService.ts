import { Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { generatePatientQr, getPatientQr } from './patientQrService';
import { logAuditEvent } from './auditService';

initStorage();

// Generate unique persistent human-readable Patient ID (CF-P-XXXXXX format)
function generateUniquePatientId(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CF-P-${result}`;
}

export async function getPatients(currentDoctorId: string = 'doc-001'): Promise<Patient[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);

  // Filter patients by active status and doctor ownership authorization
  const authorized = patients.filter((p) => {
    const isDoctorMatch = !p.doctorId || p.doctorId === currentDoctorId || currentDoctorId === 'doc-001' || currentDoctorId === 'admin-001';
    return isDoctorMatch && p.status !== 'Archived';
  });

  // Ensure every patient has an active QR identity generated
  const enrichedPatients = await Promise.all(
    authorized.map(async (patient) => {
      let qrRecord = await getPatientQr(patient.patientId);
      if (!qrRecord) {
        qrRecord = await generatePatientQr(patient.patientId, patient.doctorId || currentDoctorId);
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
  patientData: {
    firstName?: string;
    lastName?: string;
    name: string;
    age: number;
    dateOfBirth?: string;
    gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
    phone: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    bloodGroup?: string;
    allergiesText?: string;
    existingConditionsText?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    profilePhoto?: string;
    doctorId?: string;
  }
): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);

  const generatedPatientId = generateUniquePatientId();
  const doctorId = patientData.doctorId || 'doc-001';

  const newPatient: Patient = {
    id: `pat-${Date.now()}`,
    patientId: generatedPatientId,
    firstName: patientData.firstName,
    lastName: patientData.lastName,
    name: patientData.name,
    age: patientData.age || 30,
    dateOfBirth: patientData.dateOfBirth,
    gender: patientData.gender || 'Male',
    phone: patientData.phone || '',
    email: patientData.email || '',
    address: patientData.address || '',
    city: patientData.city || '',
    state: patientData.state || '',
    pincode: patientData.pincode || '',
    bloodGroup: patientData.bloodGroup || 'O+',
    allergiesText: patientData.allergiesText,
    existingConditionsText: patientData.existingConditionsText,
    emergencyContactName: patientData.emergencyContactName,
    emergencyContactPhone: patientData.emergencyContactPhone,
    lastVisit: 'Today, Intake',
    reportCount: 0,
    status: 'Active',
    profilePhoto: patientData.profilePhoto,
    doctorId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Automatically generate QR record for the new patient
  const qrRecord = await generatePatientQr(newPatient.patientId, doctorId);
  newPatient.qrRecord = qrRecord;

  const updated = [newPatient, ...patients];
  setItem(STORAGE_KEYS.PATIENTS, updated);

  await logAuditEvent('PATIENT_REGISTERED', 'Patient', newPatient.id, {
    patientId: newPatient.patientId,
    patientName: newPatient.name,
    doctorId,
  });

  return newPatient;
}

export async function getPatientById(
  id: string,
  currentDoctorId: string = 'doc-001'
): Promise<Patient | undefined> {
  const patients = await getPatients(currentDoctorId);
  const trimmed = id.trim().toLowerCase();
  return patients.find(
    (p) => p.id.toLowerCase() === trimmed || p.patientId.toLowerCase() === trimmed
  );
}

export async function updatePatient(
  id: string,
  updateData: Partial<Patient>,
  currentDoctorId: string = 'doc-001'
): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  const index = patients.findIndex(
    (p) => p.id.toLowerCase() === id.toLowerCase() || p.patientId.toLowerCase() === id.toLowerCase()
  );

  if (index === -1) {
    throw new Error('Patient record not found.');
  }

  const current = patients[index];

  // Immutable Patient ID and Doctor Ownership check
  const updated: Patient = {
    ...current,
    ...updateData,
    id: current.id,
    patientId: current.patientId, // Patient ID never changes
    doctorId: current.doctorId,   // Doctor ID never changes
    updatedAt: new Date().toISOString(),
  };

  patients[index] = updated;
  setItem(STORAGE_KEYS.PATIENTS, patients);

  await logAuditEvent('PATIENT_UPDATED', 'Patient', current.id, {
    patientId: current.patientId,
  });

  return updated;
}

export async function archivePatient(
  id: string,
  currentDoctorId: string = 'doc-001'
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  const index = patients.findIndex(
    (p) => p.id.toLowerCase() === id.toLowerCase() || p.patientId.toLowerCase() === id.toLowerCase()
  );

  if (index !== -1) {
    patients[index].status = 'Archived';
    patients[index].updatedAt = new Date().toISOString();
    setItem(STORAGE_KEYS.PATIENTS, patients);

    await logAuditEvent('PATIENT_ARCHIVED', 'Patient', id, {
      patientId: patients[index].patientId,
    });
  }
}
