import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { ReportViewerModal } from '../../components/reports/ReportViewerModal';
import { AnalysisAnimationModal } from '../../components/reports/AnalysisAnimationModal';
import { getAllMedicalReports, analyzeReportAction } from '../../services/medicalReportService';
import { getCurrentDoctor } from '../../services/doctorService';
import { MedicalReport, Doctor } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  FileText,
  Sparkles,
  Search,
  ExternalLink,
  ShieldCheck,
  Activity,
  Calendar,
  User,
  CheckCircle2,
  AlertTriangle,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [reports, setReports] = useState<MedicalReport[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [activeReport, setActiveReport] = useState<MedicalReport | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState<boolean>(false);
  const [isAnalyzingModalOpen, setIsAnalyzingModalOpen] = useState<boolean>(false);
  const [pendingReportId, setPendingReportId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [doc, allReports] = await Promise.all([getCurrentDoctor(), getAllMedicalReports()]);
      setDoctor(doc);
      setReports(allReports);
    } catch (e) {
      console.error('Failed to load global reports console:', e);
      showToast('Error', 'Unable to load medical reports.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
      loadData();
      setActiveReport(updated);
      setIsViewerOpen(true);
    } catch (err: any) {
      showToast('Analysis Error', err.message || 'Failed to analyze report.', 'error');
    } finally {
      setPendingReportId(null);
    }
  };

  const filteredReports = reports.filter(
    (r) =>
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.reportType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.patientName && r.patientName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalAnalyzed = reports.filter((r) => r.processingStatus === 'ANALYZED').length;

  if (isLoading) {
    return (
      <AppShell>
        <PageLoader message="Loading CaseFlowAI Medical Reports Intelligence console..." />
      </AppShell>
    );
  }

  return (
    <AppShell doctor={doctor || undefined} searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="space-y-6 pb-12">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/80">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight flex items-center gap-2.5">
              <FileText className="w-7 h-7 text-brand-600" />
              Medical Reports Intelligence
            </h1>
            <p className="text-xs font-medium text-navy-500 mt-1">
              Centralized diagnostic report repository with automated CaseFlowAI clinical summaries & parameter extraction.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-brand-600" />
              <span>{totalAnalyzed} Analyzed Reports</span>
            </div>
          </div>
        </div>

        {/* Global Reports Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">All Patient Reports ({filteredReports.length})</h3>
              <p className="text-xs text-navy-500">Click any report to inspect original file and CaseFlowAI clinical summary</p>
            </div>

            <div className="w-full sm:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search reports by patient or type..."
                className="text-xs"
              />
            </div>
          </div>

          {filteredReports.length === 0 ? (
            <EmptyState
              icon={<FileText className="w-8 h-8 text-navy-300" />}
              title="No diagnostic medical reports found"
              description="Reports uploaded inside patient profiles will aggregate in this centralized console."
              actionLabel="Go to Patient Management"
              onAction={() => navigate('/patients')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/70">
                    <th className="p-3">Report Name</th>
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Report Type</th>
                    <th className="p-3">Uploaded Date</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredReports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-navy-900">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-brand-600 shrink-0" />
                          <span>{rep.fileName}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-brand-700">
                        <button
                          onClick={() => navigate(`/patients/${rep.patientId}`)}
                          className="hover:underline flex items-center gap-1"
                        >
                          <span>{rep.patientId}</span>
                          {rep.patientName && <span className="text-navy-500 font-normal">({rep.patientName})</span>}
                        </button>
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
      </div>

      {/* Report Viewer / Summary Modal */}
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

      {/* Analysis Processing Animation Modal */}
      <AnalysisAnimationModal
        isOpen={isAnalyzingModalOpen}
        onComplete={handleAnimationComplete}
        reportName={reports.find((r) => r.id === pendingReportId)?.fileName || 'Medical Report'}
      />
    </AppShell>
  );
};
