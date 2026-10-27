import { Doctor, Patient, MedicationReminder, ActivityItem } from '../types';
import { currentDoctor as initialDoctor } from '../data/doctorData';
import { demoPatients as initialPatients } from '../data/patientsData';
import { demoReminders as initialReminders } from '../data/remindersData';
import { demoActivities as initialActivities } from '../data/activityData';

const STORAGE_KEYS = {
  DOCTOR: 'caseflow_doctor',
  PATIENTS: 'caseflow_patients',
  REMINDERS: 'caseflow_reminders',
  ACTIVITIES: 'caseflow_activities',
  IS_INITIALIZED: 'caseflow_initialized',
};

// Initialize default storage on first load if not present
export function initStorage(forceEmpty = false) {
  if (forceEmpty) {
    localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(initialDoctor));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
    return;
  }

  if (!localStorage.getItem(STORAGE_KEYS.IS_INITIALIZED)) {
    localStorage.setItem(STORAGE_KEYS.DOCTOR, JSON.stringify(initialDoctor));
    localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));
    localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
    localStorage.setItem(STORAGE_KEYS.IS_INITIALIZED, 'true');
  }
}

export function clearDatabase() {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify([]));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
}

export function seedDemoDatabase() {
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(initialPatients));
  localStorage.setItem(STORAGE_KEYS.REMINDERS, JSON.stringify(initialReminders));
  localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify(initialActivities));
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
