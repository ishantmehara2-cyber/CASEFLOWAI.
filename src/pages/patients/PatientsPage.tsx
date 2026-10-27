import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { RecentPatientsTable } from '../../components/dashboard/RecentPatientsTable';
import { demoPatients } from '../../data/patientsData';
import { Button } from '../../components/ui/Button';
import { AddPatientModal } from '../../components/dashboard/AddPatientModal';
import { Plus, Users } from 'lucide-react';

export const PatientsPage: React.FC = () => {
  const [patients, setPatients] = useState(demoPatients);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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
            Full clinical patient directory, history, and uploaded intake files
          </p>
        </div>
        <Button size="sm" onClick={() => setIsAddOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add New Patient
        </Button>
      </div>

      <RecentPatientsTable patients={filtered} onAddPatient={() => setIsAddOpen(true)} />

      <AddPatientModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onAddPatient={(newP) => setPatients([newP, ...patients])}
      />
    </AppShell>
  );
};
