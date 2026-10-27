import { MedicalReport, LabParameter } from '../types';
import { ReportComparisonResult, ParameterComparison, ComparisonDirection, ParameterClassification } from '../types/reportComparison';
import { normalizeParameterName } from '../utils/reportComparison/normalizeParameter';
import { logAuditEvent } from './auditService';
import { addTimelineEvent } from './patientMedicalMemoryService';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';

initStorage();

const KEYS = {
  COMPARISONS: 'caseflow_report_comparisons',
};

/**
 * Finds the most recent compatible previous report for longitudinal comparison.
 */
export async function findPreviousComparableReport(
  currentReport: MedicalReport,
  patientReports: MedicalReport[]
): Promise<MedicalReport | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 30));

  const currentType = (currentReport.reportType || '').toLowerCase();

  // Filter out current report and reports from different patient or unanalyzed status
  const candidates = patientReports.filter(
    (r) =>
      r.id !== currentReport.id &&
      r.patientId === currentReport.patientId &&
      r.processingStatus === 'ANALYZED' &&
      r.analysis &&
      new Date(r.uploadedAt).getTime() < new Date(currentReport.uploadedAt).getTime()
  );

  if (candidates.length === 0) return undefined;

  // 1. Try exact reportType match
  const exactMatch = candidates.find((r) => (r.reportType || '').toLowerCase() === currentType);
  if (exactMatch) return exactMatch;

  // 2. Try partial keyword compatibility (e.g. CBC, HbA1c, Lipid, Thyroid, etc.)
  const keywords = currentType.split(/[\s-/]+/);
  const keywordMatch = candidates.find((r) => {
    const t = (r.reportType || '').toLowerCase();
    return keywords.some((kw) => kw.length > 3 && t.includes(kw));
  });

  return keywordMatch || candidates[0];
}

/**
 * Parses numeric value from parameter value string (e.g. "10.8 g/dL" -> 10.8).
 */
function extractNumericValue(valStr: string): { num: number | null; unit: string | null } {
  if (!valStr) return { num: null, unit: null };
  const clean = valStr.trim();
  const match = clean.match(/^([+-]?\d*\.?\d+)\s*(.*)$/);
  if (!match) return { num: null, unit: null };

  const num = parseFloat(match[1]);
  const unit = match[2] ? match[2].trim() : null;
  return { num: isNaN(num) ? null : num, unit };
}

/**
 * Compares current report against previous compatible report parameter by parameter.
 */
