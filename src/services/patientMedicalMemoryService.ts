import {
  Patient,
  PatientAllergy,
  MedicalCondition,
  PatientSurgicalHistory,
  PatientVisit,
  TimelineEvent,
  Doctor,
} from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';
import { getPatientById } from './patientService';

initStorage();

const KEYS = {
  ALLERGIES: 'caseflow_patient_allergies',
  CONDITIONS: 'caseflow_patient_conditions',
  SURGICAL: 'caseflow_patient_surgical',
  VISITS: 'caseflow_patient_visits',
  TIMELINE: 'caseflow_patient_timeline',
};

// Seed default clinical memory records on initialization if empty
function initSeedMemory() {
  if (!localStorage.getItem('caseflow_memory_initialized')) {
    const defaultAllergies: PatientAllergy[] = [
      {
        id: 'alg-1',
        patientId: 'CF-00182',
        allergen: 'Penicillin',
        reaction: 'Urticaria (Skin Rash)',
        severity: 'Moderate',
        recordedBy: 'Dr. Priya Sharma',
        recordedDate: '2026-10-10',
        notes: 'Patient experienced rash during childhood antibiotic course.',
      },
      {
        id: 'alg-2',
        patientId: 'CF-00183',
        allergen: 'Sulfa Drugs',
        reaction: 'Facial Swelling',
        severity: 'Severe',
        recordedBy: 'Dr. Priya Sharma',
        recordedDate: '2026-09-15',
        notes: 'Strict avoidance recommended.',
      },
    ];

    const defaultConditions: MedicalCondition[] = [
      {
        id: 'cnd-1',
        patientId: 'CF-00182',
        condition: 'Type 2 Diabetes Mellitus',
        status: 'Managed',
        diagnosedDate: '2024-03-12',
        notes: 'HbA1c last recorded 6.8%. On Metformin 500mg daily.',
      },
      {
        id: 'cnd-2',
        patientId: 'CF-00182',
        condition: 'Essential Hypertension',
        status: 'Active',
        diagnosedDate: '2025-01-20',
        notes: 'BP monitored regularly.',
      },
      {
        id: 'cnd-3',
        patientId: 'CF-00183',
        condition: 'Hypothyroidism',
        status: 'Managed',
        diagnosedDate: '2023-11-05',
        notes: 'On Thyroxine 50mcg morning.',
      },
    ];

    const defaultVisits: PatientVisit[] = [
      {
        id: 'vst-1',
        patientId: 'CF-00182',
        doctorId: 'doc-001',
        doctorName: 'Dr. Priya Sharma',
        clinicName: 'Apollo Clinical Care Center',
        visitDate: '2026-10-26 10:30 AM',
        visitType: 'General Consultation',
        chiefComplaint: 'Mild fever and routine blood sugar checkup',
        notes: 'Vitals stable. Temp 98.8 F, BP 124/82 mmHg. Advised CBC and continue Metformin.',
        status: 'Completed',
      },
      {
        id: 'vst-2',
        patientId: 'CF-00183',
        doctorId: 'doc-001',
        doctorName: 'Dr. Priya Sharma',
        clinicName: 'Apollo Clinical Care Center',
        visitDate: '2026-10-24 02:15 PM',
        visitType: 'Follow-up',
        chiefComplaint: 'Follow-up thyroid blood panel review',
        notes: 'TSH level within normal limits. Continue current dosage.',
        status: 'Completed',
      },
    ];

    const defaultTimeline: TimelineEvent[] = [
      {
        id: 'tl-1',
        patientId: 'CF-00182',
        eventType: 'PATIENT_REGISTERED',
        title: 'Patient Intake Registered',
        description: 'Patient intake record and secure QR identity generated.',
        eventDate: '2026-10-10 09:00 AM',
        actorName: 'Dr. Priya Sharma',
      },
      {
        id: 'tl-2',
        patientId: 'CF-00182',
        eventType: 'ALLERGY_ADDED',
        title: 'Allergy Alert Added',
        description: 'Recorded Penicillin allergy alert (Moderate severity).',
        eventDate: '2026-10-10 09:15 AM',
        actorName: 'Dr. Priya Sharma',
      },
      {
        id: 'tl-3',
        patientId: 'CF-00182',
        eventType: 'VISIT_CREATED',
        title: 'Clinical Consultation Recorded',
        description: 'General Consultation for fever and blood sugar checkup.',
        eventDate: '2026-10-26 10:30 AM',
        actorName: 'Dr. Priya Sharma',
      },
    ];

    setItem(KEYS.ALLERGIES, defaultAllergies);
    setItem(KEYS.CONDITIONS, defaultConditions);
    setItem(KEYS.VISITS, defaultVisits);
    setItem(KEYS.TIMELINE, defaultTimeline);
    localStorage.setItem('caseflow_memory_initialized', 'true');
  }
}

initSeedMemory();

export async function getPatientAllergies(patientId: string): Promise<PatientAllergy[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const allergies = getItem<PatientAllergy[]>(KEYS.ALLERGIES, []);
  return allergies.filter(
    (a) => a.patientId.toLowerCase() === patientId.toLowerCase()
  );
}

