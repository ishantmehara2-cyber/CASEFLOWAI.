import React, { useState, useEffect, useCallback } from 'react';
import { Patient, Doctor, PatientAllergy, MedicalCondition, PatientVisit } from '../../types';
import { ConsultationRecord, PrescriptionItem, VisitType } from '../../types/consultation';
import { saveConsultationDraft, finalizeConsultation } from '../../services/consultationService';
import { getPatientAllergies, getPatientConditions, getPatientVisits } from '../../services/patientMedicalMemoryService';
import { getMedicalReports } from '../../services/medicalReportService';
import { getPatientPrescriptions } from '../../services/prescriptionService';
import { openPrescriptionPrintWindow } from '../../services/prescriptionPdfService';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { FormField } from '../ui/FormField';
import { Modal } from '../ui/Modal';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  User,
  AlertTriangle,
  ShieldAlert,
  FileText,
  Pill,
  Calendar,
  Save,
  CheckCircle2,
  Plus,
  Trash2,
  Edit,
  Clock,
  Sparkles,
  Printer,
  X,
  Activity,
  HeartPulse,
} from 'lucide-react';

interface ConsultationWorkspaceProps {
  patient: Patient;
  doctor: Doctor;
  initialConsultation?: ConsultationRecord;
  onClose: () => void;
  onFinalized: () => void;
}

