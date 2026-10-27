import React, { useRef, useState } from 'react';
import { Camera, UploadCloud, X, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PatientPhotoUploadProps {
  label?: string;
  value?: string;
  onChange: (photoUrl: string | undefined) => void;
  className?: string;
}

export const PatientPhotoUpload: React.FC<PatientPhotoUploadProps> = ({
  label = 'Patient Profile Photo',
  value,
  onChange,
  className,
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];

  const processPhoto = (file: File) => {
    setError(null);

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid format. Please upload JPG, PNG, or WebP image.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Photo size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        onChange(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processPhoto(e.target.files[0]);
    }
  };

  return (
    <div className={cn('space-y-1.5 w-full', className)}>
      <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider">
        {label}
      </label>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/jpg"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        /* Photo Preview State */
        <div className="flex items-center space-x-4 p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0 shadow-subtle bg-white">
            <img src={value} alt="Patient preview" className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-navy-900">Patient Photo Uploaded</p>
            <p className="text-[11px] text-navy-500">Will be saved to patient clinical record</p>
            <div className="flex items-center space-x-3 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-semibold text-brand-600 hover:text-brand-800 hover:underline inline-flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Change Photo
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={() => onChange(undefined)}
                className="text-xs font-semibold text-red-600 hover:text-red-800 hover:underline inline-flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Remove Photo
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Upload Area */
        <div>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-200 hover:border-brand-400 bg-slate-50/50 hover:bg-brand-50/30 rounded-xl p-4 text-center cursor-pointer transition-colors group"
          >
            <Camera className="w-6 h-6 text-navy-400 group-hover:text-brand-600 mx-auto mb-1 transition-colors" />
            <p className="text-xs font-semibold text-navy-800">
              Upload Patient Photograph
            </p>
            <p className="text-[10px] text-navy-500 mt-0.5">JPG, PNG or WebP up to 5MB</p>
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
