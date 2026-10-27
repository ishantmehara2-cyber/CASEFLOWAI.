import React, { useState } from 'react';
import { Patient } from '../../types';
import { PatientAvatar } from '../ui/PatientAvatar';
import { StatusBadge } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { EmptyState } from '../ui/EmptyState';
import { PatientQrCardModal } from '../common/PatientQrCardModal';
import { MoreVertical, Eye, ArrowUpRight, FileText, UserPlus, Users, QrCode } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';

interface RecentPatientsTableProps {
  patients: Patient[];
  onAddPatient?: () => void;
  className?: string;
}

export const RecentPatientsTable: React.FC<RecentPatientsTableProps> = ({
  patients,
  onAddPatient,
  className,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [selectedQrPatient, setSelectedQrPatient] = useState<Patient | null>(null);

  const handlePatientClick = (patient: Patient) => {
    navigate(`/patients/${patient.id}`);
  };

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden ${className}`}>
      {/* Table Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-navy-900">Recent Patients</h3>
          <p className="text-xs text-navy-500 mt-0.5">Active clinical cases & recent visits</p>
        </div>
        <div className="flex items-center space-x-2">
          {onAddPatient && (
            <Button
              size="sm"
              onClick={onAddPatient}
              leftIcon={<UserPlus className="w-3.5 h-3.5" />}
            >
              Add Patient
            </Button>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/patients')}
            rightIcon={<ArrowUpRight className="w-3.5 h-3.5" />}
          >
            View Directory
          </Button>
        </div>
      </div>

      {/* Table Body or Empty State */}
      {patients.length === 0 ? (
        <div className="p-6">
          <EmptyState
            icon={<Users className="w-10 h-10 text-navy-300" />}
            title="No patients yet"
            description="Register your first patient to begin building their clinical record."
            actionLabel="Add Patient"
            onAction={onAddPatient}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-navy-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                <th className="py-3 px-5">Patient</th>
                <th className="py-3 px-4">Patient ID</th>
                <th className="py-3 px-4">Age</th>
                <th className="py-3 px-4">Last Visit</th>
                <th className="py-3 px-4 text-center">Reports</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-navy-800">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  {/* Patient Name + Avatar */}
                  <td className="py-3.5 px-5">
                    <div className="flex items-center space-x-3">
                      <PatientAvatar
                        image={patient.profilePhoto}
                        name={patient.name}
                        size="md"
                      />
                      <div>
                        <p className="font-bold text-navy-900 group-hover:text-brand-600 transition-colors">
                          {patient.name}
                        </p>
                        <p className="text-xs text-navy-500">{patient.gender || 'Patient'}</p>
                      </div>
                    </div>
                  </td>

                  {/* Patient ID */}
                  <td className="py-3.5 px-4 font-mono text-xs font-medium text-navy-600">
                    {patient.patientId}
                  </td>

                  {/* Age */}
                  <td className="py-3.5 px-4 text-navy-700 font-medium">{patient.age} yrs</td>

                  {/* Last Visit */}
                  <td className="py-3.5 px-4 text-xs text-navy-600 font-medium">
                    {patient.lastVisit}
                  </td>

                  {/* Reports Count */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-navy-700 border border-slate-200">
                      <FileText className="w-3 h-3 mr-1 text-navy-400" />
                      {patient.reportCount || 0}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td className="py-3.5 px-4">
                    <StatusBadge status={patient.status || 'Active'} size="sm" />
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end space-x-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedQrPatient(patient)}
                        leftIcon={<QrCode className="w-3.5 h-3.5 text-brand-600" />}
                        title="View & Print Patient QR Identity Card"
                      >
                        QR
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePatientClick(patient)}
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        View
                      </Button>
                      <div className="relative">
                        <button
                          onClick={() =>
                            setActiveMenuId(activeMenuId === patient.id ? null : patient.id)
                          }
                          className="p-1.5 text-navy-400 hover:text-navy-700 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === patient.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setActiveMenuId(null)}
                            />
                            <div className="absolute right-0 mt-1 w-44 bg-white rounded-lg shadow-dropdown border border-slate-200 py-1 z-20 text-xs font-medium text-left">
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  setSelectedQrPatient(patient);
                                }}
                                className="w-full px-3 py-2 text-navy-700 hover:bg-slate-50 flex items-center"
                              >
                                View QR Card
                              </button>
                              <button
                                onClick={() => {
                                  setActiveMenuId(null);
                                  handlePatientClick(patient);
                                }}
                                className="w-full px-3 py-2 text-navy-700 hover:bg-slate-50 flex items-center"
                              >
                                Clinical Profile
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Card Modal */}
      <PatientQrCardModal
        isOpen={!!selectedQrPatient}
        onClose={() => setSelectedQrPatient(null)}
        patient={selectedQrPatient}
      />
    </div>
  );
};
