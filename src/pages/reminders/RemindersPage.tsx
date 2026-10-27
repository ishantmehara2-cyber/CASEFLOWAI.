import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { Bell } from 'lucide-react';

export const RemindersPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Medication Reminders Engine"
      subtitle="Automated SMS & voice medication compliance scheduler"
      icon={<Bell className="w-5 h-5" />}
      phaseNumber={6}
      upcomingFeatures={[
        'Cron-based daily medication alert trigger',
        'Twilio / Telephony API outbound call dispatcher',
        'Patient compliance response tracker (Yes/No response)',
        'Doctor adherence dashboard alerts'
      ]}
    />
  );
};