export const ConsultationWorkspace: React.FC<ConsultationWorkspaceProps> = ({
  patient,
  doctor,
  initialConsultation,
  onClose,
  onFinalized,
}) => {
  const { showToast } = useToast();

  const [visitType, setVisitType] = useState<VisitType>(initialConsultation?.visitType || 'NEW_CONSULTATION');
  const [chiefComplaint, setChiefComplaint] = useState<string>(initialConsultation?.chiefComplaint || '');
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState<string>(initialConsultation?.historyOfPresentIllness || '');
  const [vitals, setVitals] = useState({
    bloodPressure: initialConsultation?.vitals?.bloodPressure || '',
    heartRate: initialConsultation?.vitals?.heartRate || '',
    temperature: initialConsultation?.vitals?.temperature || '',
    spo2: initialConsultation?.vitals?.spo2 || '',
    weight: initialConsultation?.vitals?.weight || '',
    height: initialConsultation?.vitals?.height || '',
    bmi: initialConsultation?.vitals?.bmi || '',
  });
  const [clinicalExamination, setClinicalExamination] = useState<string>(initialConsultation?.clinicalExamination || '');
  const [assessment, setAssessment] = useState<string>(initialConsultation?.assessment || '');
  const [plan, setPlan] = useState<string>(initialConsultation?.plan || '');

  // Prescription items state
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([]);
  const [isAddingMed, setIsAddingMed] = useState<boolean>(false);
  const [medName, setMedName] = useState<string>('');
  const [medStrength, setMedStrength] = useState<string>('');
  const [medDosage, setMedDosage] = useState<string>('1 tablet');
  const [medFrequency, setMedFrequency] = useState<string>('Twice daily');
  const [medDuration, setMedDuration] = useState<string>('5 days');
  const [medFood, setMedFood] = useState<string>('Take after food');
  const [medNotes, setMedNotes] = useState<string>('');

  // Medical memory sidebar context
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [pastVisits, setPastVisits] = useState<PatientVisit[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [pastPrescriptions, setPastPrescriptions] = useState<any[]>([]);

  const [isSavingDraft, setIsSavingDraft] = useState<boolean>(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState<boolean>(false);
  const [isFinalizing, setIsFinalizing] = useState<boolean>(false);

  useEffect(() => {
    async function loadContext() {
      try {
        const [alg, cnd, vst, rep, prx] = await Promise.all([
          getPatientAllergies(patient.patientId),
          getPatientConditions(patient.patientId),
          getPatientVisits(patient.patientId),
          getMedicalReports(patient.patientId),
          getPatientPrescriptions(patient.patientId),
        ]);
        setAllergies(alg);
        setConditions(cnd);
        setPastVisits(vst);
        setReports(rep);
        setPastPrescriptions(prx);
      } catch (e) {
        console.error('Failed to load consultation medical memory context:', e);
      }
    }
    loadContext();
  }, [patient.patientId]);

  const handleAddMedication = () => {
    if (!medName.trim()) {
      showToast('Validation Error', 'Please enter a medicine name.', 'error');
      return;
    }

    // Allergy check warning
    const allergyMatch = allergies.some((a) =>
      medName.toLowerCase().includes(a.allergen.toLowerCase()) ||
      a.allergen.toLowerCase().includes(medName.toLowerCase())
    );

    if (allergyMatch) {
      showToast('Allergy Warning', `Patient has a recorded allergy associated with ${medName}. Please review carefully.`, 'warning');
    }

    const newItem: PrescriptionItem = {
      id: `item-${Date.now()}`,
      medicineName: medName.trim(),
      strength: medStrength.trim(),
      dosage: medDosage.trim(),
      frequency: medFrequency.trim(),
      duration: medDuration.trim(),
      foodInstruction: medFood.trim(),
      notes: medNotes.trim(),
    };

    setPrescriptionItems((prev) => [...prev, newItem]);
    setMedName('');
    setMedStrength('');
    setMedNotes('');
    setIsAddingMed(false);
    showToast('Medication Added', 'Prescription item added to list.', 'success');
  };

  const handleRemoveMedication = (id: string) => {
    setPrescriptionItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveDraft = async () => {
    setIsSavingDraft(true);
    try {
      await saveConsultationDraft({
        id: initialConsultation?.id,
        patientId: patient.patientId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        clinicName: doctor.clinicName,
        visitType,
        status: 'IN_PROGRESS',
        chiefComplaint,
        historyOfPresentIllness,
        vitals,
        clinicalExamination,
        assessment,
        plan,
      });
      showToast('Draft Saved', 'Consultation draft saved successfully.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to save draft.', 'error');
    } finally {
      setIsSavingDraft(false);
    }
  };

  const handleFinalize = async () => {
    if (!chiefComplaint.trim()) {
      showToast('Validation Error', 'Chief complaint is required before finalization.', 'error');
      return;
    }
    if (!assessment.trim()) {
      showToast('Validation Error', 'Clinical assessment is required before finalization.', 'error');
      return;
    }

    setIsFinalizing(true);
    try {
      // 1. Save or update draft first
      const savedCns = await saveConsultationDraft({
        id: initialConsultation?.id,
        patientId: patient.patientId,
        doctorId: doctor.id,
        doctorName: doctor.name,
        clinicName: doctor.clinicName,
        visitType,
        status: 'IN_PROGRESS',
        chiefComplaint,
        historyOfPresentIllness,
        vitals,
        clinicalExamination,
        assessment,
        plan,
      });

      // 2. Finalize consultation and issue prescription
      const finalized = await finalizeConsultation(
        savedCns.id,
        {
          clinicalAssessment: assessment,
          instructions: plan,
          followUp: 'Follow up as clinically indicated.',
          items: prescriptionItems,
        },
        patient.name
      );

      setIsFinalizing(false);
      setIsReviewModalOpen(false);
      showToast('Consultation Finalized', 'Consultation and e-prescription successfully issued and recorded in medical memory.', 'success');
      onFinalized();
      onClose();
    } catch (err: any) {
      setIsFinalizing(false);
      showToast('Finalization Error', err.message || 'Failed to finalize consultation.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-dropdown flex flex-col h-[95vh] max-w-7xl w-full overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-navy-950 text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-brand-600 text-white">
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold">Clinical Consultation Workspace</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-500/30 text-brand-300 border border-brand-400/30">
                  Live Encounter
                </span>
              </div>
              <p className="text-xs text-navy-300">
                Patient: <strong className="text-white">{patient.name}</strong> ({patient.patientId}) • Dr. {doctor.name}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSaveDraft}
              isLoading={isSavingDraft}
              leftIcon={<Save className="w-4 h-4" />}
              className="border-navy-700 text-navy-200 hover:bg-navy-900 hover:text-white"
            >
              Save Draft
            </Button>
            <Button
              size="sm"
              onClick={() => setIsReviewModalOpen(true)}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
              className="bg-brand-600 hover:bg-brand-700 text-white"
            >
              Review & Finalize
            </Button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-navy-300 hover:text-white hover:bg-navy-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Workspace Body: Left Form + Right Medical Memory Context Sidebar */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden bg-slate-50">
          {/* Left Column (8 cols): Consultation Form */}
          <div className="lg:col-span-8 overflow-y-auto p-6 space-y-6">
            {/* Patient Context & Allergy Alert Box */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-subtle space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-brand-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {patient.name ? patient.name.substring(0, 2).toUpperCase() : 'PT'}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-navy-900">{patient.name}</h3>
                    <p className="text-xs text-navy-500">
                      ID: <span className="font-mono font-bold">{patient.patientId}</span> • Age: {patient.age || 35} yrs • Gender: {patient.gender || 'Not specified'}
                    </p>
                  </div>
                </div>

                {/* Allergy Alert Badge */}
                <div>
                  {allergies.length > 0 ? (
                    <div className="bg-red-50 border border-red-200 text-red-900 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Allergy Alert: {allergies.map((a) => a.allergen).join(' • ')}</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>No known allergies recorded</span>
                    </div>
                  )}
                </div>
              </div>

              {conditions.length > 0 && (
                <div className="flex items-center space-x-2 text-xs text-navy-700">
                  <span className="font-semibold text-navy-400 uppercase text-[10px]">Conditions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {conditions.map((c) => (
                      <span key={c.id} className="px-2 py-0.5 rounded bg-slate-100 text-navy-800 font-medium text-[11px]">
                        {c.condition} ({c.status})
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Encounter Details & Chief Complaint */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Stethoscope className="w-4 h-4 text-brand-600" /> Chief Complaint & History
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField label="Visit Type">
                  <Select
                    value={visitType}
                    onChange={(e) => setVisitType(e.target.value as VisitType)}
                    options={[
                      { label: 'New Consultation', value: 'NEW_CONSULTATION' },
                      { label: 'Follow-up Visit', value: 'FOLLOW_UP' },
                      { label: 'Routine Checkup', value: 'ROUTINE_CHECKUP' },
                      { label: 'Emergency Visit', value: 'EMERGENCY' },
                      { label: 'Other', value: 'OTHER' },
                    ]}
                  />
                </FormField>

                <FormField label="Chief Complaint" required>
                  <Input
                    value={chiefComplaint}
                    onChange={(e) => setChiefComplaint(e.target.value)}
                    placeholder="e.g. Intermittent fever and fatigue for 3 days"
                  />
                </FormField>

                <div className="col-span-1 sm:col-span-2">
                  <FormField label="History of Present Illness (HPI)">
                    <Textarea
                      value={historyOfPresentIllness}
                      onChange={(e) => setHistoryOfPresentIllness(e.target.value)}
                      placeholder="Detail symptoms timeline, severity, aggravating/relieving factors..."
                      rows={3}
                      className="min-h-[80px]"
                    />
                  </FormField>
                </div>
              </div>
            </div>

            {/* Vitals Form */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-4 h-4 text-brand-600" /> Patient Vitals
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField label="Blood Pressure">
                  <Input
                    value={vitals.bloodPressure}
                    onChange={(e) => setVitals({ ...vitals, bloodPressure: e.target.value })}
                    placeholder="120/80 mmHg"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="Heart Rate">
                  <Input
                    value={vitals.heartRate}
                    onChange={(e) => setVitals({ ...vitals, heartRate: e.target.value })}
                    placeholder="78 bpm"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="Temperature">
                  <Input
                    value={vitals.temperature}
                    onChange={(e) => setVitals({ ...vitals, temperature: e.target.value })}
                    placeholder="98.6 °F"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="SpO₂">
                  <Input
                    value={vitals.spo2}
                    onChange={(e) => setVitals({ ...vitals, spo2: e.target.value })}
                    placeholder="98 %"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="Weight">
                  <Input
                    value={vitals.weight}
                    onChange={(e) => setVitals({ ...vitals, weight: e.target.value })}
                    placeholder="70 kg"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="Height">
                  <Input
                    value={vitals.height}
                    onChange={(e) => setVitals({ ...vitals, height: e.target.value })}
                    placeholder="170 cm"
                    className="text-xs"
                  />
                </FormField>

                <FormField label="BMI">
                  <Input
                    value={vitals.bmi}
                    onChange={(e) => setVitals({ ...vitals, bmi: e.target.value })}
                    placeholder="24.2"
                    className="text-xs"
                  />
                </FormField>
              </div>
            </div>

            {/* Clinical Assessment & Plan */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
              <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-100 pb-3">
                <HeartPulse className="w-4 h-4 text-brand-600" /> Clinical Assessment & Plan
              </h3>

              <div className="space-y-4">
                <FormField label="Clinical Examination & Findings">
                  <Textarea
                    value={clinicalExamination}
                    onChange={(e) => setClinicalExamination(e.target.value)}
                    placeholder="General exam, systemic findings..."
                    rows={2}
                    className="min-h-[70px]"
                  />
                </FormField>

                <FormField label="Clinical Assessment / Diagnosis" required>
                  <Textarea
                    value={assessment}
                    onChange={(e) => setAssessment(e.target.value)}
                    placeholder="Enter clinical assessment or provisional diagnosis..."
                    rows={2}
                    className="min-h-[70px]"
                  />
                </FormField>

                <FormField label="Plan / Advice / Follow-up">
                  <Textarea
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    placeholder="Patient advice, investigation instructions, follow-up schedule..."
                    rows={2}
                    className="min-h-[70px]"
                  />
                </FormField>
              </div>
            </div>

            {/* E-Prescription Builder */}
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider flex items-center gap-2">
                  <Pill className="w-4 h-4 text-brand-600" /> E-Prescription Medications ({prescriptionItems.length})
                </h3>
                <Button size="sm" onClick={() => setIsAddingMed(true)} leftIcon={<Plus className="w-4 h-4" />}>
                  Add Medication
                </Button>
              </div>

              {/* Added Medications List */}
              {prescriptionItems.length === 0 ? (
                <p className="text-xs text-navy-400 py-4 text-center">
                  No medications added to this prescription yet. Click "+ Add Medication" to prescribe.
                </p>
              ) : (
                <div className="space-y-3">
                  {prescriptionItems.map((item, idx) => (
                    <div key={item.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-mono font-bold text-brand-700">{idx + 1}.</span>
                          <span className="text-xs font-bold text-navy-900">{item.medicineName}</span>
                          {item.strength && <span className="text-xs text-navy-600 font-semibold">({item.strength})</span>}
                        </div>
                        <p className="text-xs text-navy-700 font-medium">
                          {item.dosage} • {item.frequency} • {item.duration}
                        </p>
                        <p className="text-[11px] text-navy-500 italic">Instruction: {item.foodInstruction || 'As directed'} {item.notes ? `• ${item.notes}` : ''}</p>
                      </div>

                      <button
                        onClick={() => handleRemoveMedication(item.id)}
                        className="text-navy-400 hover:text-red-600 p-1"
                        title="Remove Medication"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column (4 cols): Medical Memory Quick Context Sidebar */}
          <div className="lg:col-span-4 bg-white border-l border-slate-200/80 overflow-y-auto p-5 space-y-5">
            <div>
              <h3 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Clock className="w-4 h-4 text-brand-600" /> Medical Memory Context
              </h3>
              <p className="text-[11px] text-navy-500 mt-1">Previous clinical history and reports for quick review.</p>
            </div>

            {/* Recent Reports Summary */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-navy-700 uppercase tracking-wider">Latest Diagnostic Reports</p>
              {reports.length === 0 ? (
                <p className="text-xs text-navy-400 italic">No reports uploaded.</p>
              ) : (
                reports.slice(0, 3).map((r) => (
                  <div key={r.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <p className="font-bold text-navy-900 truncate">{r.fileName}</p>
                    <p className="text-[11px] text-navy-500">{r.reportType} • {new Date(r.uploadedAt).toLocaleDateString()}</p>
                    {r.analysis?.summary && (
                      <p className="text-[11px] text-navy-700 line-clamp-2 italic">"{r.analysis.summary}"</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Previous Prescriptions */}
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-navy-700 uppercase tracking-wider">Previous Prescriptions</p>
              {pastPrescriptions.length === 0 ? (
                <p className="text-xs text-navy-400 italic">No past prescriptions.</p>
              ) : (
                pastPrescriptions.slice(0, 2).map((prx) => (
                  <div key={prx.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-brand-700">{prx.prescriptionNumber}</span>
                      <span className="text-[10px] text-navy-500">{new Date(prx.prescriptionDate).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-navy-700">{prx.items.map((i: any) => `${i.medicineName} ${i.strength || ''}`).join(', ')}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Medication Modal */}
      <Modal
        isOpen={isAddingMed}
        onClose={() => setIsAddingMed(false)}
        title="Add Prescription Medication"
        subtitle="Configure dosage, frequency, and instructions"
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsAddingMed(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAddMedication}>
              Add Medication
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <FormField label="Medicine Name" required>
            <Input
              value={medName}
              onChange={(e) => setMedName(e.target.value)}
              placeholder="e.g. Paracetamol, Metformin, Amoxicillin"
              className="text-xs"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Strength">
              <Input
                value={medStrength}
                onChange={(e) => setMedStrength(e.target.value)}
                placeholder="e.g. 500 mg"
                className="text-xs"
              />
            </FormField>

            <FormField label="Dosage">
              <Input
                value={medDosage}
                onChange={(e) => setMedDosage(e.target.value)}
                placeholder="e.g. 1 tablet"
                className="text-xs"
              />
            </FormField>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Frequency">
              <Select
                value={medFrequency}
                onChange={(e) => setMedFrequency(e.target.value)}
                options={[
                  { label: 'Once daily (OD)', value: 'Once daily' },
                  { label: 'Twice daily (BD)', value: 'Twice daily' },
                  { label: 'Thrice daily (TDS)', value: 'Thrice daily' },
                  { label: 'Four times daily', value: 'Four times daily' },
                  { label: 'As needed (SOS)', value: 'As needed (SOS)' },
                ]}
              />
            </FormField>

            <FormField label="Duration">
              <Input
                value={medDuration}
                onChange={(e) => setMedDuration(e.target.value)}
                placeholder="e.g. 5 days"
                className="text-xs"
              />
            </FormField>
          </div>

          <FormField label="Food Instruction">
            <Select
              value={medFood}
              onChange={(e) => setMedFood(e.target.value)}
              options={[
                { label: 'Take after food', value: 'Take after food' },
                { label: 'Take before food', value: 'Take before food' },
                { label: 'Take with food', value: 'Take with food' },
                { label: 'As directed', value: 'As directed' },
              ]}
            />
          </FormField>

          <FormField label="Additional Notes (Optional)">
            <Input
              value={medNotes}
              onChange={(e) => setMedNotes(e.target.value)}
              placeholder="e.g. Avoid with dairy products"
              className="text-xs"
            />
          </FormField>
        </div>
      </Modal>

      {/* Review & Finalize Confirmation Modal */}
      <Modal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        title="Review Consultation & Prescription"
        subtitle="Finalized records become part of the patient's permanent clinical history."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsReviewModalOpen(false)} disabled={isFinalizing}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleFinalize}
              isLoading={isFinalizing}
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              {isFinalizing ? 'Finalizing...' : 'Finalize & Issue Prescription'}
            </Button>
          </>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-navy-900">Encounter Summary:</p>
            <p><strong className="text-navy-600">Patient:</strong> {patient.name} ({patient.patientId})</p>
            <p><strong className="text-navy-600">Chief Complaint:</strong> {chiefComplaint}</p>
            <p><strong className="text-navy-600">Clinical Assessment:</strong> {assessment}</p>
            <p><strong className="text-navy-600">Prescribed Medications:</strong> {prescriptionItems.length} item(s)</p>
          </div>

          <div className="bg-brand-50 border border-brand-200 p-3 rounded-xl text-brand-900 space-y-1">
            <p className="font-bold">Finalization Note:</p>
            <p className="text-[11px] text-brand-800 leading-relaxed">
              Once finalized, this consultation record and e-prescription will be securely stored in the patient's medical memory and formatted into an official prescription document.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
