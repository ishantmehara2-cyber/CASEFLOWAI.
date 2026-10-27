export type ConsultationStatus =
  | 'DRAFT'
  | 'IN_PROGRESS'
  | 'FINALIZED'
  | 'CANCELLED';

export type VisitType =
  | 'NEW_CONSULTATION'
  | 'FOLLOW_UP'
  | 'ROUTINE_CHECKUP'
  | 'EMERGENCY'
  | 'OTHER';

export interface PatientVitals {
  bloodPressure?: string;
  heartRate?: string;
  respiratoryRate?: string;
  temperature?: string;
  spo2?: string;
  weight?: string;
  height?: string;
  bmi?: string;
}

export interface PrescriptionItem {
  id: string;
  medicineName: string;
  genericName?: string;
  strength?: string;
  dosage: string;
  route?: string;
  frequency: string;
  timing?: string;
  duration: string;
  quantity?: number;
  foodInstruction?: string; // e.g. "Take after food"
  notes?: string;
}

export interface Prescription {
  id: string;
  prescriptionNumber: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  clinicName: string;
  visitId: string;
  prescriptionDate: string;
  status: 'DRAFT' | 'FINALIZED';
  clinicalAssessment: string;
  instructions?: string;
  followUp?: string;
  items: PrescriptionItem[];
  createdAt: string;
  finalizedAt?: string;
}

export interface ConsultationRecord {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  clinicName: string;
  visitDate: string;
  visitType: VisitType;
  status: ConsultationStatus;
  chiefComplaint: string;
  historyOfPresentIllness: string;
  vitals: PatientVitals;
  clinicalExamination: string;
  assessment: string;
  plan: string;
  prescriptionId?: string;
  prescription?: Prescription;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  finalizedAt?: string;
}
