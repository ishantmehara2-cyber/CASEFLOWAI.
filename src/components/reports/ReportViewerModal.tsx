import React, { useState, useEffect } from 'react';
import { MedicalReport } from '../../types';
import { getMedicalReports } from '../../services/medicalReportService';
import { ReportComparisonModal } from './ReportComparisonModal';
import { Button } from '../ui/Button';
import { StatusBadge } from '../ui/StatusBadge';
import {
  FileText,
  X,
  Sparkles,
  Download,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  User,
  Building,
  Activity,
  ArrowRight,
  HelpCircle,
  Stethoscope,
  Maximize2,
  Minimize2,
  GitCompare,
} from 'lucide-react';

interface ReportViewerModalProps {
  report: MedicalReport | null;
  isOpen: boolean;
  onClose: () => void;
  onAnalyze?: (reportId: string) => void;
  isAnalyzing?: boolean;
}

export const ReportViewerModal: React.FC<ReportViewerModalProps> = ({
  report,
  isOpen,
  onClose,
  onAnalyze,
  isAnalyzing = false,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [patientReports, setPatientReports] = useState<MedicalReport[]>([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  useEffect(() => {
    if (!report || !isOpen) return;
    getMedicalReports(report.patientId).then(setPatientReports);
  }, [report, isOpen]);

  if (!isOpen || !report) return null;

  const analysis = report.analysis;

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'Within range':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Below range':
      case 'Above range':
        return 'bg-amber-50 text-amber-900 border-amber-200 font-bold';
      case 'Attention':
        return 'bg-rose-50 text-rose-900 border-rose-200 font-bold';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div
        className={`bg-white rounded-2xl border border-slate-200/80 shadow-dropdown flex flex-col transition-all duration-300 w-full ${
          isFullScreen ? 'h-[98vh] max-w-[98vw]' : 'h-[92vh] max-w-6xl'
        }`}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-navy-900 truncate">{report.fileName}</h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                  {report.fileType}
                </span>
              </div>
              <p className="text-xs text-navy-500 truncate">
                {report.reportType} • Patient ID: <span className="font-mono font-bold">{report.patientId}</span> • Uploaded{' '}
                {new Date(report.uploadedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            {report.processingStatus === 'ANALYZED' && (
              <Button
                size="sm"
                onClick={() => setIsComparisonOpen(true)}
                leftIcon={<GitCompare className="w-4 h-4 text-brand-600" />}
                className="bg-brand-50 text-brand-700 hover:bg-brand-100 border border-brand-200 shadow-subtle"
              >
                Compare With Last Visit
              </Button>
            )}

            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-2 rounded-lg text-navy-500 hover:text-navy-900 hover:bg-slate-200/60 hidden sm:block"
              title={isFullScreen ? 'Minimize Window' : 'Maximize Full Screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <a
              href={report.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy-700 hover:bg-slate-50 inline-flex items-center gap-1.5 shadow-subtle"
            >
              <ExternalLink className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Open File</span>
            </a>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-slate-200/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Split Content Area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* Left Column (5 cols): Original Report Viewer */}
          <div className="lg:col-span-5 border-r border-slate-200/80 bg-slate-100 flex flex-col p-4 min-h-0">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-navy-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" /> Original Source Document
              </span>
              <span className="text-[11px] text-navy-500 font-mono">{(report.fileSize / 1024).toFixed(1)} KB</span>
            </div>

            <div className="flex-1 bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col items-center justify-center p-4 relative shadow-subtle min-h-[300px]">
              {report.fileType === 'PDF' ? (
                <div className="text-center space-y-3 p-6 max-w-sm">
                  <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto border border-red-100">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-navy-900">{report.fileName}</h4>
                    <p className="text-xs text-navy-500 mt-1">PDF diagnostic lab document ready for review.</p>
                  </div>
                  <a
                    href={report.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700 shadow-subtle gap-2"
                  >
                    <span>View Full PDF Document</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center overflow-auto p-2">
                  <img
                    src={report.fileUrl}
                    alt={report.fileName}
                    className="max-h-full max-w-full object-contain rounded-lg border border-slate-200 shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200/80 text-[11px] text-navy-600 flex items-center justify-between">
              <span>Uploaded by: <strong className="text-navy-900">{report.uploadedBy}</strong></span>
              <span className="font-mono text-navy-500">{new Date(report.uploadedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Right Column (7 cols): CaseFlowAI Clinical Summary & Structured Findings */}
          <div className="lg:col-span-7 overflow-y-auto p-5 sm:p-6 space-y-6 bg-white min-h-0">
            {report.processingStatus === 'UPLOADED' && (
              <div className="bg-brand-50/70 border border-brand-200 rounded-2xl p-6 text-center space-y-4 my-auto">
                <div className="w-14 h-14 bg-white text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100 shadow-subtle">
                  <Sparkles className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Ready for CaseFlowAI Analysis</h3>
                  <p className="text-xs text-navy-600 mt-1 max-w-sm mx-auto">
                    Extract structured clinical parameters, abnormal reference flag highlights, and AI clinical summaries instantly.
                  </p>
                </div>
                {onAnalyze && (
                  <Button
                    size="md"
                    onClick={() => onAnalyze(report.id)}
                    isLoading={isAnalyzing}
                    leftIcon={<Sparkles className="w-4 h-4" />}
                  >
                    Analyze with CaseFlowAI
                  </Button>
                )}
              </div>
            )}

            {report.processingStatus === 'ANALYZING' && (
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <span className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto block" />
                <p className="text-sm font-bold text-navy-900">CaseFlowAI analysis in progress...</p>
                <p className="text-xs text-navy-500">Structuring clinical findings against reference ranges.</p>
              </div>
            )}

            {report.processingStatus === 'FAILED' && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
                <AlertTriangle className="w-8 h-8 text-red-600 mx-auto" />
                <h4 className="text-sm font-bold text-navy-900">Analysis Could Not Be Completed</h4>
                <p className="text-xs text-navy-500">The original report remains securely stored and accessible for review.</p>
                {onAnalyze && (
                  <Button size="sm" onClick={() => onAnalyze(report.id)}>
                    Retry Analysis
                  </Button>
                )}
              </div>
            )}

            {report.processingStatus === 'ANALYZED' && analysis && (
              <div className="space-y-6 animate-fade-in">
                {/* CaseFlowAI Summary Box */}
                <div className="bg-gradient-to-br from-brand-50/90 via-white to-brand-50/40 rounded-2xl border border-brand-200/80 p-5 shadow-subtle space-y-3 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-100/30 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-brand-600 text-white">
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                        CaseFlowAI Summary
                      </h3>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white border border-brand-200 text-brand-700 shadow-xs">
                      v1.0 • Verified
                    </span>
                  </div>

                  <p className="text-xs text-navy-800 leading-relaxed font-medium">
                    "{analysis.summary}"
                  </p>

                  <div className="pt-2 border-t border-brand-100/80 flex items-center justify-between text-[11px] text-navy-500">
                    <span className="font-semibold text-brand-900">AI STRUCTURES. DOCTOR DECIDES.</span>
                    <span>AI-structured information — doctor review required.</span>
                  </div>
                </div>

                {/* Extracted Clinical Findings / Lab Parameters */}
                {analysis.structuredData && analysis.structuredData.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-navy-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-brand-600" /> Extracted Clinical Findings ({analysis.structuredData.length})
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {analysis.structuredData.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-200/80 space-y-2 hover:border-brand-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-navy-900">{item.parameter}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getStatusBadgeStyle(item.status)}`}>
                              {item.status}
                            </span>
                          </div>

                          <div className="flex items-baseline justify-between">
                            <span className="text-base font-extrabold text-navy-950">{item.value}</span>
                            <span className="text-[11px] text-navy-500 font-mono">Ref: {item.referenceRange}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clinical Highlights */}
                {analysis.clinicalHighlights && analysis.clinicalHighlights.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-2.5">
                    <h4 className="text-xs font-bold text-navy-800 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical Highlights
                    </h4>
                    <ul className="space-y-1.5 text-xs text-navy-700">
                      {analysis.clinicalHighlights.map((hl, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                          <span>{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Doctor Attention */}
                {analysis.doctorAttention && analysis.doctorAttention.length > 0 && (
                  <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Doctor Review
                    </h4>
                    <ul className="space-y-1.5 text-xs text-amber-950">
                      {analysis.doctorAttention.map((att, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{att}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggested Follow-up */}
                {analysis.followUpPoints && analysis.followUpPoints.length > 0 && (
                  <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 space-y-2.5">
                    <h4 className="text-xs font-bold text-blue-900 uppercase tracking-wider flex items-center gap-1.5">
                      <Stethoscope className="w-4 h-4 text-blue-600" /> Suggested Follow-up (For Doctor Consideration)
                    </h4>
                    <ul className="space-y-1.5 text-xs text-blue-950">
                      {analysis.followUpPoints.map((fp, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                          <span>{fp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Comparison Modal */}
      <ReportComparisonModal
        currentReport={report}
        patientReports={patientReports}
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
      />
    </div>
  );
};
