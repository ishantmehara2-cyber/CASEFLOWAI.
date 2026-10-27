import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { ShieldAlert } from 'lucide-react';

export const AdminPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Administrator Control Panel"
      subtitle="Doctor verification, clinic onboarding, and license approvals"
      icon={<ShieldAlert className="w-5 h-5" />}
      phaseNumber={2}
      upcomingFeatures={[
        'Pending doctor registration review queue',
        'Clinic license approval workflow',
        'System audit logs & security tracking',
        'Global platform metrics'
      ]}
    />
  );
};
