import { MetricData, ConsultationTrendPoint, ReportsOverviewData } from '../types';

export const demoMetricCards: MetricData[] = [
  {
    id: 'm1',
    label: 'Total Patients',
    value: 128,
    change: '+12%',
    supportingText: 'vs last month',
    icon: 'users',
    trendType: 'positive',
  },
  {
    id: 'm2',
    label: "Today's Consultations",
    value: 12,
    change: '+20%',
    supportingText: 'vs yesterday',
    icon: 'calendar',
    trendType: 'positive',
  },
  {
    id: 'm3',
    label: 'Reports to Review',
    value: 7,
    change: '7 pending',
    supportingText: 'pending review',
    icon: 'document',
    trendType: 'warning',
  },
  {
    id: 'm4',
    label: 'Medication Reminders',
    value: 5,
    change: '5 scheduled',
    supportingText: 'scheduled today',
    icon: 'bell',
    trendType: 'neutral',
  },
];

export const demoConsultationTrend: ConsultationTrendPoint[] = [
  { date: '20 Oct', count: 8 },
  { date: '21 Oct', count: 14 },
  { date: '22 Oct', count: 10 },
  { date: '23 Oct', count: 16 },
  { date: '24 Oct', count: 12 },
  { date: '25 Oct', count: 9 },
  { date: '26 Oct', count: 12 },
];

export const demoReportsOverview: ReportsOverviewData = {
  total: 42,
  normal: 18,
  abnormal: 12,
  needsReview: 7,
  others: 5,
};
