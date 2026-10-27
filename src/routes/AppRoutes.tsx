import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { DoctorRegisterPage } from '../pages/auth/DoctorRegisterPage';
import { RegistrationStatusPage } from '../pages/auth/RegistrationStatusPage';
import { AdminLoginPage } from '../pages/admin/AdminLoginPage';
import { AdminDashboardPage } from '../pages/admin/AdminDashboardPage';
import { DoctorApplicationPage } from '../pages/admin/DoctorApplicationPage';

import { DashboardPage } from '../pages/dashboard/DashboardPage';
import { PatientsPage } from '../pages/patients/PatientsPage';
import { PatientProfilePage } from '../pages/patients/PatientProfilePage';
import { ConsultationsPage } from '../pages/consultations/ConsultationsPage';
import { ReportsPage } from '../pages/reports/ReportsPage';
import { PrescriptionsPage } from '../pages/prescriptions/PrescriptionsPage';
import { RemindersPage } from '../pages/reminders/RemindersPage';
import { BrandingPage } from '../pages/branding/BrandingPage';
import { AnalyticsPage } from '../pages/analytics/AnalyticsPage';
import { SettingsPage } from '../pages/settings/SettingsPage';

import { ProtectedRoute } from './ProtectedRoute';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<DoctorRegisterPage />} />
      <Route path="/registration-status" element={<RegistrationStatusPage />} />
      <Route path="/admin/login" element={<AdminLoginPage />} />

      {/* Protected Admin Routes */}
      <Route element={<ProtectedRoute requiredRole="ADMIN" requireApproval={false} />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
        <Route path="/admin/doctors/:doctorId" element={<DoctorApplicationPage />} />
      </Route>

      {/* Protected Approved Doctor Clinical Workspace Routes */}
      <Route element={<ProtectedRoute requiredRole="DOCTOR" requireApproval={true} />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/patients" element={<PatientsPage />} />
        <Route path="/patients/:patientId" element={<PatientProfilePage />} />
        <Route path="/consultations" element={<ConsultationsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/prescriptions" element={<PrescriptionsPage />} />
        <Route path="/reminders" element={<RemindersPage />} />
        <Route path="/branding" element={<BrandingPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Wildcard Fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};
