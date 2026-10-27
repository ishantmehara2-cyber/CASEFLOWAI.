import { Prescription, PrescriptionItem } from '../types/consultation';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';

initStorage();

const KEYS = {
  PRESCRIPTIONS: 'caseflow_prescriptions',
};

// Seed sample prescriptions if empty
function initSeedPrescriptions() {
  if (!localStorage.getItem('caseflow_prescriptions_initialized')) {
    const defaultRx: Prescription = {
      id: 'rx-001',
      prescriptionNumber: 'CF-RX-2026-100182',
      patientId: 'CF-00182',
      patientName: 'Aarav Patel',
      doctorId: 'doc-001',
      doctorName: 'Dr. Priya Sharma',
      clinicName: 'Apollo Clinical Care Center',
      visitId: 'vst-1',
      prescriptionDate: new Date(Date.now() - 2 * 86400000).toISOString(),
      status: 'FINALIZED',
      clinicalAssessment: 'Type 2 Diabetes Mellitus with mild upper respiratory symptoms',
      instructions: 'Continue regular blood glucose monitoring. Stay well hydrated.',
      followUp: 'Follow up in 2 weeks or if symptoms persist.',
      items: [
        {
          id: 'item-1',
          medicineName: 'Metformin',
          genericName: 'Metformin Hydrochloride',
          strength: '500 mg',
          dosage: '1 tablet',
          route: 'Oral',
          frequency: 'Twice daily',
          duration: '30 days',
          quantity: 60,
          foodInstruction: 'Take after food',
          notes: 'Monitor fasting blood glucose weekly.',
        },
        {
          id: 'item-2',
          medicineName: 'Paracetamol',
          genericName: 'Paracetamol',
          strength: '650 mg',
          dosage: '1 tablet',
          route: 'Oral',
          frequency: 'As needed (SOS)',
          duration: '3 days',
          quantity: 10,
          foodInstruction: 'Take after food',
          notes: 'For fever above 100°F.',
        },
      ],
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      finalizedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    setItem(KEYS.PRESCRIPTIONS, [defaultRx]);
    localStorage.setItem('caseflow_prescriptions_initialized', 'true');
  }
}

initSeedPrescriptions();

export async function getPatientPrescriptions(patientId: string): Promise<Prescription[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const list = getItem<Prescription[]>(KEYS.PRESCRIPTIONS, []);
  return list
    .filter((rx) => rx.patientId.toLowerCase() === patientId.toLowerCase())
    .sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());
}

export async function getAllPrescriptions(): Promise<Prescription[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return getItem<Prescription[]>(KEYS.PRESCRIPTIONS, []).sort(
    (a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime()
  );
}

export async function getPrescriptionById(prescriptionId: string): Promise<Prescription | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const list = getItem<Prescription[]>(KEYS.PRESCRIPTIONS, []);
  return list.find((rx) => rx.id === prescriptionId);
}

export async function savePrescription(prescriptionData: Partial<Prescription>): Promise<Prescription> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const list = getItem<Prescription[]>(KEYS.PRESCRIPTIONS, []);

  const rxId = prescriptionData.id || `rx-${Date.now()}`;
  const existingIndex = list.findIndex((rx) => rx.id === rxId);

  const now = new Date().toISOString();
  const prescriptionNumber = prescriptionData.prescriptionNumber || `CF-RX-2026-${Math.floor(100000 + Math.random() * 900000)}`;

  const finalized = prescriptionData.status === 'FINALIZED';

  const record: Prescription = {
    id: rxId,
    prescriptionNumber,
    patientId: prescriptionData.patientId || '',
    patientName: prescriptionData.patientName || '',
    doctorId: prescriptionData.doctorId || 'doc-001',
    doctorName: prescriptionData.doctorName || 'Dr. Priya Sharma',
    clinicName: prescriptionData.clinicName || 'Apollo Clinical Care Center',
    visitId: prescriptionData.visitId || '',
    prescriptionDate: prescriptionData.prescriptionDate || now,
    status: prescriptionData.status || 'DRAFT',
    clinicalAssessment: prescriptionData.clinicalAssessment || '',
    instructions: prescriptionData.instructions || '',
    followUp: prescriptionData.followUp || '',
    items: prescriptionData.items || [],
    createdAt: existingIndex !== -1 ? list[existingIndex].createdAt : now,
    finalizedAt: finalized ? (existingIndex !== -1 && list[existingIndex].finalizedAt ? list[existingIndex].finalizedAt : now) : undefined,
  };

  if (existingIndex !== -1) {
    list[existingIndex] = record;
  } else {
    list.unshift(record);
  }

  setItem(KEYS.PRESCRIPTIONS, list);

  if (finalized) {
    await logAuditEvent('PRESCRIPTION_FINALIZED', 'Prescription', rxId, { patientId: record.patientId, prescriptionNumber });
  }

  return record;
}
