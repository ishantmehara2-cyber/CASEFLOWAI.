import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { RecentPatientsTable } from '../../components/dashboard/RecentPatientsTable';
import { getPatients } from '../../services/patientService';
import { Button } from '../../components/ui/Button';
import { AddPatientModal } from '../../components/dashboard/AddPatientModal';
import { QrScannerModal } from '../../components/common/QrScannerModal';
import { Plus, Users, QrCode } from 'lucide-react';
import { Patient } from '../../types';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPatients = useCallback(async () => {
    const list = await getPatients();
    setPatients(list);
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const filtered = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery))
  );

  return (
    <AppShell searchQuery={searchQuery} onSearchChange={setSearchQuery}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/60">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-brand-600" />
            Patient Management Directory
          </h1>
          <p className="text-xs text-navy-500 mt-0.5">
            Full clinical patient directory, history, and secure QR identities
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button size="sm" onClick={() => setIsAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
            Add New Patient
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsScannerOpen(true)}
            leftIcon={<QrCode className="w-4 h-4 text-brand-600" />}
          >
            Scan Patient QR
          </Button>
        </div>
      </div>

      <RecentPatientsTable patients={filtered} onAddPatient={() => setIsAddOpen(true)} />

      <AddPatientModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onPatientAdded={loadPatients}
      />

      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
      />
    </AppShell>
  );
};
