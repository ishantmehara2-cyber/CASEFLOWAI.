import { Doctor } from '../types';

export const currentDoctor: Doctor = {
  id: 'doc-001',
  name: 'Dr. Priya Sharma',
  specialization: 'General Physician',
  email: 'priya.sharma@caseflowai.med',
  clinicName: 'Apollo Clinical Care Center',
  // Profile photo placeholder path, handles initials gracefully if undefined/fails
  profilePhoto: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200&h=200',
};
