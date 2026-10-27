import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../ui/Modal';
import { FormField } from '../ui/FormField';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { PatientAvatar } from '../ui/PatientAvatar';
import {
  resolvePatientFromQrToken,
  resolvePatientFromPatientId,
  QrResolutionResult,
} from '../../services/patientQrService';
import { Patient } from '../../types';
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ArrowRight,
  ShieldAlert,
  Loader2,
  Sparkles,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDoctorId?: string;
  onPatientIdentified?: (patient: Patient) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  currentDoctorId = 'doc-001',
  onPatientIdentified,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [isScanning, setIsScanning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<QrResolutionResult | null>(null);
  const [manualIdInput, setManualIdInput] = useState('');
  const [isManualSubmitting, setIsManualSubmitting] = useState(false);
  const [showManualFallback, setShowManualFallback] = useState(false);

  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerRegionId = 'caseflow-qr-reader-region';

  const stopCameraStream = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current.clear();
      } catch (err) {
        console.warn('Error stopping camera scanner:', err);
      }
    }
  };

  const startCameraScanner = async () => {
    setCameraError(null);
    setScanResult(null);
    setIsScanning(true);

    try {
      await stopCameraStream();

      const html5QrCode = new Html5Qrcode(scannerRegionId);
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
        },
        async (decodedText) => {
          // On QR Code Successfully Detected
          await stopCameraStream();
          setIsScanning(false);

          const result = await resolvePatientFromQrToken(decodedText, currentDoctorId);
          setScanResult(result);

          if (result.status === 'SUCCESS' && result.patient) {
            showToast('Patient Identified', `${result.patient.name} (${result.patient.patientId})`, 'success');
            if (onPatientIdentified) onPatientIdentified(result.patient);

            // Auto-redirect to Patient Profile after 800ms
            setTimeout(() => {
              onClose();
              navigate(`/patients/${result.patient!.id}`);
            }, 800);
          }
        },
        (errorMessage) => {
          // Frame parse error (ignored during normal scanning loop)
        }
      );
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
      setIsScanning(false);
      setCameraError('Camera access required. Please allow camera permissions or enter Patient ID manually.');
      setShowManualFallback(true);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setScanResult(null);
      setCameraError(null);
      setShowManualFallback(false);
      setManualIdInput('');
      // Slight delay to ensure DOM element is mounted
      setTimeout(() => {
        startCameraScanner();
      }, 200);
    } else {
      stopCameraStream();
    }

    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualIdInput.trim()) return;

    setIsManualSubmitting(true);
    const result = await resolvePatientFromPatientId(manualIdInput, currentDoctorId);
    setIsManualSubmitting(false);

    setScanResult(result);

    if (result.status === 'SUCCESS' && result.patient) {
      showToast('Patient Identified', `${result.patient.name} (${result.patient.patientId})`, 'success');
      if (onPatientIdentified) onPatientIdentified(result.patient);

      setTimeout(() => {
        onClose();
        navigate(`/patients/${result.patient!.id}`);
      }, 700);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        stopCameraStream();
        onClose();
      }}
      title="Scan Patient QR Identity"
      subtitle="Position patient's CaseFlowAI QR card inside the scanning target frame"
      maxWidth="md"
      footer={
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              stopCameraStream();
              onClose();
            }}
          >
            Close
          </Button>
          {!showManualFallback && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowManualFallback(true)}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Manual Patient ID
            </Button>
          )}
          {cameraError && (
            <Button size="sm" onClick={startCameraScanner} leftIcon={<RefreshCw className="w-4 h-4" />}>
              Retry Camera
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        {/* Identified Success Display */}
        {scanResult?.status === 'SUCCESS' && scanResult.patient && (
          <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-3 animate-fade-in">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                Patient Identified
              </span>
              <h3 className="text-lg font-extrabold text-navy-900 mt-1">
                {scanResult.patient.name}
              </h3>
              <p className="text-xs font-mono font-bold text-emerald-800">
                Patient ID: {scanResult.patient.patientId}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 pt-2 text-xs font-bold text-emerald-700">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Opening Patient Profile...</span>
            </div>
          </div>
        )}

        {/* Error / Warning Scan Result Display */}
        {scanResult && scanResult.status !== 'SUCCESS' && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-xs space-y-2 animate-fade-in">
            <div className="flex items-center space-x-2 font-bold text-red-900">
              {scanResult.status === 'REVOKED_QR' ? (
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
              )}
              <span>
                {scanResult.status === 'REVOKED_QR'
                  ? 'QR Code Inactive (Revoked)'
                  : scanResult.status === 'ACCESS_DENIED'
                  ? 'Patient Access Restricted'
                  : 'Invalid QR Code'}
              </span>
            </div>
            <p className="text-red-800 leading-relaxed">{scanResult.message}</p>
            <div className="pt-2 flex justify-end">
              <Button size="sm" variant="outline" onClick={startCameraScanner} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                Scan Again
              </Button>
            </div>
          </div>
        )}

        {/* Live Camera Scanner Viewport */}
        {!scanResult?.patient && !showManualFallback && (
          <div className="space-y-3">
            <div className="relative bg-navy-950 rounded-2xl overflow-hidden border-2 border-slate-200 shadow-card min-h-[260px] flex items-center justify-center">
              {/* HTML5 QR Camera Container */}
              <div id={scannerRegionId} className="w-full h-full text-white" />

              {/* Camera Loading Overlay */}
              {isScanning && (
                <div className="absolute top-3 left-3 bg-navy-900/80 text-white text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 border border-navy-700">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Scanning active...</span>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{cameraError}</p>
              </div>
            )}
          </div>
        )}

        {/* Manual Patient ID Input Fallback */}
        {showManualFallback && !scanResult?.patient && (
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-navy-900 flex items-center gap-1.5">
                <Search className="w-4 h-4 text-brand-600" /> Manual Patient ID Fallback
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowManualFallback(false);
                  startCameraScanner();
                }}
                className="text-[11px] font-bold text-brand-600 hover:underline"
              >
                Switch to Camera Scan
              </button>
            </div>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <FormField label="Enter Patient ID (e.g. CF-P-7F82K4 or CF-00182)" required>
                <Input
                  placeholder="e.g. CF-P-7F82K4"
                  value={manualIdInput}
                  onChange={(e) => setManualIdInput(e.target.value)}
                  leftIcon={<Search className="w-4 h-4 text-navy-400" />}
                />
              </FormField>

              <Button
                type="submit"
                size="md"
                className="w-full"
                isLoading={isManualSubmitting}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Lookup & Resolve Patient Profile
              </Button>
            </form>
          </div>
        )}

        {/* Security Disclaimer */}
        <div className="text-center text-[10px] text-navy-400 font-medium">
          CaseFlowAI Secure Patient Resolution • Opaque Token Validation
        </div>
      </div>
    </Modal>
  );
};
