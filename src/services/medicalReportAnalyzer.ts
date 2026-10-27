import { MedicalReportAnalysis, LabParameter } from '../types';

export const ANALYZER_VERSION = 'demo-analyzer-v1';

export interface DemoScenarioFixture {
  id: string;
  reportType: string;
  defaultFileName: string;
  keywords: string[];
  summary: string;
  structuredData: LabParameter[];
  clinicalHighlights: string[];
  doctorAttention: string[];
  followUpPoints: string[];
}

/**
 * TEN CONTROLLED DEMO SCENARIOS
 */
export const DEMO_SCENARIO_FIXTURES: DemoScenarioFixture[] = [
  // 1. CBC
  {
    id: 'fixture-cbc-01',
    reportType: 'Complete Blood Count (CBC)',
    defaultFileName: 'CBC_Complete_Blood_Count.pdf',
    keywords: ['cbc', 'blood count', 'hemoglobin', 'wbc', 'platelet', 'haemogram'],
    summary:
      'Structured review of the uploaded report indicates mild normocytic anemia with hemoglobin at 10.8 g/dL and RBC count at 3.8 million/µL below adult female reference limits. Total leukocyte and platelet counts remain stable within normal limits.',
    structuredData: [
      { id: 'p1', parameter: 'Hemoglobin', value: '10.8 g/dL', numericValue: 10.8, unit: 'g/dL', referenceRange: '12.0 – 16.0 g/dL', status: 'Below range' },
      { id: 'p2', parameter: 'Total WBC Count', value: '9,400 /µL', numericValue: 9400, unit: '/µL', referenceRange: '4,000 – 11,000 /µL', status: 'Within range' },
      { id: 'p3', parameter: 'Platelet Count', value: '2.4 lakh /µL', numericValue: 2.4, unit: 'lakh /µL', referenceRange: '1.5 – 4.5 lakh /µL', status: 'Within range' },
      { id: 'p4', parameter: 'Total RBC Count', value: '3.8 million /µL', numericValue: 3.8, unit: 'million /µL', referenceRange: '4.2 – 5.4 million /µL', status: 'Below range' },
      { id: 'p5', parameter: 'Packed Cell Volume (PCV)', value: '33.2 %', numericValue: 33.2, unit: '%', referenceRange: '37.0 – 48.0 %', status: 'Below range' },
      { id: 'p6', parameter: 'MCV (Mean Corpular Vol)', value: '87.4 fL', numericValue: 87.4, unit: 'fL', referenceRange: '80.0 – 100.0 fL', status: 'Within range' },
    ],
    clinicalHighlights: [
      'Hemoglobin level (10.8 g/dL) is below the configured reference threshold.',
      'Total RBC count (3.8 million /µL) and Hematocrit (33.2%) are below reference values.',
      'Leukocyte and platelet counts show normal physiological levels.',
    ],
    doctorAttention: [
      'Review low hemoglobin (10.8 g/dL) for clinical signs of microcytic or normocytic anemia.',
      'Correlate findings with patient dietary history, menstrual history, or blood loss.',
      'Consider ordering serum ferritin, iron profile, and peripheral blood film.',
    ],
    followUpPoints: [
      'Evaluate iron profile and B12/folate levels during next consultation.',
      'Advise dietary iron intake or targeted oral supplementation if clinically indicated.',
      'Schedule follow-up CBC in 4 weeks to evaluate response.',
    ],
  },

  // 2. HbA1c Diabetes Panel
  {
    id: 'fixture-hba1c-02',
    reportType: 'HbA1c & Diabetes Panel',
    defaultFileName: 'HbA1c_Diabetes_Panel.pdf',
    keywords: ['hba1c', 'diabetes', 'glycated', 'blood sugar', 'glucose', 'fasting sugar'],
    summary:
      'Structured review reveals elevated HbA1c at 7.8% and elevated Fasting Plasma Glucose at 142 mg/dL. Findings indicate suboptimal glycemic control over the preceding 2–3 months.',
    structuredData: [
      { id: 'p1', parameter: 'HbA1c (Glycated Hemoglobin)', value: '7.8 %', numericValue: 7.8, unit: '%', referenceRange: '< 5.7% (Normal), 5.7–6.4% (Prediabetes), ≥ 6.5% (Diabetes)', status: 'Above range' },
      { id: 'p2', parameter: 'Fasting Plasma Glucose', value: '142 mg/dL', numericValue: 142, unit: 'mg/dL', referenceRange: '70 – 99 mg/dL', status: 'Above range' },
      { id: 'p3', parameter: 'Postprandial Glucose (2hr)', value: '210 mg/dL', numericValue: 210, unit: 'mg/dL', referenceRange: '< 140 mg/dL', status: 'Above range' },
      { id: 'p4', parameter: 'Estimated Average Glucose (eAG)', value: '177 mg/dL', numericValue: 177, unit: 'mg/dL', referenceRange: '< 117 mg/dL', status: 'Above range' },
    ],
    clinicalHighlights: [
      'HbA1c value (7.8%) exceeds the diagnostic diabetes threshold of 6.5%.',
      'Fasting Plasma Glucose (142 mg/dL) and Postprandial Glucose (210 mg/dL) are elevated above reference limits.',
      'Average estimated glucose correlates to ~177 mg/dL over recent 90 days.',
    ],
    doctorAttention: [
      'Evaluate current oral anti-diabetic or insulin regimen adherence.',
      'Assess for diabetic microvascular signs (neuropathy, retinopathy, nephropathy).',
      'Review dietary carbohydrate intake and physical exercise routine.',
    ],
    followUpPoints: [
      'Consider medication dosage optimization during clinical review.',
      'Recommend daily home blood glucose monitoring log.',
      'Recheck HbA1c in 3 months following therapeutic adjustment.',
    ],
  },

  // 3. Lipid Profile
  {
    id: 'fixture-lipid-03',
    reportType: 'Lipid Profile (Cardiac Risk)',
    defaultFileName: 'Lipid_Profile_Panel.pdf',
    keywords: ['lipid', 'cholesterol', 'triglycerides', 'hdl', 'ldl', 'vldl'],
    summary:
      'Structured lipid profile analysis shows mixed dyslipidemia with Total Cholesterol at 245 mg/dL and Serum Triglycerides at 210 mg/dL above reference limits. HDL Cholesterol is mildly reduced at 38 mg/dL.',
    structuredData: [
      { id: 'p1', parameter: 'Total Cholesterol', value: '245 mg/dL', numericValue: 245, unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'Above range' },
      { id: 'p2', parameter: 'Serum Triglycerides', value: '210 mg/dL', numericValue: 210, unit: 'mg/dL', referenceRange: '< 150 mg/dL', status: 'Above range' },
      { id: 'p3', parameter: 'HDL Cholesterol (Good)', value: '38 mg/dL', numericValue: 38, unit: 'mg/dL', referenceRange: '> 40 mg/dL', status: 'Below range' },
      { id: 'p4', parameter: 'LDL Cholesterol (Bad)', value: '165 mg/dL', numericValue: 165, unit: 'mg/dL', referenceRange: '< 100 mg/dL', status: 'Above range' },
      { id: 'p5', parameter: 'VLDL Cholesterol', value: '42 mg/dL', numericValue: 42, unit: 'mg/dL', referenceRange: '< 30 mg/dL', status: 'Above range' },
      { id: 'p6', parameter: 'Total / HDL Cholesterol Ratio', value: '6.4', numericValue: 6.4, unit: '', referenceRange: '< 4.5', status: 'Above range' },
    ],
    clinicalHighlights: [
      'Total Cholesterol (245 mg/dL) and LDL Cholesterol (165 mg/dL) are in the high border zone.',
      'Triglycerides (210 mg/dL) exceed the 150 mg/dL recommended limit.',
      'Atherogenic Total/HDL ratio is elevated at 6.4.',
    ],
    doctorAttention: [
      'Calculate 10-year ASCVD atherosclerotic cardiovascular risk category.',
      'Review dietary saturated fat intake, alcohol use, and smoking status.',
      'Consider initiating lipid-lowering therapy (e.g. Statin) based on overall risk score.',
    ],
    followUpPoints: [
      'Advise medical nutrition therapy and structured aerobic physical activity.',
      'Re-evaluate fasting lipid panel in 8–12 weeks.',
    ],
  },

  // 4. Liver Function Test (LFT)
  {
    id: 'fixture-lft-04',
    reportType: 'Liver Function Test (LFT)',
    defaultFileName: 'Liver_Function_Test.pdf',
    keywords: ['lft', 'liver', 'sgot', 'sgpt', 'alt', 'ast', 'bilirubin', 'alkaline'],
    summary:
      'Structured analysis of Liver Function Test demonstrates mild transaminase elevation with SGPT (ALT) at 84 U/L and SGOT (AST) at 68 U/L above reference limits. Serum Bilirubin and Albumin synthetic parameters remain intact.',
    structuredData: [
      { id: 'p1', parameter: 'Serum Bilirubin (Total)', value: '1.1 mg/dL', numericValue: 1.1, unit: 'mg/dL', referenceRange: '0.2 – 1.2 mg/dL', status: 'Within range' },
      { id: 'p2', parameter: 'SGPT (ALT)', value: '84 U/L', numericValue: 84, unit: 'U/L', referenceRange: '7 – 56 U/L', status: 'Above range' },
      { id: 'p3', parameter: 'SGOT (AST)', value: '68 U/L', numericValue: 68, unit: 'U/L', referenceRange: '10 – 40 U/L', status: 'Above range' },
      { id: 'p4', parameter: 'Alkaline Phosphatase (ALP)', value: '115 U/L', numericValue: 115, unit: 'U/L', referenceRange: '44 – 147 U/L', status: 'Within range' },
      { id: 'p5', parameter: 'Serum Albumin', value: '4.1 g/dL', numericValue: 4.1, unit: 'g/dL', referenceRange: '3.5 – 5.2 g/dL', status: 'Within range' },
      { id: 'p6', parameter: 'Serum Globulin', value: '2.8 g/dL', numericValue: 2.8, unit: 'g/dL', referenceRange: '2.0 – 3.5 g/dL', status: 'Within range' },
    ],
    clinicalHighlights: [
      'Transaminase enzymes SGPT/ALT (84 U/L) and SGOT/AST (68 U/L) are elevated.',
      'Serum Bilirubin and Albumin are within normal physiological range.',
      'Alkaline Phosphatase exhibits normal biliary tract clearance.',
    ],
    doctorAttention: [
      'Evaluate for Non-Alcoholic Fatty Liver Disease (NAFLD) or metabolic dysfunction.',
      'Review hepatotoxic medication history, herbal supplements, or recent alcohol exposure.',
      'Assess for viral hepatitis risk factors if transaminases remain persistently elevated.',
    ],
    followUpPoints: [
      'Consider Abdominal Ultrasound examination for liver parenchyma assessment.',
      'Recommend lifestyle modifications and avoidance of hepatotoxic substances.',
      'Repeat LFT in 4–6 weeks.',
    ],
  },

  // 5. Kidney Function Test (KFT / Renal)
  {
    id: 'fixture-kft-05',
    reportType: 'Kidney Function Test (KFT / Renal)',
    defaultFileName: 'Kidney_Function_Test.pdf',
    keywords: ['kft', 'kidney', 'renal', 'creatinine', 'urea', 'bun', 'uric acid', 'egfr'],
    summary:
      'Renal panel structured review shows Serum Creatinine elevated at 1.45 mg/dL and BUN at 26 mg/dL. Calculated eGFR is 52 mL/min/1.73m², consistent with mild renal impairment. Serum electrolytes remain balanced.',
    structuredData: [
      { id: 'p1', parameter: 'Serum Creatinine', value: '1.45 mg/dL', numericValue: 1.45, unit: 'mg/dL', referenceRange: '0.60 – 1.10 mg/dL', status: 'Above range' },
      { id: 'p2', parameter: 'Blood Urea Nitrogen (BUN)', value: '26 mg/dL', numericValue: 26, unit: 'mg/dL', referenceRange: '7 – 20 mg/dL', status: 'Above range' },
      { id: 'p3', parameter: 'eGFR (CKD-EPI)', value: '52 mL/min/1.73m²', numericValue: 52, unit: 'mL/min/1.73m²', referenceRange: '> 90 mL/min/1.73m²', status: 'Below range' },
      { id: 'p4', parameter: 'Serum Uric Acid', value: '7.8 mg/dL', numericValue: 7.8, unit: 'mg/dL', referenceRange: '3.5 – 7.2 mg/dL', status: 'Above range' },
      { id: 'p5', parameter: 'Serum Sodium', value: '139 mEq/L', numericValue: 139, unit: 'mEq/L', referenceRange: '135 – 145 mEq/L', status: 'Within range' },
      { id: 'p6', parameter: 'Serum Potassium', value: '4.6 mEq/L', numericValue: 4.6, unit: 'mEq/L', referenceRange: '3.5 – 5.1 mEq/L', status: 'Within range' },
    ],
    clinicalHighlights: [
      'Serum Creatinine (1.45 mg/dL) and Blood Urea Nitrogen (26 mg/dL) exceed standard reference cutoffs.',
      'eGFR (52 mL/min) reflects mild reduction in renal filtration function.',
      'Serum Sodium and Potassium electrolytes are stable.',
    ],
    doctorAttention: [
      'Review NSAID, ACEi/ARB, or other nephrotoxic drug exposures.',
      'Check fluid hydration status and blood pressure control history.',
      'Evaluate for underlying hypertension or diabetic nephropathy.',
    ],
    followUpPoints: [
      'Order Urine Albumin-to-Creatinine Ratio (UACR) for proteinuria screening.',
      'Consider Renal Ultrasound imaging if clinically indicated.',
      'Re-check Renal Panel in 3–4 weeks.',
    ],
  },

  // 6. Thyroid Profile
  {
    id: 'fixture-thyroid-06',
    reportType: 'Thyroid Profile (T3, T4, TSH)',
    defaultFileName: 'Thyroid_Profile_Report.pdf',
    keywords: ['thyroid', 'tsh', 't3', 't4', 'thyroxine'],
    summary:
      'Structured analysis of Thyroid Profile indicates subclinical hypothyroidism with TSH elevated at 7.42 µIU/mL. Serum Total T3, Total T4, and Free T4 concentrations remain within normal reference ranges.',
    structuredData: [
      { id: 'p1', parameter: 'TSH Ultra-sensitive', value: '7.42 µIU/mL', numericValue: 7.42, unit: 'µIU/mL', referenceRange: '0.45 – 4.50 µIU/mL', status: 'Above range' },
      { id: 'p2', parameter: 'Total T3', value: '0.95 ng/mL', numericValue: 0.95, unit: 'ng/mL', referenceRange: '0.80 – 2.00 ng/mL', status: 'Within range' },
      { id: 'p3', parameter: 'Total T4', value: '6.1 µg/dL', numericValue: 6.1, unit: 'µg/dL', referenceRange: '5.1 – 12.0 µg/dL', status: 'Within range' },
      { id: 'p4', parameter: 'Free T4', value: '1.02 ng/dL', numericValue: 1.02, unit: 'ng/dL', referenceRange: '0.82 – 1.77 ng/dL', status: 'Within range' },
    ],
    clinicalHighlights: [
      'TSH (7.42 µIU/mL) is elevated above the 4.50 µIU/mL upper physiological cutoff.',
      'Free T4 and Total T3 demonstrate normal circulating hormone concentrations.',
      'Pattern is typical for subclinical thyroid hypofunction.',
    ],
    doctorAttention: [
      'Evaluate patient for hypothyroid symptoms (fatigue, cold intolerance, dry skin, weight changes).',
      'Assess Anti-TPO antibody status to check for autoimmune Hashimoto thyroiditis.',
    ],
    followUpPoints: [
      'Consider Levothyroxine replacement therapy if symptomatic or Anti-TPO positive.',
      'Repeat serum TSH in 6–8 weeks to confirm persistence.',
    ],
  },

  // 7. Vitamin D
  {
    id: 'fixture-vitd-07',
    reportType: 'Vitamin D 25-Hydroxy Panel',
    defaultFileName: 'Vitamin_D_25_Hydroxy.pdf',
    keywords: ['vitamin d', 'vit d', '25-oh', 'hydroxy', 'cholecalciferol', 'calcium'],
    summary:
      'Structured review confirms significant Vitamin D deficiency with 25-OH Vitamin D Total at 14.2 ng/mL (< 20 ng/mL deficiency threshold). Serum Calcium and Phosphorus levels are maintained within normal physiological limits.',
    structuredData: [
      { id: 'p1', parameter: '25-OH Vitamin D Total', value: '14.2 ng/mL', numericValue: 14.2, unit: 'ng/mL', referenceRange: '30.0 – 100.0 ng/mL (Deficient < 20)', status: 'Below range' },
      { id: 'p2', parameter: 'Serum Calcium', value: '9.2 mg/dL', numericValue: 9.2, unit: 'mg/dL', referenceRange: '8.5 – 10.5 mg/dL', status: 'Within range' },
      { id: 'p3', parameter: 'Serum Phosphorus', value: '3.4 mg/dL', numericValue: 3.4, unit: 'mg/dL', referenceRange: '2.5 – 4.5 mg/dL', status: 'Within range' },
    ],
    clinicalHighlights: [
      '25-OH Vitamin D Total (14.2 ng/mL) is significantly below the 30 ng/mL sufficiency baseline.',
      'Serum Calcium and Phosphorus levels indicate intact baseline mineral homeostasis.',
    ],
    doctorAttention: [
      'Screen patient for bone aches, proximal muscle weakness, fatigue, or osteopenia history.',
      'Evaluate requirement for therapeutic oral Vitamin D3 repletion therapy (e.g. 60,000 IU weekly).',
    ],
    followUpPoints: [
      'Prescribe 8-week Cholecalciferol supplementation protocol if clinically indicated.',
      'Recheck 25-OH Vitamin D level in 12 weeks post loading regimen.',
    ],
  },

  // 8. Vitamin B12
  {
    id: 'fixture-vitb12-08',
    reportType: 'Vitamin B12 & Folate Panel',
    defaultFileName: 'Vitamin_B12_Folate_Report.pdf',
    keywords: ['b12', 'vitamin b12', 'folate', 'cobalamin', 'homocysteine'],
    summary:
      'Structured analysis shows low Serum Vitamin B12 at 148 pg/mL below reference limits (< 200 pg/mL cutoff) with elevated Homocysteine at 16.8 µmol/L. Serum Folate remains within normal range.',
    structuredData: [
      { id: 'p1', parameter: 'Serum Vitamin B12', value: '148 pg/mL', numericValue: 148, unit: 'pg/mL', referenceRange: '211 – 911 pg/mL (Deficient < 200)', status: 'Below range' },
      { id: 'p2', parameter: 'Serum Folate', value: '8.6 ng/mL', numericValue: 8.6, unit: 'ng/mL', referenceRange: '> 4.6 ng/mL', status: 'Within range' },
      { id: 'p3', parameter: 'Serum Homocysteine', value: '16.8 µmol/L', numericValue: 16.8, unit: 'µmol/L', referenceRange: '< 15.0 µmol/L', status: 'Above range' },
    ],
    clinicalHighlights: [
      'Serum Vitamin B12 (148 pg/mL) indicates clinically significant B12 deficiency.',
      'Homocysteine (16.8 µmol/L) is elevated secondary to impaired B12-dependent methylation.',
      'Folate stores are intact.',
    ],
    doctorAttention: [
      'Screen for neurological manifestations (paresthesias, numbness, gait change, cognitive fatigue).',
      'Review dietary habit (vegetarian/vegan) or gastric malabsorption history.',
    ],
    followUpPoints: [
      'Consider parenteral (IM) or high-dose oral Cyanocobalamin / Methylcobalamin therapy.',
      'Re-check Vitamin B12 and CBC in 8 weeks.',
    ],
  },

  // 9. Inflammatory Markers
  {
    id: 'fixture-crp-09',
    reportType: 'Inflammatory Markers (CRP / ESR)',
    defaultFileName: 'Inflammatory_Markers_CRP_ESR.pdf',
    keywords: ['crp', 'esr', 'inflammation', 'c-reactive', 'sedimentation'],
    summary:
      'Structured evaluation reveals active systemic inflammatory response with High-Sensitivity CRP at 8.4 mg/L and ESR at 34 mm/hr above reference cutoffs. Serum Ferritin is preserved.',
    structuredData: [
      { id: 'p1', parameter: 'High-Sensitivity CRP (hs-CRP)', value: '8.4 mg/L', numericValue: 8.4, unit: 'mg/L', referenceRange: '< 1.0 mg/L (High Risk > 3.0)', status: 'Above range' },
      { id: 'p2', parameter: 'Erythrocyte Sedimentation Rate (ESR)', value: '34 mm/hr', numericValue: 34, unit: 'mm/hr', referenceRange: '0 – 20 mm/hr', status: 'Above range' },
      { id: 'p3', parameter: 'Serum Ferritin', value: '280 ng/mL', numericValue: 280, unit: 'ng/mL', referenceRange: '30 – 400 ng/mL', status: 'Within range' },
    ],
    clinicalHighlights: [
      'hs-CRP (8.4 mg/L) is significantly elevated above cardiovascular and inflammatory risk cutoffs.',
      'ESR (34 mm/hr) confirms acute-phase systemic reaction.',
    ],
    doctorAttention: [
      'Investigate potential infectious foci, autoimmune arthropathy flare, or tissue inflammation.',
      'Correlate with clinical history of joint swelling, fever, or localized tenderness.',
    ],
    followUpPoints: [
      'Target clinical cause and re-evaluate inflammatory markers post therapeutic intervention.',
    ],
  },

  // 10. Comprehensive Health Panel
  {
    id: 'fixture-health-10',
    reportType: 'Comprehensive Health Panel',
    defaultFileName: 'Comprehensive_Health_Panel.pdf',
    keywords: ['comprehensive', 'health panel', 'routine', 'wellness', 'general checkup'],
    summary:
      'Comprehensive health panel structured review confirms normal physiological parameters across glycemic, renal, lipid, hematologic, and thyroid functional markers.',
    structuredData: [
      { id: 'p1', parameter: 'Fasting Blood Sugar', value: '92 mg/dL', numericValue: 92, unit: 'mg/dL', referenceRange: '70 – 99 mg/dL', status: 'Within range' },
      { id: 'p2', parameter: 'HbA1c', value: '5.4 %', numericValue: 5.4, unit: '%', referenceRange: '< 5.7 %', status: 'Within range' },
      { id: 'p3', parameter: 'Serum Creatinine', value: '0.85 mg/dL', numericValue: 0.85, unit: 'mg/dL', referenceRange: '0.60 – 1.10 mg/dL', status: 'Within range' },
      { id: 'p4', parameter: 'Total Cholesterol', value: '178 mg/dL', numericValue: 178, unit: 'mg/dL', referenceRange: '< 200 mg/dL', status: 'Within range' },
      { id: 'p5', parameter: 'Hemoglobin', value: '13.8 g/dL', numericValue: 13.8, unit: 'g/dL', referenceRange: '12.0 – 16.0 g/dL', status: 'Within range' },
      { id: 'p6', parameter: 'TSH Ultra-sensitive', value: '2.10 µIU/mL', numericValue: 2.10, unit: 'µIU/mL', referenceRange: '0.45 – 4.50 µIU/mL', status: 'Within range' },
    ],
    clinicalHighlights: [
      'All evaluated laboratory parameters fall within standard physiological reference intervals.',
      'Organ function markers demonstrate stable homeostasis.',
    ],
    doctorAttention: [
      'Routine health screen shows optimal organ function parameters.',
      'Reinforce preventive lifestyle habits and routine wellness maintenance.',
    ],
    followUpPoints: [
      'Schedule annual preventive health checkup in 12 months.',
    ],
  },
];

