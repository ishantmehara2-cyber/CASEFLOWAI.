import { ActivityItem } from '../types';

export const demoActivities: ActivityItem[] = [
  {
    id: 'act-1',
    type: 'report',
    title: 'New report uploaded',
    subtitle: 'Rahul Sharma',
    timestamp: '2 min ago',
  },
  {
    id: 'act-2',
    type: 'patient',
    title: 'New patient registered',
    subtitle: 'Suresh Iyer',
    timestamp: '1 hour ago',
  },
  {
    id: 'act-3',
    type: 'prescription',
    title: 'Prescription added',
    subtitle: 'Priya Patel',
    timestamp: '2 hours ago',
  },
  {
    id: 'act-4',
    type: 'reminder',
    title: 'Medication reminder scheduled',
    subtitle: 'Aman Shah',
    timestamp: '3 hours ago',
  },
];
