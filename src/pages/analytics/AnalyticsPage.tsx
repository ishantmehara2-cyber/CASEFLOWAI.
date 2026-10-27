import React from 'react';
import { PlaceholderModulePage } from '../../components/common/PlaceholderModulePage';
import { BarChart3 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  return (
    <PlaceholderModulePage
      title="Clinic Practice Analytics"
      subtitle="Patient footfall, diagnosis trends, and clinic revenue insights"
      icon={<BarChart3 className="w-5 h-5" />}
      phaseNumber={8}
      upcomingFeatures={[
        'Monthly patient consultation analytics',
        'Top diagnosis frequency distribution breakdown',
        'Medication adherence rate metrics',
        'Exportable CSV / PDF clinic performance reports'
      ]}
    />
  );
};
