export type PatientStatus =
  | 'Active'
  | 'Archived'
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
export type QrStatus = 'ACTIVE' | 'REVOKED';

export interface PatientQrRecord {
  id: string;
  patientId: string;
  qrToken: string;
  status: QrStatus;
  generatedAt: string;
  regeneratedAt?: string;
  revokedAt?: string;
  createdBy?: string;
}

export interface Doctor {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  specialization: string;
  profilePhoto?: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  clinicName: string;
  medicalRegistrationNumber?: string;
  qualification?: string;
  yearsOfExperience?: number;
  medicalCouncil?: string;
  clinicAddress?: string;
  clinicCity?: string;
  clinicState?: string;
  clinicPin?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
  clinicLicenseNumber?: string;
  approvalStatus?: ApprovalStatus;
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
  clinicCity?: string;
  clinicState?: string;
  clinicPin?: string;
  clinicPhone?: string;
  clinicEmail?: string;
  clinicWebsite?: string;
  clinicLicenseNumber?: string;
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

export interface PatientAllergy {
  id: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: 'Mild' | 'Moderate' | 'Severe';
  recordedBy: string;
  recordedDate: string;
  notes?: string;
}

export interface MedicalCondition {
  id: string;
  patientId: string;
  condition: string;
  status: 'Active' | 'Resolved' | 'Managed';
  diagnosedDate: string;
  notes?: string;
}

export interface PatientSurgicalHistory {
  id: string;
  patientId: string;
  procedure: string;
  date: string;
  notes?: string;
}

export interface PatientVisit {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  clinicName: string;
  visitDate: string;
  visitType: 'Initial Consultation' | 'Follow-up' | 'General Consultation' | 'Review';
  chiefComplaint: string;
  notes?: string;
  status: 'Completed' | 'Scheduled' | 'In Progress';
}

export interface TimelineEvent {
  id: string;
  patientId: string;
  eventType:
    | 'PATIENT_REGISTERED'
    | 'PATIENT_UPDATED'
    | 'VISIT_CREATED'
    | 'MEDICAL_HISTORY_ADDED'
    | 'ALLERGY_ADDED'
    | 'REPORT_UPLOADED'
    | 'PRESCRIPTION_CREATED'
    | 'REMINDER_SCHEDULED';
  title: string;
  description: string;
  eventDate: string;
  actorName: string;
}

export interface Patient {
  id: string;
  patientId: string;
  name: string;
  firstName?: string;
  lastName?: string;
  age: number;
  dateOfBirth?: string;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone?: string;
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
  lastVisit: string;
  reportCount: number;
  status: PatientStatus;
  profilePhoto?: string;
  doctorId?: string;
  createdAt?: string;
  updatedAt?: string;
  qrRecord?: PatientQrRecord;
  allergies?: PatientAllergy[];
  conditions?: MedicalCondition[];
  surgicalHistory?: PatientSurgicalHistory[];
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

export type ReportProcessingStatus = 'UPLOADING' | 'UPLOADED' | 'ANALYZING' | 'ANALYZED' | 'FAILED';
export type LabParameterStatus = 'Within range' | 'Below range' | 'Above range' | 'Attention' | 'Not available';

export interface LabParameter {
  id: string;
  parameter: string;
  value: string;
  numericValue?: number;
  unit?: string;
  referenceRange: string;
  status: LabParameterStatus;
  notes?: string;
}

export interface MedicalReportAnalysis {
  id: string;
  reportId: string;
  patientId: string;
  analyzerVersion: string;
  status: 'ANALYZED' | 'FAILED';
  summary: string;
  structuredData: LabParameter[];
  clinicalHighlights: string[];
  doctorAttention: string[];
  followUpPoints: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalReport {
  id: string;
  patientId: string;
  patientName?: string;
  doctorId: string;
  doctorName: string;
  clinicId?: string;
  clinicName?: string;
  fileName: string;
  fileType: 'PDF' | 'JPG' | 'JPEG' | 'PNG';
  fileSize: number;
  fileUrl: string;
  reportType: string;
  uploadedAt: string;
  uploadedBy: string;
  processingStatus: ReportProcessingStatus;
  fingerprint?: string;
  analysis?: MedicalReportAnalysis;
  createdAt: string;
  updatedAt: string;
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
