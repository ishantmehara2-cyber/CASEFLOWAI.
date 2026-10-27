import { DoctorRegistrationRecord, AdminMetrics } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';

initStorage();

export async function getAllDoctorApplications(): Promise<DoctorRegistrationRecord[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return getItem<DoctorRegistrationRecord[]>(STORAGE_KEYS.REGISTRATIONS, []);
}

export async function getPendingDoctorApplications(): Promise<DoctorRegistrationRecord[]> {
  const all = await getAllDoctorApplications();
  return all.filter((doc) => doc.approvalStatus === 'PENDING');
}

export async function getDoctorApplicationById(id: string): Promise<DoctorRegistrationRecord | undefined> {
  const all = await getAllDoctorApplications();
  return all.find((doc) => doc.id === id || doc.applicationId === id);
}

export async function getAdminMetrics(): Promise<AdminMetrics> {
  const all = await getAllDoctorApplications();
  return {
    pendingCount: all.filter((d) => d.approvalStatus === 'PENDING').length,
    approvedCount: all.filter((d) => d.approvalStatus === 'APPROVED').length,
    rejectedCount: all.filter((d) => d.approvalStatus === 'REJECTED').length,
    totalDoctorsCount: all.length,
  };
}

export async function approveDoctorApplication(
  doctorId: string,
  adminId: string = 'admin-001',
  adminName: string = 'System Admin'
): Promise<DoctorRegistrationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const all = await getAllDoctorApplications();
  const index = all.findIndex((d) => d.id === doctorId || d.applicationId === doctorId);

  if (index === -1) {
    throw new Error('Doctor application record not found.');
  }

  const doc = all[index];

  if (doc.approvalStatus !== 'PENDING') {
    throw new Error(`Application is already in ${doc.approvalStatus} status.`);
  }

  const updatedDoc: DoctorRegistrationRecord = {
    ...doc,
    approvalStatus: 'APPROVED',
    approvedAt: new Date().toISOString(),
    approvedBy: adminId,
    updatedAt: new Date().toISOString(),
    documents: doc.documents.map((d) => ({ ...d, verificationStatus: 'VERIFIED' })),
  };

  all[index] = updatedDoc;
  setItem(STORAGE_KEYS.REGISTRATIONS, all);

  await logAuditEvent(
    'DOCTOR_APPLICATION_APPROVED',
    'DoctorRegistration',
    doc.id,
    {
      doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
      applicationId: doc.applicationId,
      specialization: doc.specialization,
    },
    adminId,
    adminName,
    'ADMIN'
  );

  return updatedDoc;
}

export async function rejectDoctorApplication(
  doctorId: string,
  rejectionReason: string,
  adminId: string = 'admin-001',
  adminName: string = 'System Admin'
): Promise<DoctorRegistrationRecord> {
  await new Promise((resolve) => setTimeout(resolve, 200));

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error('A rejection reason is strictly required.');
  }

  const all = await getAllDoctorApplications();
  const index = all.findIndex((d) => d.id === doctorId || d.applicationId === doctorId);

  if (index === -1) {
    throw new Error('Doctor application record not found.');
  }

  const doc = all[index];

  const updatedDoc: DoctorRegistrationRecord = {
    ...doc,
    approvalStatus: 'REJECTED',
    rejectionReason: rejectionReason.trim(),
    updatedAt: new Date().toISOString(),
    documents: doc.documents.map((d) => ({ ...d, verificationStatus: 'REJECTED' })),
  };

  all[index] = updatedDoc;
  setItem(STORAGE_KEYS.REGISTRATIONS, all);

  await logAuditEvent(
    'DOCTOR_APPLICATION_REJECTED',
    'DoctorRegistration',
    doc.id,
    {
      doctorName: `Dr. ${doc.firstName} ${doc.lastName}`,
      applicationId: doc.applicationId,
      rejectionReason: rejectionReason.trim(),
    },
    adminId,
    adminName,
    'ADMIN'
  );

  return updatedDoc;
}
