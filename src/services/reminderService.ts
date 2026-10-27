import { MedicationReminder } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';

initStorage();

export async function getUpcomingReminders(): Promise<MedicationReminder[]> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  return getItem<MedicationReminder[]>(STORAGE_KEYS.REMINDERS, []);
}

export async function addReminder(reminder: Omit<MedicationReminder, 'id'>): Promise<MedicationReminder> {
  await new Promise((resolve) => setTimeout(resolve, 100));
  const reminders = getItem<MedicationReminder[]>(STORAGE_KEYS.REMINDERS, []);
  const newReminder: MedicationReminder = {
    id: `rem-${Date.now()}`,
    ...reminder,
  };
  const updated = [newReminder, ...reminders];
  setItem(STORAGE_KEYS.REMINDERS, updated);
  return newReminder;
}
