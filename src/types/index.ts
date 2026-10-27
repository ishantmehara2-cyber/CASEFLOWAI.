export type PatientStatus =
  | 'Active'
  | 'Follow-up'
  | 'Review'
  | 'Scheduled'
  | 'Pending'
  | 'Approved'
  | 'Rejected'
  | 'Completed'
  | 'Failed';

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  phone?: string;
  specialization: string;
  medicalRegistrationNumber?: string;
  qualification?: string;
  yearsOfExperience?: number | string;
  medicalCouncil?: string;
  clinicName: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicState?: string;
  clinicPin?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  website?: string;
  clinicLicenseNumber?: string;
  profilePhoto?: string;
  approvalStatus?: 'Approved' | 'Pending' | 'Rejected';
  role?: string;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other';
  phone?: string;
  email?: string;
  lastVisit: string;
  reportCount: number;
  status: PatientStatus;
  profilePhoto?: string;
}

export interface MetricData {
  id: string;
  label: string;
  value: string | number;
  change: string;
  supportingText: string;
  icon: 'users' | 'calendar' | 'document' | 'bell';
  trendType?: 'positive' | 'neutral' | 'negative' | 'warning';
}

export interface MedicationReminder {
  id: string;
  time: string;
  patientName: string;
  patientPhoto?: string;
  medication: string;
  dosage: string;
  status: PatientStatus;
}

export interface ConsultationTrendPoint {
  date: string;
  count: number;
}

export interface ReportsOverviewData {
  total: number;
  normal: number;
  abnormal: number;
  needsReview: number;
  others: number;
}

export interface ActivityItem {
  id: string;
  type: 'report' | 'patient' | 'prescription' | 'reminder';
  title: string;
  subtitle: string;
  timestamp: string;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  title: string;
  message?: string;
  type: ToastType;
}
