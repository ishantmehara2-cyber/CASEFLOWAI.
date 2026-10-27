import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { Pill } from 'lucide-react';

export const PrescriptionsPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Digital Prescriptions"
      subtitle="E-prescribing, drug interaction checker & branded PDF generator"
      icon={<Pill className="w-5 h-5" />}
      phaseNumber={5}
      upcomingFeatures={[
        'Interactive drug dosage & frequency selector',
        'Real-time contraindication & allergy warning engine',
        'Custom clinic logo stamped digital Rx export',
        'Direct WhatsApp / SMS patient sharing'
      ]}
    />
  );
};
