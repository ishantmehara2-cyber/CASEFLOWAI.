export type ReminderStatus =
  | 'DRAFT'
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'FAILED';

export type ReminderChannel = 'VOICE_CALL' | 'SMS' | 'EMAIL';

export type ReminderEventStatus =
  | 'SCHEDULED'
  | 'QUEUED'
  | 'INITIATED'
  | 'RINGING'
  | 'ANSWERED'
  | 'COMPLETED'
  | 'NO_ANSWER'
  | 'BUSY'
  | 'FAILED'
  | 'CANCELLED';

export interface MedicationSnapshot {
  medicationName: string;
  strength?: string;
  dosage: string;
  frequency: string;
  instructions?: string;
}

export interface ReminderEvent {
  id: string;
  reminderId: string;
  patientId: string;
  scheduledAt: string;
  attemptedAt?: string;
  channel: ReminderChannel;
  provider: string;
  providerMessageId?: string;
  status: ReminderEventStatus;
  failureReason?: string;
  callDuration?: number; // in seconds
  createdAt: string;
}

export interface MedicationReminderRecord {
  id: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  clinicName: string;
  prescriptionId: string;
  prescriptionNumber: string;
  medicationName: string;
  dosageSnapshot: string;
  frequency: string;
  startDate: string;
  endDate: string;
  scheduledTimes: string[]; // e.g. ["08:00 AM", "08:00 PM"]
  timezone: string;
  channel: ReminderChannel;
  status: ReminderStatus;
  patientPhone: string;
  events?: ReminderEvent[];
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
  pausedAt?: string;
  completedAt?: string;
}

export interface VoiceCallRequest {
  toPhone: string;
  patientName: string;
  clinicName: string;
  medicationName: string;
  dosage: string;
  language?: string;
}

export interface VoiceCallResult {
  success: boolean;
  callId?: string;
  provider: string;
  status: ReminderEventStatus;
  duration?: number;
  error?: string;
}
