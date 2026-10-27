import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { useToast } from '../../context/ToastContext';
import { DEMO_SCENARIO_FIXTURES } from '../../services/medicalReportAnalyzer';
import {
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck2,
  HelpCircle,
} from 'lucide-react';

interface ReportUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  doctor: { id: string; name: string; clinicName?: string };
  onReportUploaded: (reportId: string, fixtureId?: string) => void;
}

export const ReportUploadModal: React.FC<ReportUploadModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  doctor,
  onReportUploaded,
}) => {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFixtureId, setSelectedFixtureId] = useState<string>('');
  const [reportTypeHint, setReportTypeHint] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'fixtures' | 'custom'>('fixtures');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validExts = ['.pdf', '.jpg', '.jpeg', '.png', '.webp'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validExts.includes(ext)) {
      showToast('Unsupported File Type', 'Please upload a PDF, JPG, JPEG, or PNG document.', 'error');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('File Too Large', 'Maximum supported file size is 10 MB.', 'error');
      return;
    }

    setSelectedFile(file);
    setSelectedFixtureId('');
  };

  const handleFixtureSelect = (fixtureId: string) => {
    setSelectedFixtureId(fixtureId);
    setSelectedFile(null);
    const fix = DEMO_SCENARIO_FIXTURES.find((f) => f.id === fixtureId);
    if (fix) {
      setReportTypeHint(fix.reportType);
    }
  };

  const handleUploadSubmit = async () => {
    if (!selectedFile && !selectedFixtureId) {
      showToast('Selection Required', 'Please choose a demo fixture report or upload a custom file.', 'error');
      return;
    }

    setIsUploading(true);
    try {
      let fileName = selectedFile?.name || 'Medical_Report.pdf';
      let fileSize = selectedFile?.size || 1024 * 512;
      let fixtureHint = selectedFixtureId;

      if (selectedFixtureId && !selectedFile) {
        const fix = DEMO_SCENARIO_FIXTURES.find((f) => f.id === selectedFixtureId);
        if (fix) {
          fileName = fix.defaultFileName;
          fileSize = 1024 * 480;
        }
      }

      const { uploadMedicalReport } = await import('../../services/medicalReportService');
      const newReport = await uploadMedicalReport(
        patientId,
        patientName,
        {
          name: fileName,
          size: fileSize,
          type: fileName.endsWith('.png') ? 'image/png' : 'application/pdf',
        },
        doctor,
        fixtureHint,
        reportTypeHint || (selectedFixtureId ? 'Diagnostic Report' : 'Custom Report')
      );

      setIsUploading(false);
      showToast('Report Uploaded Securely', `${fileName} added to patient medical reports.`, 'success');
      onReportUploaded(newReport.id, fixtureHint);
      onClose();
    } catch (err: any) {
      setIsUploading(false);
      showToast('Upload Failed', err.message || 'Failed to upload report.', 'error');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Medical Report"
      subtitle={`Attach diagnostic lab report for ${patientName}`}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleUploadSubmit}
            isLoading={isUploading}
            leftIcon={<Upload className="w-4 h-4" />}
            disabled={!selectedFile && !selectedFixtureId}
          >
            {isUploading ? 'Uploading...' : 'Upload & Proceed'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {/* Tab Selector: Demo Fixtures vs Custom Upload */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('fixtures')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'fixtures'
                ? 'bg-white text-navy-900 shadow-subtle border border-slate-200/60'
                : 'text-navy-500 hover:text-navy-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>10 Demo Report Fixtures</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('custom')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'custom'
                ? 'bg-white text-navy-900 shadow-subtle border border-slate-200/60'
                : 'text-navy-500 hover:text-navy-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5 text-brand-600" />
            <span>Upload Custom File</span>
          </button>
        </div>

        {activeTab === 'fixtures' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-navy-700 uppercase tracking-wider">
                Select Controlled Demo Report Scenario:
              </p>
              <span className="text-[10px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-semibold border border-brand-200">
                10 Scenarios Available
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[280px] overflow-y-auto pr-1">
              {DEMO_SCENARIO_FIXTURES.map((fix) => {
                const isSelected = selectedFixtureId === fix.id;
                return (
                  <button
                    key={fix.id}
                    type="button"
                    onClick={() => handleFixtureSelect(fix.id)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start space-x-2.5 ${
                      isSelected
                        ? 'bg-brand-50 border-brand-500 ring-2 ring-brand-500/20 shadow-subtle'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-slate-100/80 hover:border-slate-300'
                    }`}
                  >
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${isSelected ? 'bg-brand-600 text-white' : 'bg-white text-brand-600 border border-slate-200'}`}>
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-xs font-bold truncate ${isSelected ? 'text-brand-900' : 'text-navy-900'}`}>
                        {fix.reportType}
                      </p>
                      <p className="text-[10px] text-navy-500 truncate mt-0.5">{fix.defaultFileName}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-brand-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50 hover:bg-brand-50/30 transition-all space-y-3"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-subtle border border-slate-200 text-brand-600">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-navy-900">Click to upload or drag and drop</p>
                <p className="text-[11px] text-navy-500 mt-0.5">PDF, JPG, JPEG, or PNG (maximum 10 MB)</p>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf, .jpg, .jpeg, .png, .webp"
                className="hidden"
              />
            </div>

            {selectedFile && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <FileCheck2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="font-bold text-navy-900 truncate">{selectedFile.name}</span>
                  <span className="text-[10px] text-navy-500 shrink-0">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFile(null)}
                  className="text-navy-400 hover:text-red-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <FormField label="Report Type Description (Optional)">
              <Input
                value={reportTypeHint}
                onChange={(e) => setReportTypeHint(e.target.value)}
                placeholder="e.g. Annual Health Checkup, Lipid Panel, Biopsy"
                className="text-xs"
              />
            </FormField>
          </div>
        )}
      </div>
    </Modal>
  );
};
