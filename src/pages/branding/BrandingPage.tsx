import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { Sparkles } from 'lucide-react';

export const BrandingPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Clinic Branding Customizer"
      subtitle="Personalize prescription letterheads & patient portal design"
      icon={<Sparkles className="w-5 h-5" />}
      phaseNumber={7}
      upcomingFeatures={[
        'Custom clinic logo & letterhead uploader',
        'Doctor signature digital stamp configuration',
        'Custom primary accent color picker for reports',
        'Print-ready prescription header templates'
      ]}
    />
  );
};
