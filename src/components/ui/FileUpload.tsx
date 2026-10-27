import React from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '../../utils/cn';

interface FileUploadProps {
  label?: string;
  accept?: string;
  onFileSelect?: (file: File) => void;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label = 'Upload file or document',
  accept,
  onFileSelect,
  className,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && onFileSelect) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div
      className={cn(
        'border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/30 rounded-xl p-6 text-center transition-all cursor-pointer group',
        className
      )}
    >
      <input
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
        id="file-upload-input"
      />
      <label htmlFor="file-upload-input" className="cursor-pointer block">
        <UploadCloud className="w-8 h-8 text-navy-400 group-hover:text-brand-600 mx-auto mb-2 transition-colors" />
        <span className="text-sm font-medium text-navy-800 block">{label}</span>
        <span className="text-xs text-navy-500 block mt-1">PDF, PNG, JPG up to 10MB</span>
      </label>
    </div>
  );
};
