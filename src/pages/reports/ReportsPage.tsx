import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { FileText } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Medical Reports Intelligence"
      subtitle="Lab diagnostic extraction & automated report comparison"
      icon={<FileText className="w-5 h-5" />}
      phaseNumber={4}
      upcomingFeatures={[
        'PDF & image OCR lab result parser',
        'Abnormal lab value flag highlighting',
        'Longitudinal lab trend comparison graphs',
        'Multi-lingual patient summary generator'
      ]}
    />
  );
};
