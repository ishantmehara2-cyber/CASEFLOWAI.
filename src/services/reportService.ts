import { ReportsOverviewData } from '../types';
import { getPatients } from './patientService';

export async function getReportsOverview(): Promise<ReportsOverviewData> {
  await new Promise((resolve) => setTimeout(resolve, 80));
  const patients = await getPatients();

  if (patients.length === 0) {
    return {
      total: 0,
      normal: 0,
      abnormal: 0,
      needsReview: 0,
      others: 0,
    };
  }

  // Calculate dynamic report stats based on patient report counts
  const totalReports = patients.reduce((acc, p) => acc + (p.reportCount || 0), 0);

  if (totalReports === 0) {
    return {
      total: 0,
      normal: 0,
      abnormal: 0,
      needsReview: 0,
      others: 0,
    };
  }

  const normal = Math.round(totalReports * 0.45);
  const abnormal = Math.round(totalReports * 0.28);
  const needsReview = Math.round(totalReports * 0.17);
  const others = Math.max(0, totalReports - (normal + abnormal + needsReview));

  return {
    total: totalReports,
    normal,
    abnormal,
    needsReview,
    others,
  };
}
