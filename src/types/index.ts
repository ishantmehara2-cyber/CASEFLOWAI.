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

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type UserRole = 'DOCTOR' | 'ADMIN';

export interface Doctor {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  specialization: string;
  profilePhoto?: string;
  email: string;
  phone?: string;
  clinicName: string;
  medicalRegistrationNumber?: string;
  qualification?: string;
  yearsOfExperience?: number;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  applicationId?: string;
}

export interface DoctorDocument {
  id: string;
  doctorId: string;
  documentType: 'registration_certificate' | 'professional_id' | 'degree_certificate' | 'identity_document';
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedAt: string;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'REJECTED';
}

export interface DoctorRegistrationRecord {
  id: string;
  authUserId: string;
  applicationId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  phone: string;
  username: string;
  passwordHash: string;
  specialization: string;
  medicalRegistrationNumber: string;
  qualification: string;
  yearsOfExperience: number;
  medicalCouncil: string;
  clinicName: string;
  clinicAddress: string;
  profilePhoto?: string;
  approvalStatus: ApprovalStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string;
  approvedBy?: string;
  documents: DoctorDocument[];
}

export interface AuthSession {
  userId: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  approvalStatus: ApprovalStatus;
  token: string;
  loginAt: string;
  doctorId?: string;
  rejectionReason?: string;
  applicationId?: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  targetType: string;
  targetId: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface AdminMetrics {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalDoctorsCount: number;
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
