import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, X, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export interface UploadedDocFile {
  id: string;
  documentType: 'registration_certificate' | 'professional_id' | 'degree_certificate' | 'identity_document';
  fileName: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
}

interface DocumentUploadProps {
  label: string;
  documentType: 'registration_certificate' | 'professional_id' | 'degree_certificate' | 'identity_document';
  description?: string;
  required?: boolean;
  value?: UploadedDocFile | null;
  onFileUploaded: (doc: UploadedDocFile) => void;
  onFileRemoved: (documentType: string) => void;
  className?: string;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  documentType,
  description = 'PDF, PNG, JPG up to 10MB',
  required = false,
  value,
  onFileUploaded,
  onFileRemoved,
  className,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];

  const processFile = (file: File) => {
    setError(null);

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Please upload a PDF, PNG, or JPG document.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('File size exceeds 10MB limit.');
      return;
    }

    setIsUploading(true);
    setProgress(20);

    // Simulate progress upload
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 25;
      });
    }, 120);

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setIsUploading(false);

      // Create object URL for preview
      const objectUrl = URL.createObjectURL(file);

      const uploadedDoc: UploadedDocFile = {
        id: `doc-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        documentType,
        fileName: file.name,
        fileUrl: objectUrl,
        fileSize: file.size,
        mimeType: file.type,
      };

      onFileUploaded(uploadedDoc);
    }, 700);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {value ? (
        /* Document Uploaded State */
        <div className="flex items-center justify-between p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-xl shadow-subtle animate-fade-in">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-navy-900 truncate">{value.fileName}</p>
              <div className="flex items-center text-[11px] text-emerald-800 space-x-2 mt-0.5">
                <span>{formatFileSize(value.fileSize)}</span>
                <span>•</span>
                <span className="inline-flex items-center font-semibold text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Uploaded
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onFileRemoved(documentType)}
            className="p-1 text-navy-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors ml-2"
            title="Remove document"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : isUploading ? (
        /* Uploading State */
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-navy-800">
            <span className="flex items-center">
              <Loader2 className="w-4 h-4 animate-spin text-brand-600 mr-2" /> Uploading document...
            </span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-brand-600 h-full transition-all duration-150"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        /* Drag & Drop Upload Zone */
        <div>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={cn(
              'border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer group',
              isDragging
                ? 'border-brand-500 bg-brand-50/50'
                : 'border-slate-200 hover:border-brand-400 bg-slate-50/40 hover:bg-slate-50',
              error && 'border-red-300 bg-red-50/20'
            )}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileChange}
              className="hidden"
            />
            <UploadCloud className="w-7 h-7 text-navy-400 group-hover:text-brand-600 mx-auto mb-1.5 transition-colors" />
            <p className="text-xs font-semibold text-navy-800">
              Drag and drop document or <span className="text-brand-600 hover:underline">browse files</span>
            </p>
            <p className="text-[11px] text-navy-500 mt-0.5">{description}</p>
          </div>

          {error && (
            <p className="text-xs text-red-600 mt-1 flex items-center">
              <AlertCircle className="w-3.5 h-3.5 mr-1 shrink-0" /> {error}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
