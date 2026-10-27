import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { RecentPatientsTable } from '../../components/dashboard/RecentPatientsTable';
import { UpcomingRemindersCard } from '../../components/dashboard/UpcomingRemindersCard';
import { ConsultationTrendChart } from '../../components/dashboard/ConsultationTrendChart';
import { ReportsOverviewChart } from '../../components/dashboard/ReportsOverviewChart';
import { RecentActivityFeed } from '../../components/dashboard/RecentActivityFeed';
import { AddPatientModal } from '../../components/dashboard/AddPatientModal';
import { QrScannerModal } from '../../components/common/QrScannerModal';
import { Button } from '../../components/ui/Button';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { TableSkeleton } from '../../components/ui/TableSkeleton';

import { getCurrentDoctor } from '../../services/doctorService';
import { getPatients } from '../../services/patientService';
import { getUpcomingReminders } from '../../services/reminderService';
import { getConsultationTrend } from '../../services/consultationService';
import { getReportsOverview } from '../../services/reportService';
import { getRecentActivities } from '../../services/activityService';
import { getDashboardMetrics } from '../../services/dashboardService';
import { clearDatabase, seedDemoDatabase } from '../../services/storage';

import { Doctor, Patient, MedicationReminder, MetricData, ConsultationTrendPoint, ReportsOverviewData, ActivityItem } from '../../types';
import { Plus, Calendar, AlertTriangle, RefreshCw, Database, Trash2, QrCode } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const DashboardPage: React.FC = () => {
  const { showToast } = useToast();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [trendData, setTrendData] = useState<ConsultationTrendPoint[]>([]);
  const [reportsOverview, setReportsOverview] = useState<ReportsOverviewData>({
    total: 0,
    normal: 0,
    abnormal: 0,
    needsReview: 0,
    others: 0,
  });
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasError, setHasError] = useState<boolean>(false);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState<boolean>(false);
  const [isScannerOpen, setIsScannerOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const doc = await getCurrentDoctor();
      setDoctor(doc);

      const [mList, pList, rList, tList, repData, actList] = await Promise.all([
        getDashboardMetrics(),
        getPatients(),
        getUpcomingReminders(),
        getConsultationTrend('7days'),
        getReportsOverview(),
        getRecentActivities(),
      ]);

      setMetrics(mList);
      setPatients(pList);
      setReminders(rList);
      setTrendData(tList);
      setReportsOverview(repData);
      setActivities(actList);

      setIsLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setHasError(true);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handlePatientAdded = () => {
    loadDashboardData();
  };

  const handleTestClearDB = () => {
    clearDatabase();
    loadDashboardData();
    showToast('Database Cleared', 'Tested empty database state. All metrics reset to 0.', 'warning');
  };

  const handleTestSeedDB = () => {
    seedDemoDatabase();
    loadDashboardData();
    showToast('Demo Data Seeded', 'Populated database with clinical demo records.', 'success');
  };

  const filteredPatients = patients.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.phone && p.phone.includes(searchQuery))
  );

  return (
    <AppShell searchQuery={searchQuery} onSearchChange={setSearchQuery} doctor={doctor || undefined}>
      {/* Top Welcome Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-900">
            Good morning, {doctor ? doctor.name : 'Doctor'}
          </h1>
          <div className="flex items-center space-x-2 mt-1">
            <span className="text-sm font-medium text-navy-600">
              Here's your clinic overview for today.
            </span>
            <span className="inline-block px-2.5 py-0.5 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-100">
              {doctor?.specialization || 'General Practice'}
            </span>
          </div>
        </div>

        {/* Right Action Controls: [ + Add Patient ] [ Scan Patient QR ] */}
        <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
          <div className="hidden lg:inline-flex items-center px-3 py-2 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-navy-700 shadow-subtle">
            <Calendar className="w-4 h-4 text-brand-600 mr-2" />
            <span>Today, 26 Oct 2026</span>
          </div>

          <Button
            size="md"
            onClick={() => setIsAddPatientOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Patient
          </Button>

          <Button
            size="md"
            variant="outline"
            onClick={() => setIsScannerOpen(true)}
            leftIcon={<QrCode className="w-4 h-4 text-brand-600" />}
            className="border-brand-200 hover:bg-brand-50 hover:text-brand-700"
          >
            Scan Patient QR
          </Button>
        </div>
      </div>

      {/* Error View */}
      {hasError ? (
        <div className="bg-white rounded-xl p-8 border border-red-200 shadow-subtle text-center max-w-lg mx-auto my-12 space-y-4">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-navy-900">Unable to load dashboard data</h3>
            <p className="text-xs text-navy-500 mt-1">
              An error occurred while communicating with the database. Please verify your connection and try again.
            </p>
          </div>
          <Button
            size="sm"
            onClick={loadDashboardData}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Loading
          </Button>
        </div>
      ) : isLoading ? (
        /* Loading Skeletons State */
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <TableSkeleton rows={5} />
              <CardSkeleton className="h-48" />
            </div>
            <div className="lg:col-span-4 space-y-6">
              <CardSkeleton className="h-64" />
              <CardSkeleton className="h-48" />
            </div>
          </div>
        </div>
      ) : (
        /* Full Data View */
        <div className="space-y-6">
          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((card) => (
              <MetricCard key={card.id} data={card} />
            ))}
          </div>

          {/* Flexible Full-Width Main Dashboard Layout Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
            {/* Left Column (8 cols on desktop) */}
            <div className="lg:col-span-8 space-y-6 min-w-0">
              {/* Recent Patients Table */}
              <RecentPatientsTable
                patients={filteredPatients}
                onAddPatient={() => setIsAddPatientOpen(true)}
              />

              {/* Consultation Trend Bar Chart */}
              <ConsultationTrendChart data={trendData} />
            </div>

            {/* Right Column (4 cols on desktop) */}
            <div className="lg:col-span-4 space-y-6 min-w-0">
              {/* Upcoming Medication Reminders */}
              <UpcomingRemindersCard
                reminders={reminders}
                onAddReminder={() => setIsAddPatientOpen(true)}
              />

              {/* Reports Overview Donut Chart */}
              <ReportsOverviewChart data={reportsOverview} />

              {/* Recent Activity Audit Feed */}
              <RecentActivityFeed activities={activities} />
            </div>
          </div>

          {/* Dev Test Data Controls Footer */}
          <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between text-xs text-navy-500">
            <div className="flex items-center space-x-2">
              <Database className="w-4 h-4 text-brand-600" />
              <span className="font-semibold text-navy-700">Database Test State:</span>
              <span>{patients.length} patient records loaded</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleTestClearDB}
                className="px-2.5 py-1 rounded bg-slate-100 hover:bg-red-50 text-navy-600 hover:text-red-600 border border-slate-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                title="Simulate an empty database state to verify zero counts and clean empty states"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Test Empty DB</span>
              </button>
              <button
                onClick={handleTestSeedDB}
                className="px-2.5 py-1 rounded bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 text-xs font-medium inline-flex items-center gap-1 transition-colors"
                title="Populate database with sample clinical records"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reset Demo Data</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Patient Intake Modal */}
      <AddPatientModal
        isOpen={isAddPatientOpen}
        onClose={() => setIsAddPatientOpen(false)}
        onPatientAdded={handlePatientAdded}
      />

      {/* QR Scanner Camera Modal */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        currentDoctorId={doctor?.id || 'doc-001'}
      />
    </AppShell>
  );
};
