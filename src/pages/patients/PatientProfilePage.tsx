import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppShell } from '../../components/layout/AppShell';
import { PatientAvatar } from '../../components/ui/PatientAvatar';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Button } from '../../components/ui/Button';
import { PageLoader } from '../../components/ui/PageLoader';
import { EmptyState } from '../../components/ui/EmptyState';
import { PatientQrCardModal } from '../../components/common/PatientQrCardModal';

import { AddConditionModal } from '../../components/patients/AddConditionModal';
import { AddAllergyModal } from '../../components/patients/AddAllergyModal';
import { AddVisitModal } from '../../components/patients/AddVisitModal';
import { EditPatientModal } from '../../components/patients/EditPatientModal';

import { getPatientById } from '../../services/patientService';
import { getCurrentDoctor } from '../../services/doctorService';
import {
  getPatientAllergies,
  getPatientConditions,
  getPatientVisits,
  getPatientTimeline,
} from '../../services/patientMedicalMemoryService';
import { getMedicalReports, analyzeReportAction } from '../../services/medicalReportService';
import { ReportUploadModal } from '../../components/reports/ReportUploadModal';
import { AnalysisAnimationModal } from '../../components/reports/AnalysisAnimationModal';
import { ReportViewerModal } from '../../components/reports/ReportViewerModal';
import { getPatientPrescriptions } from '../../services/prescriptionService';
import { openPrescriptionPrintWindow } from '../../services/prescriptionPdfService';
import { ConsultationWorkspace } from '../../components/consultation/ConsultationWorkspace';
import { Prescription } from '../../types/consultation';

import {
  Patient,
  Doctor,
  PatientAllergy,
  MedicalCondition,
  PatientVisit,
  TimelineEvent,
} from '../../types';

