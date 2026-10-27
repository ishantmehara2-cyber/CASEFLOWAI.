import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DoctorRegistrationRecord } from '../../types';
import { getDoctorApplicationById, approveDoctorApplication, rejectDoctorApplication } from '../../services/adminService';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { FormField } from '../../components/ui/FormField';
import { Textarea } from '../../components/ui/Textarea';
import { PageLoader } from '../../components/ui/PageLoader';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  ArrowLeft,
  ShieldCheck,
  User,
  Building,
  FileText,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Download,
  AlertTriangle,
  Clock,
  Shield,
  FileCheck2,
} from 'lucide-react';

export const DoctorApplicationPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { session } = useAuth();

  const [application, setApplication] = useState<DoctorRegistrationRecord | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  const loadApplication = useCallback(async () => {
    if (!doctorId) return;
    setIsLoading(true);
    try {
      const doc = await getDoctorApplicationById(doctorId);
      setApplication(doc);
    } catch (e) {
      console.error('Failed to load doctor application:', e);
    } finally {
      setIsLoading(false);
    }
  }, [doctorId]);

  useEffect(() => {
    loadApplication();
  }, [loadApplication]);

  const handleApprove = async () => {
    if (!application) return;
    setIsActionLoading(true);
    try {
      await approveDoctorApplication(application.id, session?.userId || 'admin-001', session?.name || 'System Admin');
      setIsActionLoading(false);
      setIsApproveModalOpen(false);
      showToast('Doctor Verified & Approved', `Dr. ${application.firstName} ${application.lastName} can now sign in to CaseFlowAI.`, 'success');
      loadApplication();
    } catch (err: any) {
      setIsActionLoading(false);
      showToast('Approval Error', err.message || 'Failed to approve application.', 'error');
    }
  };

  const handleReject = async () => {
    if (!application) return;
    if (!rejectionReason.trim()) {
      showToast('Validation Error', 'Please enter a rejection reason.', 'error');
      return;
    }

    setIsActionLoading(true);
    try {
      await rejectDoctorApplication(
        application.id,
        rejectionReason,
        session?.userId || 'admin-001',
        session?.name || 'System Admin'
      );
      setIsActionLoading(false);
      setIsRejectModalOpen(false);
      showToast('Application Rejected', `Registration for Dr. ${application.firstName} ${application.lastName} declined.`, 'warning');
      loadApplication();
    } catch (err: any) {
      setIsActionLoading(false);
      showToast('Rejection Error', err.message || 'Failed to reject application.', 'error');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <PageLoader message="Loading verification file..." />
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-8">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-3" />
        <h2 className="text-lg font-bold text-navy-900">Application File Not Found</h2>
        <p className="text-xs text-navy-500 mt-1 mb-4">No doctor registration record matches the provided identifier.</p>
        <Button onClick={() => navigate('/admin/dashboard')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
          Back to Verification Console
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Header Bar */}
      <header className="bg-navy-950 text-white sticky top-0 z-30 border-b border-navy-800 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/admin/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="border-navy-700 text-navy-200 hover:bg-navy-900 hover:text-white"
          >
            Back to Console
          </Button>

          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-brand-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-navy-200">
              Doctor Inspection File #{application.applicationId}
            </span>
          </div>
        </div>
      </header>

      {/* Main Verification Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Title & Status Summary Banner */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-navy-900">
                Dr. {application.firstName} {application.lastName}
              </h1>
              <StatusBadge status={application.approvalStatus as any} size="md" />
            </div>
            <p className="text-xs text-navy-500 mt-1">
              Application ID: <span className="font-mono font-bold">{application.applicationId}</span> • Submitted on{' '}
              {new Date(application.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>

          {/* Action Approval Controls */}
          <div className="flex items-center space-x-3">
            {application.approvalStatus === 'PENDING' && (
              <>
                <Button
                  variant="danger"
                  size="md"
                  onClick={() => setIsRejectModalOpen(true)}
                  leftIcon={<XCircle className="w-4 h-4" />}
                >
                  Reject Application
                </Button>
                <Button
                  variant="success"
                  size="md"
                  onClick={() => setIsApproveModalOpen(true)}
                  leftIcon={<CheckCircle2 className="w-4 h-4" />}
                >
                  Verify & Approve Doctor
                </Button>
              </>
            )}

            {application.approvalStatus === 'APPROVED' && (
              <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Verified Account (Approved by {application.approvedBy || 'Admin'})</span>
              </div>
            )}

            {application.approvalStatus === 'REJECTED' && (
              <div className="bg-red-50 text-red-800 border border-red-200 px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-2">
                <XCircle className="w-4 h-4 text-red-600" />
                <span>Rejected Application</span>
              </div>
            )}
          </div>
        </div>

        {/* Application Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 font-bold text-navy-900 text-sm">
              <User className="w-4 h-4 text-brand-600" />
              <span>Personal Information</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">First Name</p>
                <p className="font-bold text-navy-900 mt-0.5">{application.firstName}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Last Name</p>
                <p className="font-bold text-navy-900 mt-0.5">{application.lastName}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Date of Birth</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.dateOfBirth || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Gender</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.gender || 'Not specified'}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Email Address</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.email}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Phone Number</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.phone}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Requested Username</p>
                <p className="font-mono font-bold text-brand-700 mt-0.5">{application.username}</p>
              </div>
            </div>
          </div>

          {/* Professional Credentials */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 font-bold text-navy-900 text-sm">
              <Building className="w-4 h-4 text-brand-600" />
              <span>Professional Credentials</span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Medical Reg. Number</p>
                <p className="font-mono font-bold text-navy-900 mt-0.5">{application.medicalRegistrationNumber}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Specialization</p>
                <p className="font-bold text-navy-900 mt-0.5">{application.specialization}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Qualification</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.qualification}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Years of Experience</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.yearsOfExperience} years</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Medical Council</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.medicalCouncil || 'State Council'}</p>
              </div>
              <div>
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Clinic / Hospital</p>
                <p className="font-bold text-navy-900 mt-0.5">{application.clinicName}</p>
              </div>
              <div className="col-span-2">
                <p className="text-navy-400 font-semibold uppercase text-[10px]">Clinic Address</p>
                <p className="font-medium text-navy-800 mt-0.5">{application.clinicAddress || 'Not provided'}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Uploaded Verification Documents */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-subtle p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2 font-bold text-navy-900 text-sm">
              <FileCheck2 className="w-4 h-4 text-brand-600" />
              <span>Uploaded Verification Documents ({application.documents?.length || 0})</span>
            </div>
            <span className="text-[11px] text-navy-400">Inspect council certificate before approving</span>
          </div>

          {!application.documents || application.documents.length === 0 ? (
            <p className="text-xs text-navy-400 py-3">No verification documents attached to this application.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {application.documents.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-slate-50 p-4 rounded-xl border border-slate-200 hover:border-brand-300 transition-colors flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start space-x-3">
                    <div className="p-2.5 rounded-lg bg-brand-50 text-brand-600 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-navy-900 truncate">{doc.fileName}</p>
                      <p className="text-[10px] uppercase font-semibold text-navy-400 mt-0.5">
                        {doc.documentType.replace('_', ' ')}
                      </p>
                      <span className="inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-white border border-slate-200 text-navy-600">
                        {(doc.fileSize / 1024).toFixed(1)} KB • {doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <a
                      href={doc.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-xs font-bold text-brand-600 hover:text-brand-800 gap-1"
                    >
                      <span>Preview File</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Verify & Approve Confirmation Modal */}
      <Modal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        title="Approve Doctor Application?"
        subtitle="Authorize clinical workspace access for CaseFlowAI"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsApproveModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              size="sm"
              onClick={handleApprove}
              isLoading={isActionLoading}
              leftIcon={<ShieldCheck className="w-4 h-4" />}
            >
              Confirm Approval
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-navy-700">
          <p className="leading-relaxed">
            Once approved, <span className="font-bold text-navy-900">Dr. {application.firstName} {application.lastName}</span> will be able to access the CaseFlowAI clinical workspace using the credentials created during registration (<span className="font-mono text-brand-700">{application.username}</span>).
          </p>
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-emerald-900 space-y-1">
            <p className="font-bold">Summary of Approval Action:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[11px]">
              <li>Status set to APPROVED</li>
              <li>Medical Council credentials verified</li>
              <li>Clinical dashboard access enabled</li>
              <li>Audit log entry recorded</li>
            </ul>
          </div>
        </div>
      </Modal>

      {/* Reject Application Confirmation Modal */}
      <Modal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        title="Reject Application?"
        subtitle="Provide a mandatory reason for declining this doctor registration"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRejectModalOpen(false)}
              disabled={isActionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleReject}
              isLoading={isActionLoading}
              leftIcon={<XCircle className="w-4 h-4" />}
            >
              Reject Doctor
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-xs text-navy-700 leading-relaxed">
            Please enter a clear reason for declining the registration of <span className="font-bold text-navy-900">Dr. {application.firstName} {application.lastName}</span>. This reason will be displayed to the applicant when checking their application status.
          </p>

          <FormField label="Rejection Reason" required>
            <Textarea
              placeholder="e.g. Medical registration certificate expired or unreadable. Please upload a clear valid MCI certificate."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="text-xs"
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
};
