import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Button } from '../../components/ui/Button';
import { SearchInput } from '../../components/ui/SearchInput';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageLoader } from '../../components/ui/PageLoader';
import { SetReminderModal } from '../../components/reminders/SetReminderModal';
import { getAllPrescriptions } from '../../services/prescriptionService';
import { getCurrentDoctor } from '../../services/doctorService';
import { openPrescriptionPrintWindow } from '../../services/prescriptionPdfService';
import { getPatientById } from '../../services/patientService';
import { Prescription, PrescriptionItem } from '../../types/consultation';
import { Doctor, Patient } from '../../types';
import { useToast } from '../../context/ToastContext';
import {
  Pill,
  Search,
  Printer,
  Bell,
  ExternalLink,
  Calendar,
  User,
  FileText,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrescriptionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);
  const [selectedItem, setSelectedItem] = useState<PrescriptionItem | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [doc, allRx] = await Promise.all([getCurrentDoctor(), getAllPrescriptions()]);
      setDoctor(doc);
      setPrescriptions(allRx);
    } catch (e) {
      console.error('Failed to load prescriptions console:', e);
      showToast('Error', 'Unable to load prescriptions.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePrint = async (rx: Prescription) => {
    try {
      const patient = await getPatientById(rx.patientId);
      if (!patient || !doctor) {
        showToast('Error', 'Patient record not found for prescription export.', 'error');
        return;
      }
      openPrescriptionPrintWindow(rx, patient, doctor);
      showToast('Prescription PDF', 'Prescription document opened for printing / PDF save.', 'success');
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to generate prescription document.', 'error');
    }
  };

  const handleOpenReminder = async (rx: Prescription, item: PrescriptionItem) => {
    try {
      const patient = await getPatientById(rx.patientId);
      if (!patient) {
        showToast('Error', 'Patient record not found.', 'error');
        return;
      }
      setSelectedRx(rx);
      setSelectedItem(item);
      setSelectedPatient(patient);
      setIsReminderModalOpen(true);
    } catch (err: any) {
      showToast('Error', err.message || 'Failed to load patient for reminder.', 'error');
    }
  };

  const filteredRx = prescriptions.filter(
    (rx) =>
      rx.prescriptionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rx.clinicalAssessment.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppShell>
        <PageLoader message="Loading Digital Prescriptions console..." />
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
              <Pill className="w-7 h-7 text-brand-600" />
              Digital Prescriptions Console
            </h1>
            <p className="text-xs font-medium text-navy-500 mt-1">
              Centralized e-prescription repository with branded PDF generation and medication voice reminder scheduling.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <div className="bg-brand-50 border border-brand-100 rounded-xl px-3 py-2 text-xs font-bold text-brand-800 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>{prescriptions.length} Issued Prescriptions</span>
            </div>
          </div>
        </div>

        {/* Prescriptions Table */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-subtle p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">All Issued Prescriptions ({filteredRx.length})</h3>
              <p className="text-xs text-navy-500">Manage prescriptions, export PDF documents, and configure voice reminders</p>
            </div>

            <div className="w-full sm:w-72">
              <SearchInput
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                placeholder="Search by Rx number or patient..."
                className="text-xs"
              />
            </div>
          </div>

          {filteredRx.length === 0 ? (
            <EmptyState
              icon={<Pill className="w-8 h-8 text-navy-300" />}
              title="No digital prescriptions found"
              description="Prescriptions finalized during clinical consultations will aggregate in this console."
              actionLabel="Go to Patient Management"
              onAction={() => navigate('/patients')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] font-bold text-navy-400 uppercase tracking-wider bg-slate-50/70">
                    <th className="p-3">Rx Number</th>
                    <th className="p-3">Patient ID</th>
                    <th className="p-3">Assessment</th>
                    <th className="p-3">Medications & Voice Reminders</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredRx.map((rx) => (
                    <tr key={rx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-mono font-bold text-brand-700">{rx.prescriptionNumber}</td>
                      <td className="p-3 font-bold text-navy-900">
                        <button
                          onClick={() => navigate(`/patients/${rx.patientId}`)}
                          className="hover:underline text-brand-600 flex items-center gap-1"
                        >
                          <span>{rx.patientId}</span>
                          <span className="text-navy-700 font-normal">({rx.patientName})</span>
                        </button>
                      </td>
                      <td className="p-3 text-navy-800 font-medium truncate max-w-xs">{rx.clinicalAssessment}</td>
                      <td className="p-3 space-y-1.5">
                        {rx.items.map((item) => (
                          <div key={item.id} className="flex items-center justify-between bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200 gap-3">
                            <span className="font-bold text-navy-900">
                              {item.medicineName} ({item.strength || item.dosage}) — <span className="text-navy-600 font-normal">{item.frequency}</span>
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenReminder(rx, item)}
                              leftIcon={<Bell className="w-3.5 h-3.5 text-brand-600" />}
                              className="text-brand-700 hover:bg-brand-50 shrink-0 text-[11px] h-7 px-2"
                            >
                              Set Reminder
                            </Button>
                          </div>
                        ))}
                      </td>
                      <td className="p-3 text-navy-500">
                        {new Date(rx.prescriptionDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrint(rx)}
                          leftIcon={<Printer className="w-3.5 h-3.5 text-brand-600" />}
                        >
                          View / Print PDF
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

      {/* Set Reminder Modal */}
      {selectedRx && selectedItem && selectedPatient && doctor && (
        <SetReminderModal
          prescription={selectedRx}
          item={selectedItem}
          patient={selectedPatient}
          doctor={doctor}
          isOpen={isReminderModalOpen}
          onClose={() => {
            setIsReminderModalOpen(false);
            setSelectedRx(null);
            setSelectedItem(null);
            setSelectedPatient(null);
          }}
          onReminderCreated={() => {
            showToast('Reminder Scheduled', 'Voice call reminder successfully configured.', 'success');
            navigate('/reminders');
          }}
        />
      )}
    </AppShell>
  );
};
