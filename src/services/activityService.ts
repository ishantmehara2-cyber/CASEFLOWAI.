import { ActivityItem } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';

initStorage();

export async function getRecentActivities(): Promise<ActivityItem[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  return getItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, []);
}

export async function logActivity(activity: Omit<ActivityItem, 'id' | 'timestamp'>): Promise<ActivityItem> {
  const activities = getItem<ActivityItem[]>(STORAGE_KEYS.ACTIVITIES, []);
  const newActivity: ActivityItem = {
    id: `act-${Date.now()}`,
    ...activity,
    timestamp: 'Just now',
  };
  const updated = [newActivity, ...activities];
  setItem(STORAGE_KEYS.ACTIVITIES, updated);
  return newActivity;
}
