import { DoctorRegistrationRecord, DoctorDocument, AuthSession, ApprovalStatus } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage, hashPassword } from './storage';
import { logAuditEvent } from './auditService';
import { UploadedDocFile } from '../components/ui/DocumentUpload';

initStorage();

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  if (!username || username.trim().length < 3) return false;
  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const exists = registrations.some(
    (r) => r.username.toLowerCase() === username.toLowerCase() || r.email.toLowerCase() === username.toLowerCase()
  );
  return !exists;
}

export async function registerDoctor(
  formData: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    specialization: string;
    medicalRegistrationNumber: string;
    qualification: string;
    yearsOfExperience: number;
    medicalCouncil: string;
    clinicName: string;
    clinicAddress: string;
    username: string;
    password: string;
  },
  uploadedDocs: UploadedDocFile[]
): Promise<DoctorRegistrationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 300));

  // Check username uniqueness
  const isAvailable = await checkUsernameAvailability(formData.username);
  if (!isAvailable) {
    throw new Error('Username or email already exists. Please choose a different username.');
  }

  const passwordHash = await hashPassword(formData.password);
  const doctorId = `doc-${Date.now()}`;
  const applicationId = `CF-APP-${Math.floor(1000 + Math.random() * 9000)}`;

  const docRecords: DoctorDocument[] = uploadedDocs.map((doc) => ({
    id: doc.id,
    doctorId,
    documentType: doc.documentType,
    fileName: doc.fileName,
    fileUrl: doc.fileUrl,
    mimeType: doc.mimeType,
    fileSize: doc.fileSize,
    uploadedAt: new Date().toISOString(),
    verificationStatus: 'PENDING',
  }));

  const newRegistration: DoctorRegistrationRecord = {
    id: doctorId,
    authUserId: `auth-${doctorId}`,
    applicationId,
    firstName: formData.firstName,
    lastName: formData.lastName,
    dateOfBirth: formData.dateOfBirth,
    gender: formData.gender,
    email: formData.email,
    phone: formData.phone,
    username: formData.username,
    passwordHash,
    specialization: formData.specialization,
    medicalRegistrationNumber: formData.medicalRegistrationNumber,
    qualification: formData.qualification,
    yearsOfExperience: formData.yearsOfExperience || 1,
    medicalCouncil: formData.medicalCouncil,
    clinicName: formData.clinicName,
    clinicAddress: formData.clinicAddress,
    approvalStatus: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    documents: docRecords,
  };

  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);
  setItem(STORAGE_KEYS.REGISTRATIONS, [newRegistration, ...registrations]);

  await logAuditEvent(
    'DOCTOR_REGISTERED',
    'DoctorRegistration',
    newRegistration.id,
    {
      applicationId: newRegistration.applicationId,
      doctorName: `Dr. ${newRegistration.firstName} ${newRegistration.lastName}`,
      specialization: newRegistration.specialization,
    },
    newRegistration.id,
    `Dr. ${newRegistration.firstName} ${newRegistration.lastName}`,
    'DOCTOR'
  );

  return newRegistration;
}

export async function loginUser(
  usernameOrEmail: string,
  passwordAttempt: string
): Promise<{ session?: AuthSession; status: ApprovalStatus; rejectionReason?: string; applicationId?: string; doctorName?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const inputHash = await hashPassword(passwordAttempt);

  const matched = registrations.find(
    (r) =>
      (r.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        r.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
      r.passwordHash === inputHash
  );

  if (!matched) {
    throw new Error('Invalid username/email or password.');
  }

  const doctorName = `Dr. ${matched.firstName} ${matched.lastName}`;

  if (matched.approvalStatus === 'PENDING') {
    await logAuditEvent('DOCTOR_LOGIN_ATTEMPT_PENDING', 'DoctorRegistration', matched.id, {}, matched.id, doctorName, 'DOCTOR');
    return {
      status: 'PENDING',
      applicationId: matched.applicationId,
      doctorName,
    };
  }

  if (matched.approvalStatus === 'REJECTED') {
    await logAuditEvent('DOCTOR_LOGIN_ATTEMPT_REJECTED', 'DoctorRegistration', matched.id, {}, matched.id, doctorName, 'DOCTOR');
    return {
      status: 'REJECTED',
      rejectionReason: matched.rejectionReason,
      applicationId: matched.applicationId,
      doctorName,
    };
  }

  // Status is APPROVED -> establish authenticated doctor session!
  const session: AuthSession = {
    userId: matched.authUserId,
    username: matched.username,
    email: matched.email,
    name: doctorName,
    role: 'DOCTOR',
    approvalStatus: 'APPROVED',
    token: `token-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    loginAt: new Date().toISOString(),
    doctorId: matched.id,
    applicationId: matched.applicationId,
  };

  setItem(STORAGE_KEYS.SESSION, session);

  // Sync current active doctor record for Phase 1 dashboard compatibility
  setItem(STORAGE_KEYS.DOCTOR, {
    id: matched.id,
    name: doctorName,
    firstName: matched.firstName,
    lastName: matched.lastName,
    specialization: matched.specialization,
    email: matched.email,
    phone: matched.phone,
    clinicName: matched.clinicName,
    profilePhoto: matched.profilePhoto,
    approvalStatus: 'APPROVED',
  });

  await logAuditEvent('DOCTOR_LOGGED_IN', 'DoctorRegistration', matched.id, {}, matched.id, doctorName, 'DOCTOR');

  return {
    session,
    status: 'APPROVED',
    doctorName,
  };
}

export async function loginAdmin(
  usernameOrEmail: string,
  passwordAttempt: string
): Promise<AuthSession> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const adminUsers = getItem<any[]>(STORAGE_KEYS.ADMIN_USERS, []);
  const inputHash = await hashPassword(passwordAttempt);

  const matched = adminUsers.find(
    (a) =>
      (a.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
        a.email.toLowerCase() === usernameOrEmail.toLowerCase()) &&
      a.passwordHash === inputHash
  );

  if (!matched) {
    throw new Error('Invalid admin credentials.');
  }

  const session: AuthSession = {
    userId: matched.id,
    username: matched.username,
    email: matched.email,
    name: matched.name,
    role: 'ADMIN',
    approvalStatus: 'APPROVED',
    token: `admin-token-${Date.now()}`,
    loginAt: new Date().toISOString(),
  };

  setItem(STORAGE_KEYS.SESSION, session);

  await logAuditEvent('ADMIN_LOGGED_IN', 'AdminUser', matched.id, {}, matched.id, matched.name, 'ADMIN');

  return session;
}

export function getStoredSession(): AuthSession | null {
  return getItem<AuthSession | null>(STORAGE_KEYS.SESSION, null);
}

export function logoutUser(): void {
  const current = getStoredSession();
  if (current) {
    logAuditEvent('USER_LOGGED_OUT', 'AuthSession', current.userId, {}, current.userId, current.name, current.role);
  }
  localStorage.removeItem(STORAGE_KEYS.SESSION);
}

export async function getRegistrationStatus(query: string): Promise<DoctorRegistrationRecord | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const registrations = getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);
  const trimmed = query.trim().toLowerCase();
  return registrations.find(
    (r) =>
      r.applicationId.toLowerCase() === trimmed ||
      r.username.toLowerCase() === trimmed ||
      r.email.toLowerCase() === trimmed
  );
}