/**
 * Deterministically analyzes a medical document report.
 */
export async function analyzeMedicalReport(
  fileName: string,
  reportTypeHint?: string,
  fixtureIdHint?: string
): Promise<{ reportType: string; analysis: Omit<MedicalReportAnalysis, 'id' | 'reportId' | 'patientId' | 'createdAt' | 'updatedAt'> }> {
  // Simulate processing time for realistic UI animation flow
  const cleanName = fileName.toLowerCase();
  const cleanHint = (reportTypeHint || '').toLowerCase();

  let matchedFixture: DemoScenarioFixture | undefined;

  // 1. Direct Fixture ID match if selected via 1-click fixture trigger
  if (fixtureIdHint) {
    matchedFixture = DEMO_SCENARIO_FIXTURES.find((f) => f.id === fixtureIdHint);
  }

  // 2. Keyword match in filename or reportTypeHint
  if (!matchedFixture) {
    matchedFixture = DEMO_SCENARIO_FIXTURES.find((f) =>
      f.keywords.some((kw) => cleanName.includes(kw) || cleanHint.includes(kw))
    );
  }

  // 3. Fallback: If no direct keyword matched, return Unrecognized / Custom document analysis safely
  if (!matchedFixture) {
    return {
      reportType: reportTypeHint || 'Custom Clinical Document',
      analysis: {
        analyzerVersion: ANALYZER_VERSION,
        status: 'ANALYZED',
        summary:
          'Document uploaded successfully. Automated structured parameter extraction is not available for this custom document format in the current prototype version.',
        structuredData: [],
        clinicalHighlights: [
          'Original document is stored securely and available for direct doctor inspection.',
        ],
        doctorAttention: [
          'Review original document file using the document viewer.',
        ],
        followUpPoints: [
          'Correlate clinical findings from document with patient history.',
        ],
      },
    };
  }

  return {
    reportType: matchedFixture.reportType,
    analysis: {
      analyzerVersion: ANALYZER_VERSION,
      status: 'ANALYZED',
      summary: matchedFixture.summary,
      structuredData: matchedFixture.structuredData,
      clinicalHighlights: matchedFixture.clinicalHighlights,
      doctorAttention: matchedFixture.doctorAttention,
      followUpPoints: matchedFixture.followUpPoints,
    },
  };
}
