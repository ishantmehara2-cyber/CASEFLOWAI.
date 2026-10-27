import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { getRegistrationStatus } from '../../services/authService';
import { DoctorRegistrationRecord } from '../../types';
import { Search, Clock, CheckCircle2, XCircle, ArrowRight, ShieldCheck, Mail, HelpCircle } from 'lucide-react';

export const RegistrationStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const appIdFromUrl = searchParams.get('appId') || '';
  const [searchQuery, setSearchQuery] = useState(appIdFromUrl);
  const [record, setRecord] = useState<DoctorRegistrationRecord | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchStatus = async (query: string) => {
    if (!query.trim()) return;
    setIsLoading(true);
    setHasSearched(true);
    const result = await getRegistrationStatus(query);
    setRecord(result);
    setIsLoading(false);
  };

  useEffect(() => {
    if (appIdFromUrl) {
      fetchStatus(appIdFromUrl);
    }
  }, [appIdFromUrl]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStatus(searchQuery);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" showTagline={false} className="justify-center mb-6" />
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          Application Verification Status
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-navy-600">
          Check the approval state of your CaseFlowAI doctor registration
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        {/* Search Input Box */}
        <div className="bg-white p-6 shadow-card rounded-2xl border border-slate-200/80 mb-6">
          <form onSubmit={handleSearch} className="space-y-3">
            <FormField label="Enter Application ID or Registered Username/Email">
              <Input
                placeholder="e.g. CF-APP-1001 or dr.rahul@example.med"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-navy-400" />}
              />
            </FormField>
            <Button
              type="submit"
              size="md"
              className="w-full"
              isLoading={isLoading}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Lookup Application Status
            </Button>
          </form>
        </div>

        {/* Status Display Result Card */}
        {record ? (
          <div className="bg-white p-6 shadow-card rounded-2xl border border-slate-200/80 animate-fade-in space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <p className="text-[11px] font-semibold text-navy-400 uppercase tracking-wider">
                  Application ID
                </p>
                <p className="text-lg font-mono font-bold text-navy-900">{record.applicationId}</p>
              </div>
              <StatusBadge status={record.approvalStatus as any} size="md" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-navy-500">Applicant:</span>
                <span className="font-bold text-navy-900">Dr. {record.firstName} {record.lastName}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-navy-500">Specialization:</span>
                <span className="font-medium text-navy-800">{record.specialization}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                <span className="text-navy-500">Submitted Date:</span>
                <span className="font-medium text-navy-800">
                  {new Date(record.createdAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Status Dependent Advice Message */}
            {record.approvalStatus === 'PENDING' && (
              <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-4 flex items-start space-x-3">
                <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-amber-900 space-y-1">
                  <p className="font-bold">Under Review by Administrator</p>
                  <p className="leading-relaxed">
                    Your CaseFlowAI doctor registration has been received successfully. You can log in once an administrator verifies and approves your account.
                  </p>
                </div>
              </div>
            )}

            {record.approvalStatus === 'APPROVED' && (
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-xl p-4 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Account Verified & Approved!</p>
                  <p className="leading-relaxed">
                    Your account has been verified. You can now sign in using the username and password created during registration.
                  </p>
                </div>
              </div>
            )}

            {record.approvalStatus === 'REJECTED' && (
              <div className="bg-red-50 border border-red-200/80 rounded-xl p-4 flex items-start space-x-3">
                <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                <div className="text-xs text-red-900 space-y-1">
                  <p className="font-bold">Registration Not Approved</p>
                  <p className="leading-relaxed">
                    Your registration was not approved.
                  </p>
                  {record.rejectionReason && (
                    <p className="font-mono bg-white p-2 rounded border border-red-200 mt-1 text-[11px] text-red-800">
                      Reason: {record.rejectionReason}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              <Button
                size="md"
                className="w-full"
                onClick={() => navigate('/login')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Go to Sign In
              </Button>
            </div>
          </div>
        ) : hasSearched && !isLoading ? (
          <div className="bg-white p-6 shadow-card rounded-2xl border border-slate-200/80 text-center space-y-3">
            <HelpCircle className="w-10 h-10 text-navy-300 mx-auto" />
            <h3 className="text-sm font-bold text-navy-900">Application Record Not Found</h3>
            <p className="text-xs text-navy-500">
              No registration record matching <span className="font-mono text-navy-700 font-semibold">{searchQuery}</span> was found.
            </p>
            <Link to="/register" className="inline-block text-xs font-bold text-brand-600 hover:underline pt-2">
              Apply for new doctor registration →
            </Link>
          </div>
        ) : null}

        <div className="mt-6 text-center text-xs text-navy-500">
          <Link to="/login" className="font-semibold text-brand-600 hover:underline">
            ← Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
