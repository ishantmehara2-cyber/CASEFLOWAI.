import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Patient, Doctor } from '../../types';
import { PatientAvatar } from '../ui/PatientAvatar';
import { BrandLogo } from './BrandLogo';
import { buildQrPayload } from '../../services/patientQrService';
import { ShieldCheck, Sparkles, Building, Phone } from 'lucide-react';
import { cn } from '../../utils/cn';

interface PatientQrCardProps {
  patient: Patient;
  doctor?: Doctor | null;
  className?: string;
  id?: string;
}

export const PatientQrCard: React.FC<PatientQrCardProps> = ({
  patient,
  doctor,
  className,
  id = 'patient-qr-card-print',
}) => {
  const qrToken = patient.qrRecord?.qrToken || `CFP_${patient.patientId}`;
  const qrPayload = buildQrPayload(qrToken);

  const clinicName = doctor?.clinicName || 'CaseFlowAI Clinical Network';
  const doctorName = doctor?.name || 'Authorized Medical Practitioner';

  return (
    <div
      id={id}
      className={cn(
        'w-full max-w-sm bg-white rounded-2xl border-2 border-slate-200 shadow-card p-6 flex flex-col justify-between select-none relative overflow-hidden font-sans text-navy-900 mx-auto',
        className
      )}
    >
      {/* Decorative Brand Top Accent */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-700" />

      {/* Card Header: CaseFlowAI Brand Logo & Tagline */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mt-1">
        <BrandLogo size="sm" showTagline={false} />
        <div className="text-right">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100">
            Clinical Identity Card
          </span>
        </div>
      </div>

      {/* Clinic Name & Doctor Info */}
      <div className="my-3 py-2 px-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs space-y-0.5">
        <div className="flex items-center space-x-1.5 font-bold text-navy-900 truncate">
          <Building className="w-3.5 h-3.5 text-brand-600 shrink-0" />
          <span className="truncate">{clinicName}</span>
        </div>
        <p className="text-[11px] text-navy-500 pl-5">{doctorName} • {doctor?.specialization || 'Clinical Care'}</p>
      </div>

      {/* Patient Profile Details Section */}
      <div className="flex items-center space-x-3.5 my-2">
        <PatientAvatar
          image={patient.profilePhoto}
          name={patient.name}
          size="xl"
          className="ring-2 ring-brand-100 shadow-subtle shrink-0"
        />
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-extrabold text-navy-900 truncate leading-tight">
            {patient.name}
          </h3>
          <p className="text-xs text-navy-500 font-medium">
            {patient.gender || 'Patient'} • {patient.age} yrs
          </p>
          <div className="mt-1.5 inline-flex items-center space-x-1 font-mono font-bold text-xs bg-slate-100 text-navy-800 px-2 py-0.5 rounded border border-slate-200">
            <span className="text-navy-400 font-normal">ID:</span>
            <span>{patient.patientId}</span>
          </div>
        </div>
      </div>

      {/* High-Contrast Large QR Code */}
      <div className="my-4 p-4 bg-white rounded-xl border border-slate-200 shadow-subtle flex flex-col items-center justify-center">
        <div className="p-2 bg-white rounded-lg border border-slate-100">
          <QRCodeSVG
            value={qrPayload}
            size={160}
            level="H"
            includeMargin={false}
            fgColor="#0f172a"
            bgColor="#ffffff"
          />
        </div>
        <p className="text-[10px] font-bold text-navy-500 uppercase tracking-widest mt-2">
          Opaque Identity QR
        </p>
      </div>

      {/* Footer Security Disclaimer */}
      <div className="pt-2 border-t border-slate-100 text-center space-y-1">
        <div className="flex items-center justify-center space-x-1 text-[11px] font-semibold text-navy-600">
          <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
          <span>Scan to access patient record</span>
        </div>
        <p className="text-[9px] text-navy-400 uppercase tracking-wider font-medium">
          Authorized Clinical Use Only • No Medical Records Encoded
        </p>
      </div>
    </div>
  );
};
