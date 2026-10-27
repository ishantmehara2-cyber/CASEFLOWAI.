import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { ConsultationsPage } from '../pages/consultations/ConsultationsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { PrescriptionsPage } from '../pages/prescriptions/PrescriptionsPage';
import { RemindersPage } from '../pages/reminders/RemindersPage';
import { BrandingPage } from '../pages/branding/BrandingPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';
import { AdminPage } from '../pages/admin/AdminPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/patients" element={<PatientsPage />} />
      <Route path="/consultations" element={<ConsultationsPage />} />
      <Route path="/reports" element={<ReportsPage />} />
      <Route path="/prescriptions" element={<PrescriptionsPage />} />
      <Route path="/reminders" element={<RemindersPage />} />
      <Route path="/branding" element={<BrandingPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
