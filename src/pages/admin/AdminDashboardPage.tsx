import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { EmptyState } from '../../components/ui/EmptyState';
import { CardSkeleton } from '../../components/ui/CardSkeleton';
import { TableSkeleton } from '../../components/ui/TableSkeleton';

import { getAdminMetrics, getAllDoctorApplications } from '../../services/adminService';
import { getAuditLogs } from '../../services/auditService';
import { DoctorRegistrationRecord, AdminMetrics, AuditLog } from '../../types';
import { useAuth } from '../../context/AuthContext';
import {
  ShieldCheck,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Eye,
  LogOut,
  RefreshCw,
  Search,
  Activity,
  ChevronRight,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { logout, session } = useAuth();

  const [metrics, setMetrics] = useState<AdminMetrics>({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    totalDoctorsCount: 0,
  });

  const [applications, setApplications] = useState<DoctorRegistrationRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [searchTerm, setSearchTerm] = useState('');

  const loadAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [m, apps, logs] = await Promise.all([
        getAdminMetrics(),
        getAllDoctorApplications(),
        getAuditLogs(),
      ]);
      setMetrics(m);
      setApplications(apps);
      setAuditLogs(logs);
    } catch (e) {
      console.error('Failed to load admin data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

  const filteredApps = applications.filter((app) => {
    const matchesStatus = statusFilter === 'ALL' || app.approvalStatus === statusFilter;
    const fullName = `${app.firstName} ${app.lastName}`.toLowerCase();
    const matchesSearch =
      fullName.includes(searchTerm.toLowerCase()) ||
      app.applicationId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.medicalRegistrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Admin Top Header Bar */}
      <header className="bg-navy-950 text-white sticky top-0 z-30 border-b border-navy-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <BrandLogo size="md" showTagline={false} />
            <span className="hidden sm:inline-block px-2.5 py-0.5 rounded bg-brand-900/80 text-brand-300 border border-brand-700 text-xs font-bold uppercase tracking-wider">
              Verification Console
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-white">{session?.name || 'Administrator'}</p>
              <p className="text-[10px] text-navy-400">Master Admin Role</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                logout();
                navigate('/admin/login');
              }}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
              className="border-navy-700 text-navy-200 hover:bg-navy-900 hover:text-white"
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Admin Portal Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-2xl font-bold text-navy-900 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-brand-600" />
              Doctor Verification Portal
            </h1>
            <p className="text-xs text-navy-600 mt-0.5">
              Inspect medical registrations, review council credentials, and authorize clinical workspace accounts
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={loadAdminData}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>

        {/* Admin KPI Metrics Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div
              onClick={() => setStatusFilter('PENDING')}
              className={`bg-white p-5 rounded-xl border shadow-subtle cursor-pointer transition-all ${
                statusFilter === 'PENDING' ? 'ring-2 ring-amber-500 border-amber-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">Pending Review</p>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mt-2">{metrics.pendingCount}</h3>
              <p className="text-xs text-navy-500 mt-1">Applications awaiting review</p>
            </div>

            <div
              onClick={() => setStatusFilter('APPROVED')}
              className={`bg-white p-5 rounded-xl border shadow-subtle cursor-pointer transition-all ${
                statusFilter === 'APPROVED' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Approved Doctors</p>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mt-2">{metrics.approvedCount}</h3>
              <p className="text-xs text-navy-500 mt-1">Verified clinical doctors</p>
            </div>

            <div
              onClick={() => setStatusFilter('REJECTED')}
              className={`bg-white p-5 rounded-xl border shadow-subtle cursor-pointer transition-all ${
                statusFilter === 'REJECTED' ? 'ring-2 ring-red-500 border-red-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-red-700 uppercase tracking-wider">Rejected</p>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg border border-red-100">
                  <XCircle className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mt-2">{metrics.rejectedCount}</h3>
              <p className="text-xs text-navy-500 mt-1">Declined registrations</p>
            </div>

            <div
              onClick={() => setStatusFilter('ALL')}
              className={`bg-white p-5 rounded-xl border shadow-subtle cursor-pointer transition-all ${
                statusFilter === 'ALL' ? 'ring-2 ring-brand-500 border-brand-300' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-brand-700 uppercase tracking-wider">Total Applications</p>
                <div className="p-2 bg-brand-50 text-brand-600 rounded-lg border border-brand-100">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-navy-900 mt-2">{metrics.totalDoctorsCount}</h3>
              <p className="text-xs text-navy-500 mt-1">All registrations in system</p>
            </div>
          </div>
        )}

        {/* Doctor Applications Queue Section */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-navy-900">
                Doctor Verification Applications ({filteredApps.length})
              </h3>
              <p className="text-xs text-navy-500 mt-0.5">Filter by verification status and search doctor details</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              {/* Search */}
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search doctor, ID, or spec..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs text-navy-900 rounded-lg pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
                <Search className="w-3.5 h-3.5 text-navy-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Status Filter Buttons */}
              <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs font-medium">
                {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1 rounded-md transition-colors ${
                      statusFilter === st ? 'bg-white text-navy-900 font-bold shadow-subtle' : 'text-navy-600 hover:text-navy-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Applications Table */}
          {isLoading ? (
            <div className="p-4">
              <TableSkeleton rows={4} />
            </div>
          ) : filteredApps.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<ShieldCheck className="w-10 h-10 text-navy-300" />}
                title="No applications match criteria"
                description={`No doctor registrations found under status '${statusFilter}'.`}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50/80 text-navy-500 font-semibold text-xs border-b border-slate-100 uppercase tracking-wider">
                    <th className="py-3 px-5">Doctor Name</th>
                    <th className="py-3 px-4">Specialization</th>
                    <th className="py-3 px-4">Registration No.</th>
                    <th className="py-3 px-4">Submitted Date</th>
                    <th className="py-3 px-4 text-center">Docs</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-navy-800">
                  {filteredApps.map((app) => (
                    <tr
                      key={app.id}
                      className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/admin/doctors/${app.id}`)}
                    >
                      <td className="py-3.5 px-5 font-bold text-navy-900 group-hover:text-brand-600">
                        Dr. {app.firstName} {app.lastName}
                        <span className="block text-[11px] font-normal text-navy-400 font-mono">
                          {app.applicationId}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-navy-700 font-medium">{app.specialization}</td>
                      <td className="py-3.5 px-4 font-mono text-xs font-semibold text-navy-600">
                        {app.medicalRegistrationNumber}
                      </td>
                      <td className="py-3.5 px-4 text-xs text-navy-600">
                        {new Date(app.createdAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-navy-700 border border-slate-200">
                          <FileText className="w-3 h-3 mr-1 text-navy-400" />
                          {app.documents?.length || 0}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={app.approvalStatus as any} size="sm" />
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <Button
                          size="sm"
                          variant={app.approvalStatus === 'PENDING' ? 'primary' : 'outline'}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/doctors/${app.id}`);
                          }}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          {app.approvalStatus === 'PENDING' ? 'Review & Approve' : 'View Details'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Audit Log Feed */}
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-brand-600" />
              <h3 className="text-sm font-bold text-navy-900">System Verification Audit Log</h3>
            </div>
            <span className="text-[10px] text-navy-400 font-medium">Traceable verification records</span>
          </div>

          <div className="mt-3 space-y-2 max-h-48 overflow-y-auto">
            {auditLogs.length === 0 ? (
              <p className="text-xs text-navy-400 py-2">No audit events logged yet.</p>
            ) : (
              auditLogs.slice(0, 8).map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs py-1.5 border-b border-slate-50 last:border-0">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500" />
                    <span className="font-bold text-navy-900">{log.action}</span>
                    <span className="text-navy-500">•</span>
                    <span className="text-navy-600">{log.actorName}</span>
                  </div>
                  <span className="text-[10px] text-navy-400 font-mono">
                    {new Date(log.createdAt).toLocaleTimeString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
