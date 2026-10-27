import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PatientQrCard } from './PatientQrCard';
import { Patient, Doctor } from '../../types';
import { Download, Printer, ShieldCheck } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface PatientQrCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  doctor?: Doctor | null;
}

export const PatientQrCardModal: React.FC<PatientQrCardModalProps> = ({
  isOpen,
  onClose,
  patient,
  doctor,
}) => {
  const { showToast } = useToast();

  if (!patient) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Generate simple SVG/PNG download trigger
    const svgElement = document.querySelector('#patient-qr-card-print svg');
    if (!svgElement) {
      showToast('Download Error', 'Could not locate QR card graphic.', 'error');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CaseFlowAI_QRCard_${patient.patientId}_${patient.name.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Downloaded', `Patient QR Identity Card downloaded for ${patient.name}.`, 'success');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Patient QR Identity Card"
      subtitle="Branded clinical continuity card for patient identity"
      maxWidth="md"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            leftIcon={<Download className="w-4 h-4" />}
          >
            Download Card
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print QR Card
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Printable/Downloadable Card Area */}
        <div className="py-2 flex justify-center">
          <PatientQrCard patient={patient} doctor={doctor} />
        </div>

        {/* Informational Security Notice */}
        <div className="p-3 bg-brand-50/80 border border-brand-100 rounded-xl text-xs text-brand-900 flex items-start space-x-2.5">
          <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold">Security Notice:</p>
            <p className="text-brand-800 leading-relaxed text-[11px]">
              This physical card contains only an opaque secure identifier token. No medical history, prescriptions, or contact numbers are embedded inside the QR code itself.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};
