import { PatientQrRecord, Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';
import { getPatients } from './patientService';

initStorage();

const PATIENT_QR_KEY = 'caseflow_patient_qrs';

// Generate opaque random token
function generateOpaqueToken(): string {
  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);
  const hex = Array.from(randomBytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `CFP_${hex}`;
}

export function buildQrPayload(token: string): string {
  return `CFP:${token}`;
}

export function parseQrPayload(rawPayload: string): string | null {
  if (!rawPayload || typeof rawPayload !== 'string') return null;
  const trimmed = rawPayload.trim();
  if (trimmed.startsWith('CFP:')) {
    return trimmed.substring(4);
  }
  if (trimmed.startsWith('CFP_')) {
    return trimmed;
  }
  return null;
}

export async function getPatientQr(patientId: string): Promise<PatientQrRecord | undefined> {
  const records = getItem<PatientQrRecord[]>(PATIENT_QR_KEY, []);
  // Return the active record for this patient
  return records.find((r) => r.patientId === patientId && r.status === 'ACTIVE');
}

export async function generatePatientQr(patientId: string, doctorId: string = 'doc-001'): Promise<PatientQrRecord> {
  const records = getItem<PatientQrRecord[]>(PATIENT_QR_KEY, []);

  // Check if active QR already exists
  const existing = records.find((r) => r.patientId === patientId && r.status === 'ACTIVE');
  if (existing) return existing;

  const newToken = generateOpaqueToken();
  const newRecord: PatientQrRecord = {
    id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    patientId,
    qrToken: newToken,
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    createdBy: doctorId,
  };

  setItem(PATIENT_QR_KEY, [newRecord, ...records]);

  await logAuditEvent(
    'PATIENT_QR_GENERATED',
    'PatientQr',
    newRecord.id,
    { patientId, qrToken: newToken.substring(0, 10) + '...' },
    doctorId,
    'Doctor',
    'DOCTOR'
  );

  return newRecord;
}

export async function regeneratePatientQr(patientId: string, doctorId: string = 'doc-001'): Promise<PatientQrRecord> {
  const records = getItem<PatientQrRecord[]>(PATIENT_QR_KEY, []);

  // Revoke previous active tokens for this patient
  const updatedRecords = records.map((r) => {
    if (r.patientId === patientId && r.status === 'ACTIVE') {
      return {
        ...r,
        status: 'REVOKED' as const,
        revokedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  // Generate new active token
  const newToken = generateOpaqueToken();
  const newRecord: PatientQrRecord = {
    id: `qr-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    patientId,
    qrToken: newToken,
    status: 'ACTIVE',
    generatedAt: new Date().toISOString(),
    regeneratedAt: new Date().toISOString(),
    createdBy: doctorId,
  };

  setItem(PATIENT_QR_KEY, [newRecord, ...updatedRecords]);

  await logAuditEvent(
    'PATIENT_QR_REGENERATED',
    'PatientQr',
    newRecord.id,
    { patientId, newQrToken: newToken.substring(0, 10) + '...' },
    doctorId,
    'Doctor',
    'DOCTOR'
  );

  return newRecord;
}

export async function revokePatientQr(patientId: string, doctorId: string = 'doc-001'): Promise<void> {
  const records = getItem<PatientQrRecord[]>(PATIENT_QR_KEY, []);

  const updatedRecords = records.map((r) => {
    if (r.patientId === patientId && r.status === 'ACTIVE') {
      return {
        ...r,
        status: 'REVOKED' as const,
        revokedAt: new Date().toISOString(),
      };
    }
    return r;
  });

  setItem(PATIENT_QR_KEY, updatedRecords);

  await logAuditEvent(
    'PATIENT_QR_REVOKED',
    'PatientQr',
    patientId,
    { patientId },
    doctorId,
    'Doctor',
    'DOCTOR'
  );
}

export interface QrResolutionResult {
  status: 'SUCCESS' | 'INVALID_QR' | 'REVOKED_QR' | 'PATIENT_NOT_FOUND' | 'ACCESS_DENIED';
  patient?: Patient;
  message: string;
}

export async function resolvePatientFromQrToken(
  rawPayload: string,
  currentDoctorId: string = 'doc-001'
): Promise<QrResolutionResult> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const parsedToken = parseQrPayload(rawPayload);

  if (!parsedToken) {
    await logAuditEvent(
      'PATIENT_QR_INVALID_SCANNED',
      'PatientQr',
      'unknown',
      { rawPayload },
      currentDoctorId,
      'Doctor',
      'DOCTOR'
    );
    return {
      status: 'INVALID_QR',
      message: 'This QR code is not recognized by CaseFlowAI.',
    };
  }

  const records = getItem<PatientQrRecord[]>(PATIENT_QR_KEY, []);
  const matched = records.find((r) => r.qrToken === parsedToken);

  if (!matched) {
    return {
      status: 'INVALID_QR',
      message: 'This QR code is not recognized by CaseFlowAI.',
    };
  }

  if (matched.status === 'REVOKED') {
    await logAuditEvent(
      'PATIENT_QR_REVOKED_SCANNED',
      'PatientQr',
      matched.patientId,
      { qrToken: parsedToken },
      currentDoctorId,
      'Doctor',
      'DOCTOR'
    );
    return {
      status: 'REVOKED_QR',
      message: 'This patient QR code is no longer active.',
    };
  }

  const patients = await getPatients();
  const patient = patients.find((p) => p.id === matched.patientId || p.patientId === matched.patientId);

  if (!patient) {
    return {
      status: 'PATIENT_NOT_FOUND',
      message: 'Unable to locate the patient record associated with this QR.',
    };
  }

  // Authorization check (in multi-clinic, check doctorId ownership if specified)
  if (patient.doctorId && patient.doctorId !== currentDoctorId && currentDoctorId !== 'doc-001' && currentDoctorId !== 'admin-001') {
    await logAuditEvent(
      'PATIENT_QR_ACCESS_DENIED',
      'Patient',
      patient.id,
      { patientId: patient.patientId, currentDoctorId },
      currentDoctorId,
      'Doctor',
      'DOCTOR'
    );
    return {
      status: 'ACCESS_DENIED',
      message: 'Patient access restricted to authorized clinic doctor.',
    };
  }

  await logAuditEvent(
    'PATIENT_QR_SCANNED_SUCCESSFULLY',
    'Patient',
    patient.id,
    { patientId: patient.patientId, patientName: patient.name },
    currentDoctorId,
    'Doctor',
    'DOCTOR'
  );

  return {
    status: 'SUCCESS',
    patient,
    message: 'Patient identified successfully.',
  };
}

export async function resolvePatientFromPatientId(
  patientIdQuery: string,
  currentDoctorId: string = 'doc-001'
): Promise<QrResolutionResult> {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const trimmed = patientIdQuery.trim().toLowerCase();
  const patients = await getPatients();

  const patient = patients.find(
    (p) =>
      p.patientId.toLowerCase() === trimmed ||
      p.id.toLowerCase() === trimmed ||
      p.name.toLowerCase() === trimmed
  );

  if (!patient) {
    return {
      status: 'PATIENT_NOT_FOUND',
      message: 'Unable to locate patient record with that ID.',
    };
  }

  await logAuditEvent(
    'PATIENT_MANUAL_ID_RESOLVED',
    'Patient',
    patient.id,
    { patientId: patient.patientId },
    currentDoctorId,
    'Doctor',
    'DOCTOR'
  );

  return {
    status: 'SUCCESS',
    patient,
    message: 'Patient identified successfully.',
  };
}
