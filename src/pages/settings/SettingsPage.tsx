import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { Settings } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Clinic & Profile Settings"
      subtitle="Doctor credentials, security preferences, and system configuration"
      icon={<Settings className="w-5 h-5" />}
      phaseNumber={2}
      upcomingFeatures={[
        'Doctor Medical Council registration number verification',
        'Supabase Authentication & Row Level Security (RLS) rules',
        'Clinic staff access control & permissions',
        'System notifications & API key management'
      ]}
    />
  );
};
