import { AuditLog, UserRole } from '../types';
import { getItem, setItem, STORAGE_KEYS } from './storage';

export async function logAuditEvent(
  action: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, any>,
  actorId: string = 'system',
  actorName: string = 'System Engine',
  actorRole: UserRole = 'ADMIN'
): Promise<AuditLog> {
  const logs = getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);

  const newLog: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    actorId,
    actorName,
    actorRole,
    action,
    targetType,
    targetId,
    metadata,
    createdAt: new Date().toISOString(),
  };

  const updated = [newLog, ...logs];
  setItem(STORAGE_KEYS.AUDIT_LOGS, updated);
  return newLog;
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  await new Promise((resolve) => setTimeout(resolve, 50));
  return getItem<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS, []);
}
