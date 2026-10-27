import { MedicalReport, MedicalReportAnalysis, ReportProcessingStatus, Patient } from '../types';
import { getItem, setItem, STORAGE_KEYS, initStorage } from './storage';
import { logAuditEvent } from './auditService';
import { addTimelineEvent } from './patientMedicalMemoryService';
import { analyzeMedicalReport } from './medicalReportAnalyzer';

initStorage();

const KEYS = {
  MEDICAL_REPORTS: 'caseflow_medical_reports',
};

// Seed initial demo reports on first load if empty
function initSeedReports() {
  if (!localStorage.getItem('caseflow_reports_initialized')) {
    const defaultReports: MedicalReport[] = [
      {
        id: 'rep-001',
        patientId: 'CF-00182',
        patientName: 'Aarav Patel',
        doctorId: 'doc-001',
        doctorName: 'Dr. Priya Sharma',
        clinicName: 'Apollo Clinical Care Center',
        fileName: 'CBC_Complete_Blood_Count.pdf',
        fileType: 'PDF',
        fileSize: 1024 * 450, // 450 KB
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        reportType: 'Complete Blood Count (CBC)',
        uploadedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        uploadedBy: 'Dr. Priya Sharma',
        processingStatus: 'ANALYZED',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        analysis: {
          id: 'an-001',
          reportId: 'rep-001',
          patientId: 'CF-00182',
          analyzerVersion: 'demo-analyzer-v1',
          status: 'ANALYZED',
          summary:
            'Structured review of the uploaded report indicates mild normocytic anemia with hemoglobin at 10.8 g/dL and RBC count at 3.8 million/µL below adult female reference limits. Total leukocyte and platelet counts remain stable within normal limits.',
          structuredData: [
            { id: 'p1', parameter: 'Hemoglobin', value: '10.8 g/dL', numericValue: 10.8, unit: 'g/dL', referenceRange: '12.0 – 16.0 g/dL', status: 'Below range' },
            { id: 'p2', parameter: 'Total WBC Count', value: '9,400 /µL', numericValue: 9400, unit: '/µL', referenceRange: '4,000 – 11,000 /µL', status: 'Within range' },
            { id: 'p3', parameter: 'Platelet Count', value: '2.4 lakh /µL', numericValue: 2.4, unit: 'lakh /µL', referenceRange: '1.5 – 4.5 lakh /µL', status: 'Within range' },
            { id: 'p4', parameter: 'Total RBC Count', value: '3.8 million /µL', numericValue: 3.8, unit: 'million /µL', referenceRange: '4.2 – 5.4 million /µL', status: 'Below range' },
            { id: 'p5', parameter: 'Packed Cell Volume (PCV)', value: '33.2 %', numericValue: 33.2, unit: '%', referenceRange: '37.0 – 48.0 %', status: 'Below range' },
          ],
          clinicalHighlights: [
            'Hemoglobin level (10.8 g/dL) is below the configured reference threshold.',
            'Total RBC count (3.8 million /µL) and Hematocrit (33.2%) are below reference values.',
            'Leukocyte and platelet counts show normal physiological levels.',
          ],
          doctorAttention: [
            'Review low hemoglobin (10.8 g/dL) for clinical signs of microcytic or normocytic anemia.',
            'Correlate findings with patient dietary history or blood loss.',
            'Consider ordering serum ferritin, iron profile, and peripheral blood film.',
          ],
          followUpPoints: [
            'Evaluate iron profile and B12/folate levels during next consultation.',
            'Advise dietary iron intake or targeted oral supplementation if clinically indicated.',
            'Schedule follow-up CBC in 4 weeks.',
          ],
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
      },
      {
        id: 'rep-002',
        patientId: 'CF-00183',
        patientName: 'Sunita Sharma',
        doctorId: 'doc-001',
        doctorName: 'Dr. Priya Sharma',
        clinicName: 'Apollo Clinical Care Center',
        fileName: 'Thyroid_Profile_Report.pdf',
        fileType: 'PDF',
        fileSize: 1024 * 320,
        fileUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        reportType: 'Thyroid Profile (T3, T4, TSH)',
        uploadedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        uploadedBy: 'Dr. Priya Sharma',
        processingStatus: 'ANALYZED',
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        analysis: {
          id: 'an-002',
          reportId: 'rep-002',
          patientId: 'CF-00183',
          analyzerVersion: 'demo-analyzer-v1',
          status: 'ANALYZED',
          summary:
            'Structured analysis of Thyroid Profile indicates subclinical hypothyroidism with TSH elevated at 7.42 µIU/mL. Serum Total T3, Total T4, and Free T4 concentrations remain within normal reference ranges.',
          structuredData: [
            { id: 'p1', parameter: 'TSH Ultra-sensitive', value: '7.42 µIU/mL', numericValue: 7.42, unit: 'µIU/mL', referenceRange: '0.45 – 4.50 µIU/mL', status: 'Above range' },
            { id: 'p2', parameter: 'Total T3', value: '0.95 ng/mL', numericValue: 0.95, unit: 'ng/mL', referenceRange: '0.80 – 2.00 ng/mL', status: 'Within range' },
            { id: 'p3', parameter: 'Free T4', value: '1.02 ng/dL', numericValue: 1.02, unit: 'ng/dL', referenceRange: '0.82 – 1.77 ng/dL', status: 'Within range' },
          ],
          clinicalHighlights: [
            'TSH (7.42 µIU/mL) is elevated above the 4.50 µIU/mL upper physiological cutoff.',
            'Free T4 and Total T3 demonstrate normal circulating hormone concentrations.',
          ],
          doctorAttention: [
            'Evaluate patient for hypothyroid symptoms (fatigue, cold intolerance).',
            'Assess Anti-TPO antibody status to check for autoimmune Hashimoto thyroiditis.',
          ],
          followUpPoints: [
            'Consider Levothyroxine replacement therapy if symptomatic.',
            'Repeat serum TSH in 6–8 weeks.',
          ],
          createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
        },
      },
    ];

    setItem(KEYS.MEDICAL_REPORTS, defaultReports);
    localStorage.setItem('caseflow_reports_initialized', 'true');
  }
}

initSeedReports();

export async function getMedicalReports(patientId: string): Promise<MedicalReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const reports = getItem<MedicalReport[]>(KEYS.MEDICAL_REPORTS, []);
  return reports
    .filter((r) => r.patientId.toLowerCase() === patientId.toLowerCase())
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function getAllMedicalReports(): Promise<MedicalReport[]> {
  await new Promise((resolve) => setTimeout(resolve, 60));
  const reports = getItem<MedicalReport[]>(KEYS.MEDICAL_REPORTS, []);
  return reports.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
}

export async function uploadMedicalReport(
  patientId: string,
  patientName: string,
  file: File | { name: string; size: number; type: string; url?: string },
  doctor: { id: string; name: string; clinicName?: string },
  fixtureIdHint?: string,
  reportTypeHint?: string
): Promise<MedicalReport> {
  await new Promise((resolve) => setTimeout(resolve, 150));

  const fileName = 'name' in file ? file.name : 'Uploaded_Medical_Report.pdf';
  const fileSize = 'size' in file ? file.size : 1024 * 512;
  const fileTypeStr = fileName.toLowerCase().endsWith('.png') || fileName.toLowerCase().endsWith('.jpg') || fileName.toLowerCase().endsWith('.jpeg') ? 'PNG' : 'PDF';
  const fileUrl = 'url' in file && file.url ? file.url : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf';

  const reportId = `rep-${Date.now()}`;
  const now = new Date().toISOString();

  const newReport: MedicalReport = {
    id: reportId,
    patientId,
    patientName,
    doctorId: doctor.id,
    doctorName: doctor.name,
    clinicName: doctor.clinicName || 'Apollo Clinical Care Center',
    fileName,
    fileType: fileTypeStr as any,
    fileSize,
    fileUrl,
    reportType: reportTypeHint || 'Diagnostic Report',
    uploadedAt: now,
    uploadedBy: doctor.name,
    processingStatus: 'UPLOADED',
    createdAt: now,
    updatedAt: now,
  };

  const reports = getItem<MedicalReport[]>(KEYS.MEDICAL_REPORTS, []);
  setItem(KEYS.MEDICAL_REPORTS, [newReport, ...reports]);

  // Update patient report count
  const patients = getItem<Patient[]>(STORAGE_KEYS.PATIENTS, []);
  const pIdx = patients.findIndex((p) => p.patientId.toLowerCase() === patientId.toLowerCase() || p.id.toLowerCase() === patientId.toLowerCase());
  if (pIdx !== -1) {
    patients[pIdx].reportCount = (patients[pIdx].reportCount || 0) + 1;
    setItem(STORAGE_KEYS.PATIENTS, patients);
  }

  // Log audit event & timeline
  await logAuditEvent('MEDICAL_REPORT_UPLOADED', 'MedicalReport', reportId, { patientId, fileName });
  await addTimelineEvent({
    patientId,
    eventType: 'REPORT_UPLOADED',
    title: `Medical Report Uploaded: ${fileName}`,
    description: `Diagnostic file uploaded by ${doctor.name} for clinical review.`,
    actorName: doctor.name,
  });

  return newReport;
}

export async function analyzeReportAction(
  reportId: string,
  fixtureIdHint?: string
): Promise<MedicalReport> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const reports = getItem<MedicalReport[]>(KEYS.MEDICAL_REPORTS, []);
  const idx = reports.findIndex((r) => r.id === reportId);

  if (idx === -1) {
    throw new Error('Medical report not found.');
  }

  const report = reports[idx];

  // Update status to analyzing
  report.processingStatus = 'ANALYZING';
  reports[idx] = report;
  setItem(KEYS.MEDICAL_REPORTS, reports);

  await logAuditEvent('MEDICAL_REPORT_ANALYSIS_STARTED', 'MedicalReport', reportId, { patientId: report.patientId });

  // Run analyzer
  try {
    const analysisResult = await analyzeMedicalReport(report.fileName, report.reportType, fixtureIdHint);

    const now = new Date().toISOString();
    const analysisRecord: MedicalReportAnalysis = {
      id: `an-${Date.now()}`,
      reportId: report.id,
      patientId: report.patientId,
      analyzerVersion: analysisResult.analysis.analyzerVersion,
      status: 'ANALYZED',
      summary: analysisResult.analysis.summary,
      structuredData: analysisResult.analysis.structuredData,
      clinicalHighlights: analysisResult.analysis.clinicalHighlights,
      doctorAttention: analysisResult.analysis.doctorAttention,
      followUpPoints: analysisResult.analysis.followUpPoints,
      createdAt: now,
      updatedAt: now,
    };

    report.reportType = analysisResult.reportType;
    report.processingStatus = 'ANALYZED';
    report.analysis = analysisRecord;
    report.updatedAt = now;

    reports[idx] = report;
    setItem(KEYS.MEDICAL_REPORTS, reports);

    await logAuditEvent('MEDICAL_REPORT_ANALYZED', 'MedicalReport', reportId, { patientId: report.patientId, reportType: report.reportType });
    await addTimelineEvent({
      patientId: report.patientId,
      eventType: 'REPORT_UPLOADED',
      title: `Medical Report Analyzed: ${report.fileName}`,
      description: `CaseFlowAI structured ${report.reportType} report for doctor review.`,
      actorName: report.doctorName,
    });

    return report;
  } catch (err: any) {
    report.processingStatus = 'FAILED';
    reports[idx] = report;
    setItem(KEYS.MEDICAL_REPORTS, reports);

    await logAuditEvent('MEDICAL_REPORT_ANALYSIS_FAILED', 'MedicalReport', reportId, { error: err.message });
    throw err;
  }
}
