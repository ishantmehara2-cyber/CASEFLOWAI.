import { MedicationReminderRecord, ReminderStatus, ReminderChannel, ReminderEvent } from '../types/reminder';
import { Prescription, PrescriptionItem } from '../types/consultation';
import { Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';
import { initiateVoiceCall } from './voiceCallService';
import { addTimelineEvent } from './patientMedicalMemoryService';

initStorage();

const KEYS = {
  REMINDERS: 'caseflow_medication_reminders',
};

// Seed sample reminders if empty
function initSeedReminders() {
  if (!localStorage.getItem('caseflow_reminders_v2_initialized')) {
    const defaultReminders: MedicationReminderRecord[] = [
      {
        id: 'rem-001',
        patientId: 'CF-00182',
        patientName: 'Aarav Patel',
        doctorId: 'doc-001',
        doctorName: 'Dr. Priya Sharma',
        clinicName: 'Apollo Clinical Care Center',
        prescriptionId: 'rx-001',
        prescriptionNumber: 'CF-RX-2026-100182',
        medicationName: 'Metformin',
        dosageSnapshot: '500 mg • 1 tablet',
        frequency: 'Twice daily',
        startDate: '2026-10-26',
        endDate: '2026-11-25',
        scheduledTimes: ['08:00 AM', '08:00 PM'],
        timezone: 'Asia/Kolkata',
        channel: 'VOICE_CALL',
        status: 'ACTIVE',
        patientPhone: '+91 98765 43210',
        activatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        events: [
          {
            id: 'evt-001',
            reminderId: 'rem-001',
            patientId: 'CF-00182',
            scheduledAt: '2026-10-26 08:00 AM',
            attemptedAt: '2026-10-26 08:00 AM',
            channel: 'VOICE_CALL',
            provider: 'Twilio-Voice-Production-Adapter',
            providerMessageId: 'call-sim-001',
            status: 'COMPLETED',
            callDuration: 16,
            createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          },
        ],
      },
    ];

    setItem(KEYS.REMINDERS, defaultReminders);
    localStorage.setItem('caseflow_reminders_v2_initialized', 'true');
  }
}

initSeedReminders();

export async function getAllReminders(): Promise<MedicationReminderRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return getItem<MedicationReminderRecord[]>(KEYS.REMINDERS, []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function getPatientReminders(patientId: string): Promise<MedicationReminderRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  const list = getItem<MedicationReminderRecord[]>(KEYS.REMINDERS, []);
  return list
    .filter((r) => r.patientId.toLowerCase() === patientId.toLowerCase())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createMedicationReminder(
  prescription: Prescription,
  item: PrescriptionItem,
  patient: Patient,
  doctor: { id: string; name: string; clinicName: string },
  scheduledTimes: string[],
  channel: ReminderChannel = 'VOICE_CALL'
): Promise<MedicationReminderRecord> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const list = getItem<MedicationReminderRecord[]>(KEYS.REMINDERS, []);

  if (!patient.phone) {
    throw new Error('Patient phone number is required to configure voice medication reminders.');
  }

  const now = new Date().toISOString();
  const reminderId = `rem-${Date.now()}`;

  const startDate = new Date().toISOString().split('T')[0];
  const endDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

  const record: MedicationReminderRecord = {
    id: reminderId,
    patientId: patient.patientId,
    patientName: patient.name,
    doctorId: doctor.id,
    doctorName: doctor.name,
    clinicName: doctor.clinicName,
    prescriptionId: prescription.id,
    prescriptionNumber: prescription.prescriptionNumber,
    medicationName: item.medicineName,
    dosageSnapshot: `${item.strength || ''} • ${item.dosage}`.trim(),
    frequency: item.frequency,
    startDate,
    endDate,
    scheduledTimes,
    timezone: 'Asia/Kolkata',
    channel,
    status: 'ACTIVE',
    patientPhone: patient.phone,
    activatedAt: now,
    createdAt: now,
    updatedAt: now,
    events: [
      {
        id: `evt-${Date.now()}`,
        reminderId,
        patientId: patient.patientId,
        scheduledAt: `${startDate} ${scheduledTimes[0] || '08:00 AM'}`,
        channel,
        provider: 'Twilio-Voice-Production-Adapter',
        status: 'SCHEDULED',
        createdAt: now,
      },
    ],
  };

  setItem(KEYS.REMINDERS, [record, ...list]);

  await logAuditEvent('MEDICATION_REMINDER_CREATED', 'MedicationReminder', reminderId, {
    patientId: patient.patientId,
    medicationName: item.medicineName,
  });

  await addTimelineEvent({
    patientId: patient.patientId,
    eventType: 'REMINDER_SCHEDULED',
    title: `Medication Reminder Activated: ${item.medicineName}`,
    description: `Automated voice reminder scheduled (${item.frequency}, times: ${scheduledTimes.join(', ')}).`,
    actorName: doctor.name,
  });

  return record;
}

export async function setReminderStatus(reminderId: string, status: ReminderStatus): Promise<MedicationReminderRecord> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const list = getItem<MedicationReminderRecord[]>(KEYS.REMINDERS, []);
  const idx = list.findIndex((r) => r.id === reminderId);

  if (idx === -1) {
    throw new Error('Medication reminder record not found.');
  }

  const now = new Date().toISOString();
  const record = list[idx];

  record.status = status;
  record.updatedAt = now;
  if (status === 'ACTIVE' && !record.activatedAt) record.activatedAt = now;
  if (status === 'PAUSED') record.pausedAt = now;
  if (status === 'COMPLETED') record.completedAt = now;

  list[idx] = record;
  setItem(KEYS.REMINDERS, list);

  await logAuditEvent(`MEDICATION_REMINDER_${status}`, 'MedicationReminder', reminderId, { patientId: record.patientId });

  return record;
}

export async function sendTestVoiceCall(reminderId: string): Promise<{ success: boolean; message: string }> {
  const list = getItem<MedicationReminderRecord[]>(KEYS.REMINDERS, []);
  const reminder = list.find((r) => r.id === reminderId);

  if (!reminder) {
    throw new Error('Medication reminder not found.');
  }

  const result = await initiateVoiceCall({
    toPhone: reminder.patientPhone,
    patientName: reminder.patientName,
    clinicName: reminder.clinicName,
    medicationName: reminder.medicationName,
    dosage: reminder.dosageSnapshot,
  });

  if (result.success) {
    // Record test event
    const now = new Date().toISOString();
    const newEvent: ReminderEvent = {
      id: `evt-${Date.now()}`,
      reminderId: reminder.id,
      patientId: reminder.patientId,
      scheduledAt: now,
      attemptedAt: now,
      channel: 'VOICE_CALL',
      provider: result.provider,
      providerMessageId: result.callId,
      status: 'COMPLETED',
      callDuration: result.duration,
      createdAt: now,
    };

    reminder.events = [newEvent, ...(reminder.events || [])];
    setItem(KEYS.REMINDERS, list);

    await logAuditEvent('MEDICATION_REMINDER_TEST_CALL_SENT', 'MedicationReminder', reminder.id, {
      patientId: reminder.patientId,
      callId: result.callId,
    });

    return { success: true, message: `Test voice call successfully initiated to ${reminder.patientPhone} (Call ID: ${result.callId}).` };
  } else {
    throw new Error(result.error || 'Failed to initiate test voice call.');
  }
}
