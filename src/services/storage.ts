import { DoctorRegistrationRecord, DoctorDocument, AuditLog, AuthSession } from '../types';
import { currentDoctor as defaultSeedDoctor } from '../data/doctorData';

const STORAGE_KEYS = {
  DOCTOR: 'caseflow_doctor',
  PATIENTS: 'caseflow_patients',
  REMINDERS: 'caseflow_reminders',
  ACTIVITIES: 'caseflow_activities',
  REGISTRATIONS: 'caseflow_registrations',
  ADMIN_USERS: 'caseflow_admin_users',
  AUDIT_LOGS: 'caseflow_audit_logs',
  SESSION: 'caseflow_session',
  IS_INITIALIZED: 'caseflow_initialized_v2',
};

// SHA-256 Password Hashing Helper using Web Crypto API
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`caseflow_salt_${password}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Seed pre-approved doctor and default admin account
export async function initStorage(forceEmpty = false) {
  if (forceEmpty) {
    localStorage.clear();
  }

  if (!localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED)) {
    const passwordHash = await hashPassword('password123');
    const adminPasswordHash = await hashPassword('AdminPass123!');

    // Default pre-approved doctor (Dr. Priya Sharma) for seamless Phase 1 compatibility
    const defaultDoctorReg: DoctorRegistrationRecord = {
      id: 'doc-001',
      authUserId: 'auth-doc-001',
      applicationId: 'CF-APP-1001',
      firstName: 'Priya',
      lastName: 'Sharma',
      dateOfBirth: '1988-05-14',
      gender: 'Female',
      email: 'dr.priya@caseflowai.med',
      phone: '+91 98765 43210',
      username: 'dr.priya@caseflowai.med',
      passwordHash: passwordHash,
      specialization: 'General Physician',
      medicalRegistrationNumber: 'MCI-884920',
      qualification: 'MBBS, MD',
      yearsOfExperience: 10,
      medicalCouncil: 'Medical Council of India',
      clinicName: 'Apollo Clinical Care Center',
      clinicAddress: '42 Health Care Avenue',
      clinicCity: 'New Delhi',
      clinicState: 'Delhi',
      clinicPin: '110001',
      clinicPhone: '+91 11 2685 7000',
      clinicEmail: 'contact@apollocare.med',
      clinicWebsite: 'https://apollocare.med',
      profilePhoto: defaultSeedDoctor.profilePhoto,
      approvalStatus: 'APPROVED',
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      approvedBy: 'admin-001',
      documents: [
        {
          id: 'doc-seed-1',
          doctorId: 'doc-001',
          documentType: 'registration_certificate',
          fileName: 'MCI_Registration_Cert_PriyaSharma.pdf',
          fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
          mimeType: 'application/pdf',
          fileSize: 1024 * 450,
          uploadedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
          verificationStatus: 'VERIFIED',
        },
      ],
    };

    // Default Admin User
    const defaultAdmin = {
      id: 'admin-001',
      username: 'admin',
      email: 'admin@caseflowai.med',
      passwordHash: adminPasswordHash,
      name: 'System Admin',
      role: 'ADMIN',
    };

    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([defaultDoctorReg]));
    localStorage.setItem(STORAGE_KEYS.ADMIN_USERS, JSON.stringify([defaultAdmin]));
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
  }
}

export function clearDatabase() {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
}

export function seedDemoDatabase() {
  initStorage(true);
}

export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return defaultValue;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export { STORAGE_KEYS };
