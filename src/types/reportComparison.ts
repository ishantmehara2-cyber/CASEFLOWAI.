export type ComparisonDirection =
  | 'INCREASED'
  | 'DECREASED'
  | 'STABLE'
  | 'NEW'
  | 'MISSING'
  | 'UNCOMPARABLE';

export type ParameterClassification =
  | 'IMPROVED'
  | 'INCREASED'
  | 'DECREASED'
  | 'STABLE'
  | 'NEWLY RECORDED'
  | 'NOT REPORTED'
  | 'UNABLE TO COMPARE';

export interface ParameterComparison {
  name: string;
  previousValue?: number | string | null;
  currentValue?: number | string | null;
  previousUnit?: string | null;
  currentUnit?: string | null;
  absoluteChange?: number | null;
  percentageChange?: number | null;
  direction: ComparisonDirection;
  classification: ParameterClassification;
  previousReferenceRange?: string;
  currentReferenceRange?: string;
  previousStatus?: string;
  currentStatus?: string;
}

export interface ReportComparisonResult {
  id: string;
  patientId: string;
  currentReportId: string;
  previousReportId: string;
  currentReportType: string;
  previousReportType: string;
  currentReportDate: string;
  previousReportDate: string;
  parameters: ParameterComparison[];
  summary: string;
  clinicalHighlights: string[];
  doctorAttention: string[];
  createdAt: string;
}
