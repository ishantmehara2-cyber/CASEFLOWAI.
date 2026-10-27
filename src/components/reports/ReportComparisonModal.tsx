import React, { useState, useEffect } from 'react';
import { MedicalReport } from '../../types';
import { ReportComparisonResult } from '../../types/reportComparison';
import { getOrCreateComparison, findPreviousComparableReport } from '../../services/reportComparisonService';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import {
  FileText,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  HelpCircle,
} from 'lucide-react';

interface ReportComparisonModalProps {
  currentReport: MedicalReport | null;
  patientReports: MedicalReport[];
  isOpen: boolean;
  onClose: () => void;
}

export const ReportComparisonModal: React.FC<ReportComparisonModalProps> = ({
  currentReport,
  patientReports,
  isOpen,
  onClose,
}) => {
  const [comparison, setComparison] = useState<ReportComparisonResult | null>(null);
  const [previousReport, setPreviousReport] = useState<MedicalReport | null>(null);
  const [selectedPreviousId, setSelectedPreviousId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen || !currentReport) return;

    let isMounted = true;
    setIsLoading(true);

    async function loadComp() {
      try {
        const { comparison: comp, previousReport: prev } = await getOrCreateComparison(
          currentReport!,
          patientReports,
          selectedPreviousId || undefined
        );
        if (isMounted) {
          setComparison(comp);
          setPreviousReport(prev);
          if (prev && !selectedPreviousId) {
            setSelectedPreviousId(prev.id);
          }
        }
      } catch (e) {
        console.error('Failed to generate report comparison:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadComp();

    return () => {
      isMounted = false;
    };
  }, [isOpen, currentReport, patientReports, selectedPreviousId]);

  if (!isOpen || !currentReport) return null;

  // Filter compatible previous reports for dropdown selector
  const compatiblePreviousReports = patientReports.filter(
    (r) =>
      r.id !== currentReport.id &&
      r.processingStatus === 'ANALYZED' &&
      new Date(r.uploadedAt).getTime() < new Date(currentReport.uploadedAt).getTime() &&
      (r.reportType || '').toLowerCase() === (currentReport.reportType || '').toLowerCase()
  );

  const getDirectionIcon = (dir: string) => {
    switch (dir) {
      case 'INCREASED':
        return <TrendingUp className="w-4 h-4 text-amber-600 inline mr-1" />;
      case 'DECREASED':
        return <TrendingDown className="w-4 h-4 text-brand-600 inline mr-1" />;
      case 'STABLE':
        return <Minus className="w-4 h-4 text-slate-400 inline mr-1" />;
      default:
        return null;
    }
  };

  const getClassificationBadge = (cls: string) => {
    switch (cls) {
      case 'IMPROVED':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'INCREASED':
        return 'bg-amber-50 text-amber-900 border-amber-200';
      case 'DECREASED':
        return 'bg-blue-50 text-blue-900 border-blue-200';
      case 'STABLE':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      case 'NEWLY RECORDED':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-dropdown flex flex-col h-[90vh] max-w-5xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/80 bg-slate-50/80 rounded-t-2xl shrink-0">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100 shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-bold text-navy-900 truncate">
                Longitudinal Report Comparison: {currentReport.reportType}
              </h2>
              <p className="text-xs text-navy-500 truncate">
                Patient ID: <span className="font-mono font-bold">{currentReport.patientId}</span> • Compare with Last Visit
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-navy-400 hover:text-navy-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-20 text-center space-y-3">
              <span className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto block" />
              <p className="text-sm font-bold text-navy-900">Comparing reports across patient timeline...</p>
            </div>
          ) : !previousReport || !comparison ? (
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto my-12">
              <div className="w-14 h-14 bg-white text-navy-400 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 shadow-subtle">
                <FileText className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-navy-900">No Previous Comparable Report Found</h3>
                <p className="text-xs text-navy-600 mt-1">
                  CaseFlowAI could not find an earlier analyzed report of the same type ({currentReport.reportType}) for longitudinal comparison.
                </p>
              </div>
              <Button size="sm" variant="outline" onClick={onClose}>
                Back to Report
              </Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              {/* Report Selector Header */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Current Report</span>
                  <p className="text-xs font-bold text-navy-900">
                    {currentReport.reportType} • {new Date(currentReport.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex items-center text-brand-600 shrink-0">
                  <ArrowRight className="w-5 h-5 hidden sm:block" />
                </div>

                <div className="space-y-1 flex-1 max-w-xs">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-navy-400">Compare With Previous</span>
                  <select
                    value={selectedPreviousId}
                    onChange={(e) => setSelectedPreviousId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg text-xs font-medium px-3 py-2 text-navy-900 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {compatiblePreviousReports.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.reportType} — {new Date(r.uploadedAt).toLocaleDateString()}
                      </option>
                    ))}
                    {previousReport && !compatiblePreviousReports.some((r) => r.id === previousReport.id) && (
                      <option value={previousReport.id}>
                        {previousReport.reportType} — {new Date(previousReport.uploadedAt).toLocaleDateString()}
                      </option>
                    )}
                  </select>
                </div>
              </div>

              {/* Comparison Summary Card */}
              <div className="bg-gradient-to-br from-brand-50/90 via-white to-brand-50/40 rounded-2xl border border-brand-200/80 p-5 shadow-subtle space-y-3 relative overflow-hidden">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-brand-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-navy-900 uppercase tracking-wider">
                    Comparison Summary
                  </h3>
                </div>
                <p className="text-xs text-navy-800 leading-relaxed font-medium">
                  "{comparison.summary}"
                </p>
                <div className="pt-2 border-t border-brand-100 flex items-center justify-between text-[11px] text-navy-500">
                  <span className="font-semibold text-brand-900">AI STRUCTURES. DOCTOR DECIDES.</span>
                  <span>AI-structured comparison — doctor review required.</span>
                </div>
              </div>

              {/* Parameter Comparison Table */}
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-subtle">
                <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-brand-600" /> Parameter Changes ({comparison.parameters.length})
                  </h4>
                  <span className="text-[11px] text-navy-500">
                    Previous: {new Date(previousReport.uploadedAt).toLocaleDateString()} vs Current: {new Date(currentReport.uploadedAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/40">
                        <th className="p-3.5">Parameter</th>
                        <th className="p-3.5">Previous Value</th>
                        <th className="p-3.5">Current Value</th>
                        <th className="p-3.5">Absolute Change</th>
                        <th className="p-3.5">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {comparison.parameters.map((p, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-3.5 font-bold text-navy-900">{p.name}</td>
                          <td className="p-3.5 text-navy-600 font-mono">{p.previousValue}</td>
                          <td className="p-3.5 font-bold text-navy-900 font-mono">{p.currentValue}</td>
                          <td className="p-3.5 font-mono font-semibold text-navy-800">
                            {getDirectionIcon(p.direction)}
                            {p.absoluteChange !== null && p.absoluteChange !== undefined
                              ? (p.absoluteChange > 0 ? `+${p.absoluteChange}` : p.absoluteChange)
                              : '—'}
                          </td>
                          <td className="p-3.5">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getClassificationBadge(p.classification)}`}>
                              {p.classification}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Clinical Highlights & Doctor Attention */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <h4 className="text-xs font-bold text-navy-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Clinical Highlights
                  </h4>
                  <ul className="space-y-2 text-xs text-navy-700">
                    {comparison.clinicalHighlights.map((hl, i) => (
                      <li key={i} className="flex items-start space-x-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-amber-50/70 rounded-2xl p-5 border border-amber-200 space-y-3">
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" /> Areas for Doctor Review
                  </h4>
                  <ul className="space-y-2 text-xs text-amber-950">
                    {comparison.doctorAttention.length === 0 ? (
                      <p className="text-xs text-amber-800 italic">No specific areas requiring urgent review identified.</p>
                    ) : (
                      comparison.doctorAttention.map((att, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                          <span>{att}</span>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