import {
  ArrowLeft,
  QrCode,
  Edit,
  AlertTriangle,
  Stethoscope,
  Activity,
  FileText,
  Pill,
  Bell,
  Calendar,
  Phone,
  Mail,
  User,
  MapPin,
  Clock,
  Plus,
  ShieldCheck,
  ShieldAlert,
  HeartPulse,
  Info,
  ChevronRight,
  UserCheck,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const PatientProfilePage: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'visits' | 'reports' | 'prescriptions' | 'reminders'>('overview');

  const [patient, setPatient] = useState<Patient | undefined>(undefined);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [allergies, setAllergies] = useState<PatientAllergy[]>([]);
  const [conditions, setConditions] = useState<MedicalCondition[]>([]);
  const [visits, setVisits] = useState<PatientVisit[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [hasAuthError, setHasAuthError] = useState(false);

  // Modals
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConditionModalOpen, setIsConditionModalOpen] = useState(false);
  const [isAllergyModalOpen, setIsAllergyModalOpen] = useState(false);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState(false);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<MedicalReport | null>(null);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);

  const loadPatientProfile = useCallback(async () => {
    if (!patientId) return;
    setIsLoading(true);
    setHasAuthError(false);

    try {
      const [p, doc] = await Promise.all([
        getPatientById(patientId),
        getCurrentDoctor(),
      ]);

      if (!p) {
        setPatient(undefined);
        setIsLoading(false);
        return;
      }

      setPatient(p);
      setDoctor(doc);

      // Load Medical Memory Records & Reports & Prescriptions
      const [algList, cndList, vstList, tlList, repList, prxList] = await Promise.all([
        getPatientAllergies(p.patientId),
        getPatientConditions(p.patientId),
        getPatientVisits(p.patientId),
        getPatientTimeline(p.patientId),
        getMedicalReports(p.patientId),
        getPatientPrescriptions(p.patientId),
      ]);

      setAllergies(algList);
      setConditions(cndList);
      setVisits(vstList);
      setTimeline(tlList);
      setReports(repList);
      setPrescriptions(prxList);

      setAllergies(algList);
      setConditions(cndList);
      setVisits(vstList);
      setTimeline(tlList);

      setIsLoading(false);
    } catch (e) {
      console.error('Error loading patient profile:', e);
      setIsLoading(false);
    }
  }, [patientId]);

  const handleReportUploaded = (reportId: string, fixtureId?: string) => {
    loadPatientProfile();
    if (fixtureId) {
      setPendingReportId(reportId);
      setIsAnalyzingModalOpen(true);
    }
  };

  const handleStartAnalysis = (reportId: string) => {
    setPendingReportId(reportId);
    setIsAnalyzingModalOpen(true);
  };

  const handleAnimationComplete = async () => {
    setIsAnalyzingModalOpen(false);
    if (!pendingReportId) return;

    try {
      const updated = await analyzeReportAction(pendingReportId);
      showToast('Analysis Complete', `CaseFlowAI successfully structured ${updated.reportType}.`, 'success');
      loadPatientProfile();
      setActiveReport(updated);
      setIsViewerOpen(true);
    } catch (err: any) {
      showToast('Analysis Error', err.message || 'Failed to analyze report.', 'error');
    } finally {
      setPendingReportId(null);
    }
  };

  useEffect(() => {
    loadPatientProfile();
  }, [loadPatientProfile]);

  if (isLoading) {
    return (
      <AppShell>
        <PageLoader message="Loading patient clinical medical memory..." />
      </AppShell>
    );
  }

  if (hasAuthError) {
    return (
      <AppShell>
        <div className="bg-white rounded-xl p-8 border border-red-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-subtle">
          <ShieldAlert className="w-12 h-12 text-red-600 mx-auto" />
          <h2 className="text-lg font-bold text-navy-900">Patient Access Restricted</h2>
          <p className="text-xs text-navy-500">
            Authorization required. This patient record is assigned to another clinical scope.
          </p>
          <Button onClick={() => navigate('/patients')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Patients Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  if (!patient) {
    return (
      <AppShell>
        <div className="bg-white rounded-xl p-8 border border-slate-200 text-center max-w-md mx-auto my-12 space-y-4 shadow-subtle">
          <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-navy-900">Patient Record Not Found</h2>
          <p className="text-xs text-navy-500">No active patient record matches identifier "{patientId}".</p>
          <Button onClick={() => navigate('/patients')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Patients Directory
          </Button>
        </div>
      </AppShell>
    );
  }

  const isQrActive = patient.qrRecord?.status === 'ACTIVE';
  const lastVisitDisplay = visits.length > 0 ? visits[0].visitDate : patient.lastVisit;

  return (
    <AppShell doctor={doctor || undefined}>
      <div className="space-y-6">
        {/* Top Breadcrumb & Action Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patients')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Patients Directory
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              onClick={() => setIsConsultationOpen(true)}
              leftIcon={<Stethoscope className="w-4 h-4 text-white" />}
              className="bg-brand-600 hover:bg-brand-700 text-white shadow-subtle"
            >
              Start Consultation
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditModalOpen(true)}
              leftIcon={<Edit className="w-3.5 h-3.5" />}
            >
              Edit Profile
            </Button>
            <Button
              size="sm"
              onClick={() => setIsQrModalOpen(true)}
              leftIcon={<QrCode className="w-4 h-4" />}
            >
              View QR Card
            </Button>
          </div>
        </div>

        {/* Patient Identity Header Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center space-x-4">
            <PatientAvatar
              image={patient.profilePhoto}
              name={patient.name}
              size="xl"
              className="ring-4 ring-brand-50 shrink-0"
            />
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-bold text-navy-900">{patient.name}</h1>
                <StatusBadge status={patient.status} size="md" />
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                    isQrActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  QR {isQrActive ? 'ACTIVE' : 'REVOKED'}
                </span>
              </div>
              <p className="text-xs text-navy-500 mt-1">
                Patient ID: <span className="font-mono font-bold text-navy-900">{patient.patientId}</span> • {patient.gender || 'Patient'} • {patient.age} yrs
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-navy-600 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-navy-400" /> {patient.phone || 'No phone recorded'}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-navy-400" /> {patient.email || 'No email recorded'}
                </span>
                {patient.bloodGroup && (
                  <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-100">
                    Blood Group: {patient.bloodGroup}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-1 shrink-0">
            <div className="flex items-center space-x-1.5 font-semibold text-navy-700">
              <Calendar className="w-3.5 h-3.5 text-brand-600" />
              <span>Last Visit Recorded:</span>
            </div>
            <p className="font-bold text-navy-900 pl-5">{lastVisitDisplay}</p>
          </div>
        </div>

        {/* Critical Clinical Alerts Bar */}
        {(allergies.length > 0 || conditions.filter((c) => c.status === 'Active').length > 0) && (
          <div className="bg-amber-50/90 border border-amber-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-subtle">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-900 uppercase tracking-wider">
                  Important Clinical Alerts
                </p>
                <div className="flex flex-wrap gap-2 mt-1.5 text-xs font-medium text-amber-900">
                  {allergies.map((a) => (
                    <span
                      key={a.id}
                      className="inline-flex items-center px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold border border-red-200"
                    >
                      Allergy Alert: {a.allergen} ({a.reaction})
                    </span>
                  ))}
                  {conditions
                    .filter((c) => c.status === 'Active')
                    .map((c) => (
                      <span
                        key={c.id}
                        className="inline-flex items-center px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-200"
                      >
                        Active Condition: {c.condition}
                      </span>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Medical Memory Summary Row (6 Metrics derived from real DB data) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Conditions</p>
            <p className="text-2xl font-bold text-navy-900 mt-1">{conditions.length}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Allergies</p>
            <p className="text-2xl font-bold text-red-600 mt-1">
              {allergies.length > 0 ? allergies.length : '0'}
            </p>
            {allergies.length === 0 && (
              <p className="text-[10px] text-navy-400 mt-0.5">Not recorded</p>
            )}
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Visits</p>
            <p className="text-2xl font-bold text-brand-600 mt-1">{visits.length}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Reports</p>
            <p className="text-2xl font-bold text-purple-600 mt-1">{patient.reportCount || 0}</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Prescriptions</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">1</p>
          </div>
          <div className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-subtle text-center">
            <p className="text-xs font-bold text-navy-500 uppercase tracking-wider">Reminders</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
          </div>
        </div>

        {/* Patient Workspace Navigation Tabs */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-1 shadow-subtle flex items-center overflow-x-auto space-x-1 text-xs font-semibold">
          {[
            { id: 'overview', label: 'Overview & Memory', icon: <HeartPulse className="w-3.5 h-3.5" /> },
            { id: 'history', label: 'Medical History', icon: <User className="w-3.5 h-3.5" />, badge: allergies.length > 0 ? `${allergies.length} Alert` : undefined },
            { id: 'visits', label: 'Visits & Encounters', icon: <Stethoscope className="w-3.5 h-3.5" />, badge: visits.length.toString() },
            { id: 'reports', label: 'Reports', icon: <FileText className="w-3.5 h-3.5" /> },
            { id: 'prescriptions', label: 'Prescriptions', icon: <Pill className="w-3.5 h-3.5" /> },
            { id: 'reminders', label: 'Medication Reminders', icon: <Bell className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white font-bold shadow-sm'
                  : 'text-navy-600 hover:bg-slate-100 hover:text-navy-900'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.badge && (
                <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === tab.id ? 'bg-white text-brand-700' : 'bg-brand-100 text-brand-700'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB 1: OVERVIEW & MEDICAL MEMORY */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fade-in">
            {/* Left Column (7 cols): Demographic & Medical Memory Summary */}
            <div className="lg:col-span-7 space-y-6">
              {/* Demographics Card */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <User className="w-4 h-4 text-brand-600" /> Patient Demographics & Contact
                  </h3>
                  <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(true)}>
                    Edit Details
                  </Button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Full Name</p>
                    <p className="font-bold text-navy-900 mt-0.5">{patient.name}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Age / DOB</p>
                    <p className="font-semibold text-navy-800 mt-0.5">{patient.age} yrs {patient.dateOfBirth ? `(${patient.dateOfBirth})` : ''}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Gender</p>
                    <p className="font-semibold text-navy-800 mt-0.5">{patient.gender || 'Not specified'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Phone</p>
                    <p className="font-medium text-navy-800 mt-0.5">{patient.phone || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Email</p>
                    <p className="font-medium text-navy-800 mt-0.5">{patient.email || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Blood Group</p>
                    <p className="font-bold text-navy-900 mt-0.5">{patient.bloodGroup || 'Not recorded'}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Residential Address</p>
                    <p className="font-medium text-navy-800 mt-0.5">{patient.address || 'Not recorded'}</p>
                  </div>
                  <div>
                    <p className="text-navy-400 font-bold uppercase text-[10px]">Emergency Contact</p>
                    <p className="font-semibold text-navy-900 mt-0.5">{patient.emergencyContactName || 'Not recorded'} {patient.emergencyContactPhone ? `(${patient.emergencyContactPhone})` : ''}</p>
                  </div>
                </div>
              </div>

              {/* Medical Memory Central Summary */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                      <HeartPulse className="w-5 h-5 text-brand-600" /> Longitudinal Medical Memory
                    </h3>
                    <p className="text-xs text-navy-500">Persistent clinical insights collected across visits</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => setActiveTab('history')}>
                    Manage History
                  </Button>
                </div>

                <div className="space-y-3 text-xs">
                  {/* Known Conditions */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-navy-900 uppercase text-[10px]">Active Medical Conditions ({conditions.length})</p>
                    {conditions.length === 0 ? (
                      <p className="text-navy-500 italic">No medical conditions recorded yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {conditions.map((c) => (
                          <span key={c.id} className="px-2.5 py-1 rounded bg-white border border-slate-200 font-semibold text-navy-800">
                            {c.condition} ({c.status})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Allergy Status */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <p className="font-bold text-navy-900 uppercase text-[10px]">Allergy Alerts ({allergies.length})</p>
                    {allergies.length === 0 ? (
                      <p className="text-navy-500 italic">Allergies: Not recorded</p>
                    ) : (
                      <div className="flex flex-wrap gap-2 pt-1">
                        {allergies.map((a) => (
                          <span key={a.id} className="px-2.5 py-1 rounded bg-red-50 text-red-800 border border-red-200 font-bold">
                            ⚠️ {a.allergen} ({a.reaction})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (5 cols): Real Chronological Event Timeline */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-5 h-5 text-brand-600" />
                    <h3 className="text-base font-bold text-navy-900">Clinical Timeline</h3>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    Real Events
                  </span>
                </div>

                {timeline.length === 0 ? (
                  <p className="text-xs text-navy-400 py-4 text-center">No timeline events recorded yet.</p>
                ) : (
                  <div className="relative pl-6 space-y-5 border-l-2 border-slate-200">
                    {timeline.map((event) => (
                      <div key={event.id} className="relative group text-xs space-y-1">
                        {/* Timeline dot */}
                        <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 rounded-full bg-brand-600 ring-4 ring-white border border-brand-200" />

                        <div className="flex items-center justify-between">
                          <p className="font-bold text-navy-900">{event.title}</p>
                          <span className="text-[10px] font-mono text-navy-400 shrink-0">{event.eventDate}</span>
                        </div>
                        <p className="text-navy-600 leading-relaxed">{event.description}</p>
                        <p className="text-[10px] text-brand-700 font-semibold">By {event.actorName}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDICAL HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6 animate-fade-in">
            {/* Allergies Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" /> Patient Allergy Alerts
                  </h3>
                  <p className="text-xs text-navy-500">Critical drug and substance sensitivity alerts</p>
                </div>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => setIsAllergyModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Allergy Alert
                </Button>
              </div>

              {allergies.length === 0 ? (
                <EmptyState
                  icon={<AlertTriangle className="w-8 h-8 text-navy-300" />}
                  title="No allergies recorded yet"
                  description="Allergies: Not recorded. Add relevant allergy alerts to protect patient safety during prescribing."
                  actionLabel="Add Allergy Alert"
                  onAction={() => setIsAllergyModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {allergies.map((alg) => (
                    <div
                      key={alg.id}
                      className="p-4 rounded-xl bg-red-50/70 border border-red-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-red-900 text-sm">{alg.allergen}</span>
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold uppercase text-[10px]">
                          {alg.severity} Severity
                        </span>
                      </div>
                      <p className="text-navy-800 font-medium">Reaction: {alg.reaction}</p>
                      {alg.notes && <p className="text-navy-600 text-[11px]">{alg.notes}</p>}
                      <p className="text-[10px] text-navy-400">Recorded by {alg.recordedBy} on {alg.recordedDate}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Existing Medical Conditions Section */}
            <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-brand-600" /> Existing Diagnoses & Medical Conditions
                  </h3>
                  <p className="text-xs text-navy-500">Longitudinal chronic condition tracking</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsConditionModalOpen(true)}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  Add Condition
                </Button>
              </div>

              {conditions.length === 0 ? (
                <EmptyState
                  icon={<HeartPulse className="w-8 h-8 text-navy-300" />}
                  title="No medical history recorded yet"
                  description="Add relevant clinical history to build the patient's medical memory."
                  actionLabel="Add Condition"
                  onAction={() => setIsConditionModalOpen(true)}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {conditions.map((cnd) => (
                    <div
                      key={cnd.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-navy-900 text-sm">{cnd.condition}</span>
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-bold border border-brand-100 text-[10px]">
                          {cnd.status}
                        </span>
                      </div>
                      <p className="text-navy-600">Diagnosed: {cnd.diagnosedDate}</p>
                      {cnd.notes && <p className="text-navy-700 font-medium">{cnd.notes}</p>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: VISITS & ENCOUNTERS */}
        {activeTab === 'visits' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Stethoscope className="w-5 h-5 text-brand-600" /> Clinical Visit History
                </h3>
                <p className="text-xs text-navy-500">Historical clinical consultation encounters</p>
              </div>
              <Button
                size="sm"
                onClick={() => setIsVisitModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Record New Visit
              </Button>
            </div>

            {visits.length === 0 ? (
              <EmptyState
                icon={<Stethoscope className="w-8 h-8 text-navy-300" />}
                title="No visits recorded yet"
                description="Consultations will appear here when recorded."
                actionLabel="Record New Visit"
                onAction={() => setIsVisitModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-navy-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                      <th className="py-3 px-4">Visit Date</th>
                      <th className="py-3 px-4">Doctor & Clinic</th>
                      <th className="py-3 px-4">Visit Type</th>
                      <th className="py-3 px-4">Chief Complaint</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-navy-800 text-xs">
                    {visits.map((v) => (
                      <tr key={v.id} className="hover:bg-slate-50">
                        <td className="py-3.5 px-4 font-bold text-navy-900 whitespace-nowrap">{v.visitDate}</td>
                        <td className="py-3.5 px-4">
                          <p className="font-bold text-navy-900">{v.doctorName}</p>
                          <p className="text-[11px] text-navy-500">{v.clinicName}</p>
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-brand-700">{v.visitType}</td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <p className="font-medium text-navy-900">{v.chiefComplaint}</p>
                          {v.notes && <p className="text-navy-500 text-[11px] truncate mt-0.5">{v.notes}</p>}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: REPORTS */}
        {activeTab === 'reports' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-brand-600" /> Diagnostic Medical Reports ({reports.length})
                </h3>
                <p className="text-xs text-navy-500">Uploaded lab diagnostic reports and CaseFlowAI summaries</p>
              </div>
              <Button size="sm" onClick={() => setIsUploadModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Upload Medical Report
              </Button>
            </div>

            {reports.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8 text-navy-300" />}
                title="No medical reports added yet"
                description="Upload lab files or select a demo report fixture to generate CaseFlowAI clinical summaries."
                actionLabel="Upload Medical Report"
                onAction={() => setIsUploadModalOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/70">
                      <th className="p-3">Report Name</th>
                      <th className="p-3">Type</th>
                      <th className="p-3">Uploaded Date</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {reports.map((rep) => (
                      <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-bold text-navy-900">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                            <span>{rep.fileName}</span>
                          </div>
                        </td>
                        <td className="p-3 font-medium text-navy-700">{rep.reportType}</td>
                        <td className="p-3 text-navy-500">
                          {new Date(rep.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3">
                          {rep.processingStatus === 'ANALYZED' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                              Analyzed
                            </span>
                          ) : rep.processingStatus === 'ANALYZING' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[10px] font-bold border border-brand-200 inline-flex items-center gap-1">
                              Analyzing...
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200 inline-flex items-center gap-1">
                              Uploaded
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right space-x-2">
                          {rep.processingStatus === 'UPLOADED' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartAnalysis(rep.id)}
                              leftIcon={<Sparkles className="w-3.5 h-3.5 text-brand-600" />}
                            >
                              Analyze with AI
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setActiveReport(rep);
                              setIsViewerOpen(true);
                            }}
                            leftIcon={<ExternalLink className="w-3.5 h-3.5" />}
                          >
                            {rep.processingStatus === 'ANALYZED' ? 'View Summary' : 'View Report'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: PRESCRIPTIONS */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-brand-600" /> Digital Prescriptions ({prescriptions.length})
                </h3>
                <p className="text-xs text-navy-500">Active e-prescriptions and medication histories</p>
              </div>
              <Button size="sm" onClick={() => setIsConsultationOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
                Start Consultation
              </Button>
            </div>

            {prescriptions.length === 0 ? (
              <EmptyState
                icon={<Pill className="w-8 h-8 text-navy-300" />}
                title="No digital prescriptions issued yet"
                description="Prescriptions finalized during clinical consultations will appear here."
                actionLabel="Start Consultation"
                onAction={() => setIsConsultationOpen(true)}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/70">
                      <th className="p-3">Rx Number</th>
                      <th className="p-3">Assessment</th>
                      <th className="p-3">Medications</th>
                      <th className="p-3">Date</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {prescriptions.map((rx) => (
                      <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-brand-700">{rx.prescriptionNumber}</td>
                        <td className="p-3 font-medium text-navy-900 truncate max-w-xs">{rx.clinicalAssessment}</td>
                        <td className="p-3 text-navy-600">
                          {rx.items.map((i) => `${i.medicineName} (${i.dosage})`).join(', ')}
                        </td>
                        <td className="p-3 text-navy-500">
                          {new Date(rx.prescriptionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </td>
                        <td className="p-3 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (patient && doctor) {
                                openPrescriptionPrintWindow(rx, patient, doctor);
                                showToast('Prescription PDF', 'Prescription document opened for printing / PDF save.', 'success');
                              }
                            }}
                            leftIcon={<Printer className="w-3.5 h-3.5 text-brand-600" />}
                          >
                            View / Print PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 6: REMINDERS */}
        {activeTab === 'reminders' && (
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-subtle space-y-4 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-navy-900 flex items-center gap-2">
                  <Bell className="w-5 h-5 text-amber-600" /> Medication Reminders
                </h3>
                <p className="text-xs text-navy-500">Scheduled automated medication compliance calls</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/reminders')}>
                Schedule Reminder
              </Button>
            </div>

            <EmptyState
              icon={<Bell className="w-8 h-8 text-navy-300" />}
              title="No medication reminders scheduled"
              description="Phase 10 automated voice medication compliance alerts will be tracked here."
              actionLabel="Go to Medication Reminders"
              onAction={() => navigate('/reminders')}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      <PatientQrCardModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        patient={patient}
        doctor={doctor}
      />

      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        doctorName={doctor?.name}
        onPatientUpdated={(updatedP) => {
          setPatient(updatedP);
          loadPatientProfile();
        }}
      />

      <AddConditionModal
        isOpen={isConditionModalOpen}
        onClose={() => setIsConditionModalOpen(false)}
        patientId={patient.patientId}
        doctorName={doctor?.name}
        onConditionAdded={() => loadPatientProfile()}
      />

      <AddAllergyModal
        isOpen={isAllergyModalOpen}
        onClose={() => setIsAllergyModalOpen(false)}
        patientId={patient.patientId}
        doctorName={doctor?.name}
        onAllergyAdded={() => loadPatientProfile()}
      />

      <AddVisitModal
        isOpen={isVisitModalOpen}
        onClose={() => setIsVisitModalOpen(false)}
        patientId={patient.patientId}
        doctor={doctor || { id: 'doc-001', name: 'Dr. Priya Sharma', specialization: 'General Physician', email: 'priya@caseflowai.med', clinicName: 'Apollo Clinical Care Center' }}
        onVisitAdded={() => loadPatientProfile()}
      />

      {/* Phase 7 Medical Report Modals */}
      {patient && doctor && (
        <ReportUploadModal
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
          patientId={patient.patientId}
          patientName={patient.name}
          doctor={doctor}
          onReportUploaded={handleReportUploaded}
        />
      )}

      <ReportViewerModal
        report={activeReport}
        isOpen={isViewerOpen}
        onClose={() => {
          setIsViewerOpen(false);
          setActiveReport(null);
        }}
        onAnalyze={(reportId) => {
          setIsViewerOpen(false);
          handleStartAnalysis(reportId);
        }}
      />

      <AnalysisAnimationModal
        isOpen={isAnalyzingModalOpen}
        onComplete={handleAnimationComplete}
        reportName={reports.find((r) => r.id === pendingReportId)?.fileName || 'Medical Report'}
      />

      {/* Phase 9 Consultation Workspace Modal */}
      {isConsultationOpen && patient && doctor && (
        <ConsultationWorkspace
          patient={patient}
          doctor={doctor}
          onClose={() => setIsConsultationOpen(false)}
          onFinalized={() => {
            loadPatientProfile();
          }}
        />
      )}
    </AppShell>
  );
};
