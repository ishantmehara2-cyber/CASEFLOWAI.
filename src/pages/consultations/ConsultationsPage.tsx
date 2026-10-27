import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { Stethoscope } from 'lucide-react';

export const ConsultationsPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Clinical Consultations"
      subtitle="AI-assisted clinical note taking & audio recording"
      icon={<Stethoscope className="w-5 h-5" />}
      phaseNumber={3}
      upcomingFeatures={[
        'Live ambient clinical voice recorder',
        'Real-time AI SOAP note structuring',
        'Doctor verification & decision sign-off interface',
        'ICD-10 clinical coding suggestions'
      ]}
    />
  );
};