export async function compareReports(
  currentReport: MedicalReport,
  previousReport: MedicalReport
): Promise<ReportComparisonResult> {
  await new Promise((resolve) => setTimeout(resolve, 80));

  const currParams: LabParameter[] = currentReport.analysis?.structuredData || [];
  const prevParams: LabParameter[] = previousReport.analysis?.structuredData || [];

  const prevMap = new Map<string, LabParameter>();
  prevParams.forEach((p) => {
    const norm = normalizeParameterName(p.parameter);
    prevMap.set(norm, p);
  });

  const currMap = new Map<string, LabParameter>();
  currParams.forEach((p) => {
    const norm = normalizeParameterName(p.parameter);
    currMap.set(norm, p);
  });

  const allNames = Array.from(new Set([...prevMap.keys(), ...currMap.keys()]));
  const parameters: ParameterComparison[] = [];

  allNames.forEach((normName) => {
    const prev = prevMap.get(normName);
    const curr = currMap.get(normName);
    const displayName = curr?.parameter || prev?.parameter || normName;

    if (prev && curr) {
      const parsedPrev = extractNumericValue(prev.value);
      const parsedCurr = extractNumericValue(curr.value);

      let absoluteChange: number | null = null;
      let percentageChange: number | null = null;
      let direction: ComparisonDirection = 'STABLE';
      let classification: ParameterClassification = 'STABLE';

      // Check unit compatibility
      const unitsMatch =
        !parsedPrev.unit ||
        !parsedCurr.unit ||
        parsedPrev.unit.toLowerCase() === parsedCurr.unit.toLowerCase();

      if (parsedPrev.num !== null && parsedCurr.num !== null && unitsMatch) {
        absoluteChange = Number((parsedCurr.num - parsedPrev.num).toFixed(2));
        if (parsedPrev.num !== 0) {
          percentageChange = Number((((parsedCurr.num - parsedPrev.num) / parsedPrev.num) * 100).toFixed(1));
        }

        if (absoluteChange > 0) {
          direction = 'INCREASED';
          // Check if higher is better or worse depending on parameter type
          if (['HbA1c', 'Total Cholesterol', 'Serum Triglycerides', 'LDL Cholesterol', 'VLDL Cholesterol', 'SGPT (ALT)', 'SGOT (AST)', 'Serum Creatinine', 'Blood Urea Nitrogen (BUN)', 'TSH Ultra-sensitive', 'High-Sensitivity CRP (hs-CRP)', 'Erythrocyte Sedimentation Rate (ESR)'].includes(normName)) {
            classification = 'INCREASED'; // may indicate worsening for risk markers
          } else {
            classification = 'IMPROVED'; // increased for good parameters like HDL, Hemoglobin
          }
        } else if (absoluteChange < 0) {
          direction = 'DECREASED';
          if (['HbA1c', 'Total Cholesterol', 'Serum Triglycerides', 'LDL Cholesterol', 'VLDL Cholesterol', 'SGPT (ALT)', 'SGOT (AST)', 'Serum Creatinine', 'Blood Urea Nitrogen (BUN)', 'TSH Ultra-sensitive', 'High-Sensitivity CRP (hs-CRP)'].includes(normName)) {
            classification = 'IMPROVED'; // decreased for risk markers or deficiencies resolved
          } else {
            classification = 'DECREASED';
          }
        } else {
          direction = 'STABLE';
          classification = 'STABLE';
        }
      } else if (!unitsMatch) {
        direction = 'UNCOMPARABLE';
        classification = 'UNABLE TO COMPARE';
      } else {
        // Textual comparison
        if (prev.value !== curr.value) {
          direction = 'INCREASED';
          classification = 'INCREASED';
        } else {
          direction = 'STABLE';
          classification = 'STABLE';
        }
      }

      parameters.push({
        name: displayName,
        previousValue: prev.value,
        currentValue: curr.value,
        previousUnit: parsedPrev.unit,
        currentUnit: parsedCurr.unit,
        absoluteChange,
        percentageChange,
        direction,
        classification,
        previousReferenceRange: prev.referenceRange,
        currentReferenceRange: curr.referenceRange,
        previousStatus: prev.status,
        currentStatus: curr.status,
      });
    } else if (!prev && curr) {
      // Newly recorded parameter
      parameters.push({
        name: curr.parameter,
        previousValue: 'Not reported',
        currentValue: curr.value,
        previousUnit: null,
        currentUnit: null,
        absoluteChange: null,
        percentageChange: null,
        direction: 'NEW',
        classification: 'NEWLY RECORDED',
        currentReferenceRange: curr.referenceRange,
        currentStatus: curr.status,
      });
    } else if (prev && !curr) {
      // Missing in current report
      parameters.push({
        name: prev.parameter,
        previousValue: prev.value,
        currentValue: 'Not reported',
        previousUnit: null,
        currentUnit: null,
        absoluteChange: null,
        percentageChange: null,
        direction: 'MISSING',
        classification: 'NOT REPORTED',
        previousReferenceRange: prev.referenceRange,
        previousStatus: prev.status,
      });
    }
  });

  // Generate clinical highlights & doctor attention points
  const clinicalHighlights: string[] = [];
  const doctorAttention: string[] = [];

  parameters.forEach((p) => {
    if (p.direction === 'INCREASED' || p.direction === 'DECREASED') {
      clinicalHighlights.push(`${p.name} changed from ${p.previousValue} to ${p.currentValue}.`);
      if (p.currentStatus === 'Above range' || p.currentStatus === 'Below range') {
        doctorAttention.push(`${p.name} remains outside the reference range (${p.currentValue}, Ref: ${p.currentReferenceRange}).`);
      }
    } else if (p.direction === 'NEW') {
      clinicalHighlights.push(`${p.name} was newly recorded as ${p.currentValue}.`);
    }
  });

  if (clinicalHighlights.length === 0) {
    clinicalHighlights.push('All compared laboratory parameters remained stable compared with the previous available report.');
  }

  const summary = `Compared with the previous available ${previousReport.reportType} report (${new Date(previousReport.uploadedAt).toLocaleDateString()}), ${parameters.length} parameter(s) were analyzed. Doctor review required.`;

  const comparisonResult: ReportComparisonResult = {
    id: `cmp-${Date.now()}`,
    patientId: currentReport.patientId,
    currentReportId: currentReport.id,
    previousReportId: previousReport.id,
    currentReportType: currentReport.reportType,
    previousReportType: previousReport.reportType,
    currentReportDate: currentReport.uploadedAt,
    previousReportDate: previousReport.uploadedAt,
    parameters,
    summary,
    clinicalHighlights,
    doctorAttention,
    createdAt: new Date().toISOString(),
  };

  // Persist comparison in storage
  const comparisons = getItem<ReportComparisonResult[]>(KEYS.COMPARISONS, []);
  setItem(KEYS.COMPARISONS, [comparisonResult, ...comparisons]);

  // Log audit & timeline
  await logAuditEvent('REPORT_COMPARISON_CREATED', 'ReportComparison', comparisonResult.id, {
    patientId: currentReport.patientId,
    currentReportId: currentReport.id,
    previousReportId: previousReport.id,
  });

  await addTimelineEvent({
    patientId: currentReport.patientId,
    eventType: 'REPORT_UPLOADED',
    title: `Report Comparison: ${currentReport.reportType}`,
    description: `Longitudinal comparison generated against previous report dated ${new Date(previousReport.uploadedAt).toLocaleDateString()}.`,
    actorName: currentReport.doctorName,
  });

  return comparisonResult;
}

/**
 * Retrieves existing comparison or generates one.
 */
export async function getOrCreateComparison(
  currentReport: MedicalReport,
  patientReports: MedicalReport[],
  targetPreviousId?: string
): Promise<{ comparison: ReportComparisonResult | null; previousReport: MedicalReport | null }> {
  let prevReport: MedicalReport | undefined;

  if (targetPreviousId) {
    prevReport = patientReports.find((r) => r.id === targetPreviousId);
  } else {
    prevReport = await findPreviousComparableReport(currentReport, patientReports);
  }

  if (!prevReport) {
    return { comparison: null, previousReport: null };
  }

  const comparisons = getItem<ReportComparisonResult[]>(KEYS.COMPARISONS, []);
  const existing = comparisons.find(
    (c) => c.currentReportId === currentReport.id && c.previousReportId === prevReport?.id
  );

  if (existing) {
    return { comparison: existing, previousReport: prevReport };
  }

  const newComparison = await compareReports(currentReport, prevReport);
  return { comparison: newComparison, previousReport: prevReport };
}