export async function addPatientAllergy(
  patientId: string,
  allergyData: Omit<PatientAllergy, 'id' | 'patientId' | 'recordedDate'>,
  doctorName: string = 'Dr. Priya Sharma'
): Promise<PatientAllergy> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const allergies = getItem<PatientAllergy[]>(KEYS.ALLERGIES, []);

  const newAllergy: PatientAllergy = {
    id: `alg-${Date.now()}`,
    patientId,
    allergen: allergyData.allergen,
    reaction: allergyData.reaction,
    severity: allergyData.severity,
    recordedBy: doctorName,
    recordedDate: new Date().toISOString().split('T')[0],
    notes: allergyData.notes,
  };

  setItem(KEYS.ALLERGIES, [newAllergy, ...allergies]);

  // Log timeline event
  await addTimelineEvent({
    patientId,
    eventType: 'ALLERGY_ADDED',
    title: `Allergy Recorded: ${allergyData.allergen}`,
    description: `Added ${allergyData.severity} allergy alert for ${allergyData.allergen} (${allergyData.reaction}).`,
    actorName: doctorName,
  });

  await logAuditEvent('PATIENT_ALLERGY_CREATED', 'PatientAllergy', newAllergy.id, { patientId, allergen: allergyData.allergen });

  return newAllergy;
}

export async function getPatientConditions(patientId: string): Promise<MedicalCondition[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const conditions = getItem<MedicalCondition[]>(KEYS.CONDITIONS, []);
  return conditions.filter((c) => c.patientId.toLowerCase() === patientId.toLowerCase());
}

export async function addPatientCondition(
  patientId: string,
  conditionData: Omit<MedicalCondition, 'id' | 'patientId'>,
  doctorName: string = 'Dr. Priya Sharma'
): Promise<MedicalCondition> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const conditions = getItem<MedicalCondition[]>(KEYS.CONDITIONS, []);

  const newCondition: MedicalCondition = {
    id: `cnd-${Date.now()}`,
    patientId,
    condition: conditionData.condition,
    status: conditionData.status || 'Active',
    diagnosedDate: conditionData.diagnosedDate || new Date().toISOString().split('T')[0],
    notes: conditionData.notes,
  };

  setItem(KEYS.CONDITIONS, [newCondition, ...conditions]);

  await addTimelineEvent({
    patientId,
    eventType: 'MEDICAL_HISTORY_ADDED',
    title: `Medical Condition Added: ${conditionData.condition}`,
    description: `Recorded condition ${conditionData.condition} (${conditionData.status}).`,
    actorName: doctorName,
  });

  await logAuditEvent('PATIENT_MEDICAL_HISTORY_CREATED', 'MedicalCondition', newCondition.id, { patientId, condition: conditionData.condition });

  return newCondition;
}

export async function getPatientVisits(patientId: string): Promise<PatientVisit[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const visits = getItem<PatientVisit[]>(KEYS.VISITS, []);
  return visits.filter((v) => v.patientId.toLowerCase() === patientId.toLowerCase());
}

export async function addPatientVisit(
  patientId: string,
  visitData: Omit<PatientVisit, 'id' | 'patientId' | 'visitDate'>,
  doctor: Doctor
): Promise<PatientVisit> {
  await new Promise((resolve) => setTimeout(resolve, 120));
  const visits = getItem<PatientVisit[]>(KEYS.VISITS, []);

  const newVisit: PatientVisit = {
    id: `vst-${Date.now()}`,
    patientId,
    doctorId: doctor.id,
    doctorName: doctor.name,
    clinicName: doctor.clinicName,
    visitDate: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    visitType: visitData.visitType || 'General Consultation',
    chiefComplaint: visitData.chiefComplaint,
    notes: visitData.notes,
    status: visitData.status || 'Completed',
  };

  setItem(KEYS.VISITS, [newVisit, ...visits]);

  await addTimelineEvent({
    patientId,
    eventType: 'VISIT_CREATED',
    title: `${visitData.visitType}: ${visitData.chiefComplaint}`,
    description: `Recorded by ${doctor.name} at ${doctor.clinicName}.`,
    actorName: doctor.name,
  });

  await logAuditEvent('PATIENT_VISIT_CREATED', 'PatientVisit', newVisit.id, { patientId, visitType: visitData.visitType });

  return newVisit;
}

export async function getPatientTimeline(patientId: string): Promise<TimelineEvent[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const timeline = getItem<TimelineEvent[]>(KEYS.TIMELINE, []);
  return timeline
    .filter((t) => t.patientId.toLowerCase() === patientId.toLowerCase())
    .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
}

export async function addTimelineEvent(
  eventData: Omit<TimelineEvent, 'id' | 'eventDate'>
): Promise<TimelineEvent> {
  const timeline = getItem<TimelineEvent[]>(KEYS.TIMELINE, []);
  const newEvent: TimelineEvent = {
    id: `tl-${Date.now()}`,
    patientId: eventData.patientId,
    eventType: eventData.eventType,
    title: eventData.title,
    description: eventData.description,
    eventDate: new Date().toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    actorName: eventData.actorName,
  };

  setItem(KEYS.TIMELINE, [newEvent, ...timeline]);
  return newEvent;
}

export async function updatePatientOverview(
  patientId: string,
  updateData: Partial<Patient>,
  doctorName: string = 'Dr. Priya Sharma'
): Promise<Patient> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  const index = patients.findIndex(
    (p) => p.id.toLowerCase() === patientId.toLowerCase() || p.patientId.toLowerCase() === patientId.toLowerCase()
  );

  if (index === -1) {
    throw new Error('Patient record not found.');
  }

  const current = patients[index];
  const updated: Patient = {
    ...current,
    ...updateData,
    name: updateData.firstName && updateData.lastName ? `${updateData.firstName} ${updateData.lastName}` : (updateData.name || current.name),
  };

  patients[index] = updated;
  setItem(STORAGE_KEYS.PATIENTS, patients);

  await addTimelineEvent({
    patientId: current.patientId,
    eventType: 'PATIENT_UPDATED',
    title: 'Patient Profile Updated',
    description: 'Clinical contact details or demography updated.',
    actorName: doctorName,
  });

  await logAuditEvent('PATIENT_PROFILE_UPDATED', 'Patient', current.id, { patientId: current.patientId });

  return updated;
}
