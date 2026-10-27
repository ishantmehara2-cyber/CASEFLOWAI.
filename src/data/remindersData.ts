import { MedicationReminder } from '../types';

export const demoReminders: MedicationReminder[] = [
  {
    id: 'rem-1',
    time: '8:00 AM',
    patientName: 'Rahul Sharma',
    patientPhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150',
    medication: 'Crocin',
    dosage: '200 mg',
    status: 'Scheduled',
  },
  {
    id: 'rem-2',
    time: '10:00 AM',
    patientName: 'Neha Gupta',
    patientPhoto: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150&h=150',
    medication: 'Vitamin D3',
    dosage: '60000 IU',
    status: 'Scheduled',
  },
  {
    id: 'rem-3',
    time: '2:00 PM',
    patientName: 'Aman Shah',
    patientPhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150',
    medication: 'Metformin',
    dosage: '500 mg',
    status: 'Scheduled',
  },
  {
    id: 'rem-4',
    time: '6:00 PM',
    patientName: 'Priya Patel',
    patientPhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150&h=150',
    medication: 'Iron Supplement',
    dosage: '1 tablet',
    status: 'Scheduled',
  },
];
