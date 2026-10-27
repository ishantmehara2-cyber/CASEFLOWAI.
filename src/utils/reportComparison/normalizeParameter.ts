/**
 * Normalizes parameter names to enable accurate longitudinal matching.
 */
export function normalizeParameterName(rawName: string): string {
  if (!rawName) return '';
  const clean = rawName.toLowerCase().replace(/[^a-z0-9]/g, ' ').trim();

  if (clean.includes('hba1c') || clean.includes('glycated hemoglobin')) {
    return 'HbA1c';
  }
  if (clean.includes('hemoglobin') || clean === 'hb') {
    return 'Hemoglobin';
  }
  if (clean.includes('wbc') || clean.includes('leukocyte') || clean.includes('white blood')) {
    return 'Total WBC Count';
  }
  if (clean.includes('platelet')) {
    return 'Platelet Count';
  }
  if (clean.includes('rbc') || clean.includes('red blood')) {
    return 'Total RBC Count';
  }
  if (clean.includes('pcv') || clean.includes('packed cell')) {
    return 'Packed Cell Volume (PCV)';
  }
  if (clean.includes('mcv')) {
    return 'MCV';
  }
  if (clean.includes('fasting') && clean.includes('glucose')) {
    return 'Fasting Plasma Glucose';
  }
  if (clean.includes('postprandial') || clean.includes('pp glucose')) {
    return 'Postprandial Glucose (2hr)';
  }
  if (clean.includes('total cholesterol')) {
    return 'Total Cholesterol';
  }
  if (clean.includes('triglyceride')) {
    return 'Serum Triglycerides';
  }
  if (clean.includes('hdl')) {
    return 'HDL Cholesterol';
  }
  if (clean.includes('ldl')) {
    return 'LDL Cholesterol';
  }
  if (clean.includes('vldl')) {
    return 'VLDL Cholesterol';
  }
  if (clean.includes('bilirubin')) {
    return 'Serum Bilirubin (Total)';
  }
  if (clean.includes('sgpt') || clean.includes('alt')) {
    return 'SGPT (ALT)';
  }
  if (clean.includes('sgot') || clean.includes('ast')) {
    return 'SGOT (AST)';
  }
  if (clean.includes('alkaline phosphatase') || clean.includes('alp')) {
    return 'Alkaline Phosphatase (ALP)';
  }
  if (clean.includes('albumin')) {
    return 'Serum Albumin';
  }
  if (clean.includes('globulin')) {
    return 'Serum Globulin';
  }
  if (clean.includes('creatinine')) {
    return 'Serum Creatinine';
  }
  if (clean.includes('blood urea') || clean.includes('bun')) {
    return 'Blood Urea Nitrogen (BUN)';
  }
  if (clean.includes('egfr')) {
    return 'eGFR (CKD-EPI)';
  }
  if (clean.includes('uric acid')) {
    return 'Serum Uric Acid';
  }
  if (clean.includes('sodium')) {
    return 'Serum Sodium';
  }
  if (clean.includes('potassium')) {
    return 'Serum Potassium';
  }
  if (clean.includes('tsh')) {
    return 'TSH Ultra-sensitive';
  }
  if (clean.includes('total t3') || clean.includes('t3')) {
    return 'Total T3';
  }
  if (clean.includes('total t4') || clean.includes('t4')) {
    return 'Total T4';
  }
  if (clean.includes('free t4')) {
    return 'Free T4';
  }
  if (clean.includes('vitamin d') || clean.includes('25 oh') || clean.includes('cholecalciferol')) {
    return '25-OH Vitamin D Total';
  }
  if (clean.includes('calcium')) {
    return 'Serum Calcium';
  }
  if (clean.includes('phosphorus')) {
    return 'Serum Phosphorus';
  }
  if (clean.includes('vitamin b12') || clean.includes('b12') || clean.includes('cobalamin')) {
    return 'Serum Vitamin B12';
  }
  if (clean.includes('folate')) {
    return 'Serum Folate';
  }
  if (clean.includes('homocysteine')) {
    return 'Serum Homocysteine';
  }
  if (clean.includes('hs crp') || clean.includes('c reactive') || clean === 'crp') {
    return 'High-Sensitivity CRP (hs-CRP)';
  }
  if (clean.includes('esr') || clean.includes('sedimentation')) {
    return 'Erythrocyte Sedimentation Rate (ESR)';
  }
  if (clean.includes('ferritin')) {
    return 'Serum Ferritin';
  }

  return rawName.trim();
}
