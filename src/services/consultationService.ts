import { ConsultationRecord, ConsultationStatus, VisitType } from '../types/consultation';
import { ConsultationTrendPoint } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';
import { addPatientVisit, addTimelineEvent } from './patientMedicalMemoryService';
import { savePrescription } from './prescriptionService';

initStorage();

const KEYS = {
  CONSULTATIONS: 'caseflow_consultations',
};

// Seed sample consultations if empty
function initSeedConsultations() {
  if (!localStorage.getItem('caseflow_consultations_initialized')) {
    const defaultConsult: ConsultationRecord = {
      id: 'cns-001',
      patientId: 'CF-00182',
      doctorId: 'doc-001',
      doctorName: 'Dr. Priya Sharma',
      clinicName: 'Apollo Clinical Care Center',
      visitDate: new Date(Date.now() - 2 * 86400000).toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      visitType: 'NEW_CONSULTATION',
      status: 'FINALIZED',
      chiefComplaint: 'Mild fever and routine blood sugar checkup',
      historyOfPresentIllness: 'Patient reports intermittent low-grade fever for 3 days with fatigue.',
      vitals: {
        bloodPressure: '124/82 mmHg',
        heartRate: '78 bpm',
        temperature: '98.8 °F',
        spo2: '98 %',
        weight: '68 kg',
        height: '170 cm',
        bmi: '23.5',
      },
      clinicalExamination: 'Throat mildly congested. Lungs clear. Abdomen soft, non-tender.',
      assessment: 'Type 2 Diabetes Mellitus with mild upper respiratory symptoms',
      plan: 'Continue Metformin 500mg. Prescribed Paracetamol SOS for fever. Follow up in 2 weeks.',
      prescriptionId: 'rx-001',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      finalizedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    };

    setItem(KEYS.CONSULTATIONS, [defaultConsult]);
    localStorage.setItem('caseflow_consultations_initialized', 'true');
  }
}

initSeedConsultations();

export async function getPatientConsultations(patientId: string): Promise<ConsultationRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const list = getItem<ConsultationRecord[]>(KEYS.CONSULTATIONS, []);
  return list
    .filter((c) => c.patientId.toLowerCase() === patientId.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getAllConsultations(): Promise<ConsultationRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return getItem<ConsultationRecord[]>(KEYS.CONSULTATIONS, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getConsultationById(consultationId: string): Promise<ConsultationRecord | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 30));
  const list = getItem<ConsultationRecord[]>(KEYS.CONSULTATIONS, []);
  return list.find((c) => c.id === consultationId);
}

export async function getConsultationTrend(range: string = '7days'): Promise<ConsultationTrendPoint[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return [
    { date: 'Mon', count: 8 },
    { date: 'Tue', count: 12 },
    { date: 'Wed', count: 15 },
    { date: 'Thu', count: 10 },
    { date: 'Fri', count: 14 },
    { date: 'Sat', count: 9 },
    { date: 'Sun', count: 4 },
  ];
}

export async function saveConsultationDraft(consultationData: Partial<ConsultationRecord>): Promise<ConsultationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const list = getItem<ConsultationRecord[]>(KEYS.CONSULTATIONS, []);

  const cnsId = consultationData.id || `cns-${Date.now()}`;
  const existingIndex = list.findIndex((c) => c.id === cnsId);
  const now = new Date().toISOString();

  const record: ConsultationRecord = {
    id: cnsId,
    patientId: consultationData.patientId || '',
    doctorId: consultationData.doctorId || 'doc-001',
    doctorName: consultationData.doctorName || 'Dr. Priya Sharma',
    clinicName: consultationData.clinicName || 'Apollo Clinical Care Center',
    visitDate: consultationData.visitDate || new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    visitType: consultationData.visitType || 'NEW_CONSULTATION',
    status: consultationData.status || 'IN_PROGRESS',
    chiefComplaint: consultationData.chiefComplaint || '',
    historyOfPresentIllness: consultationData.historyOfPresentIllness || '',
    vitals: consultationData.vitals || {},
    clinicalExamination: consultationData.clinicalExamination || '',
    assessment: consultationData.assessment || '',
    plan: consultationData.plan || '',
    prescriptionId: consultationData.prescriptionId,
    notes: consultationData.notes,
    createdAt: existingIndex !== -1 ? list[existingIndex].createdAt : now,
    updatedAt: now,
  };

  if (existingIndex !== -1) {
    list[existingIndex] = record;
  } else {
    list.unshift(record);
  }

  setItem(KEYS.CONSULTATIONS, list);
  await logAuditEvent('CONSULTATION_SAVED_DRAFT', 'Consultation', cnsId, { patientId: record.patientId });

  return record;
}

export async function finalizeConsultation(
  consultationId: string,
  prescriptionData?: any,
  patientName: string = 'Patient'
): Promise<ConsultationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const list = getItem<ConsultationRecord[]>(KEYS.CONSULTATIONS, []);
  const index = list.findIndex((c) => c.id === consultationId);

  if (index === -1) {
    throw new Error('Consultation record not found.');
  }

  const now = new Date().toISOString();
  const current = list[index];

  let prescriptionId = current.prescriptionId;

  if (prescriptionData && prescriptionData.items && prescriptionData.items.length > 0) {
    const savedRx = await savePrescription({
      ...prescriptionData,
      patientId: current.patientId,
      patientName,
      doctorId: current.doctorId,
      doctorName: current.doctorName,
      clinicName: current.clinicName,
      visitId: current.id,
      status: 'FINALIZED',
      prescriptionDate: now,
    });
    prescriptionId = savedRx.id;
  }

  const finalizedRecord: ConsultationRecord = {
    ...current,
    status: 'FINALIZED',
    prescriptionId,
    updatedAt: now,
    finalizedAt: now,
  };

  list[index] = finalizedRecord;
  setItem(KEYS.CONSULTATIONS, list);

  // Sync to patient medical memory visits & timeline
  await addPatientVisit(
    current.patientId,
    {
      visitDate: current.visitDate,
      visitType: (current.visitType === 'FOLLOW_UP' ? 'Follow-up' : 'General Consultation') as any,
      chiefComplaint: current.chiefComplaint || 'Clinical Consultation',
      notes: `Assessment: ${current.assessment || 'None'}. Plan: ${current.plan || 'None'}`,
      status: 'Completed',
    },
    { id: current.doctorId, name: current.doctorName, clinicName: current.clinicName, specialization: 'General Physician', email: '' }
  );

  await addTimelineEvent({
    patientId: current.patientId,
    eventType: 'VISIT_CREATED',
    title: `Consultation Finalized (${current.visitType.replace('_', ' ')})`,
    description: `Conducted by ${current.doctorName}. Assessment: ${current.assessment || 'Recorded'}`,
    actorName: current.doctorName,
  });

  if (prescriptionId) {
    await addTimelineEvent({
      patientId: current.patientId,
      eventType: 'PRESCRIPTION_CREATED',
      title: 'Prescription Issued',
      description: `E-prescription finalized during consultation by ${current.doctorName}.`,
      actorName: current.doctorName,
    });
  }

  await logAuditEvent('CONSULTATION_FINALIZED', 'Consultation', consultationId, { patientId: current.patientId, prescriptionId });

  return finalizedRecord;
}
