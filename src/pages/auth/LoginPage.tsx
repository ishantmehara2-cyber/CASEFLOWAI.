import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, Mail, Clock, XCircle, ArrowRight, ShieldCheck, Sparkles, UserPlus, FileSearch } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { loginUser } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setSession } = useAuth();

  const [username, setUsername] = useState('dr.priya@caseflowai.med');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  // Status feedback banners if pending or rejected
  const [pendingNotice, setPendingNotice] = useState<{ doctorName: string; appId?: string } | null>(null);
  const [rejectedNotice, setRejectedNotice] = useState<{ doctorName: string; reason?: string } | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingNotice(null);
    setRejectedNotice(null);

    if (!username.trim() || !password.trim()) {
      showToast('Validation Error', 'Please enter your username/email and password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const result = await loginUser(username, password);
      setIsLoading(false);

      if (result.status === 'PENDING') {
        setPendingNotice({
          doctorName: result.doctorName || 'Doctor',
          appId: result.applicationId,
        });
        showToast('Account Under Review', 'Your registration is awaiting administrator verification.', 'warning');
        return;
      }

      if (result.status === 'REJECTED') {
        setRejectedNotice({
          doctorName: result.doctorName || 'Doctor',
          reason: result.rejectionReason,
        });
        showToast('Registration Not Approved', 'Your application was rejected by an administrator.', 'error');
        return;
      }

      if (result.status === 'APPROVED' && result.session) {
        setSession(result.session);
        showToast('Welcome Back', `Logged in as ${result.doctorName}`, 'success');
        navigate('/dashboard');
      }
    } catch (err: any) {
      setIsLoading(false);
      showToast('Authentication Error', err.message || 'Invalid login credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" showTagline={true} className="justify-center mb-6" />
        <h2 className="text-2xl font-extrabold tracking-tight text-navy-900">
          Doctor Workspace Sign In
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-navy-600">
          Access your verified CaseFlowAI clinical dashboard
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10 space-y-5">
          {/* Pending Verification Notice */}
          {pendingNotice && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 animate-fade-in">
              <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Account Awaiting Administrator Verification</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Welcome {pendingNotice.doctorName}. Your credentials are correct, but your registration is currently under review by an administrator before clinical access is granted.
              </p>
              <Link
                to={`/registration-status?appId=${pendingNotice.appId || ''}`}
                className="inline-flex items-center text-xs font-bold text-amber-900 underline pt-1"
              >
                <span>Check Application Status ({pendingNotice.appId})</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          )}

          {/* Rejected Account Notice */}
          {rejectedNotice && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-2 animate-fade-in">
              <div className="flex items-center space-x-2 text-red-900 font-bold text-xs">
                <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>Registration Not Approved</span>
              </div>
              <p className="text-xs text-red-800 leading-relaxed">
                Your CaseFlowAI registration was not approved.
              </p>
              {rejectedNotice.reason && (
                <div className="bg-white p-2 rounded border border-red-200 text-xs font-mono text-red-900">
                  Reason: {rejectedNotice.reason}
                </div>
              )}
              <a
                href="mailto:support@caseflowai.med"
                className="inline-block text-xs font-bold text-red-900 underline pt-1"
              >
                Contact Support for Appeal
              </a>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-4" onSubmit={handleLogin}>
            <FormField label="Username / Clinical Email" required>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dr.priya@caseflowai.med or username"
                leftIcon={<Mail className="w-4 h-4 text-navy-400" />}
              />
            </FormField>

            <FormField label="Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-navy-400" />}
              />
            </FormField>

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center space-x-2 text-navy-600 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-slate-300 text-brand-600 focus:ring-brand-500" />
                <span>Remember workspace</span>
              </label>
              <Link to="/registration-status" className="font-medium text-brand-600 hover:underline">
                Check status?
              </Link>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In to Dashboard
            </Button>
          </form>

          {/* New Doctor Registration & Admin Portal Links */}
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2.5 text-center text-xs">
            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-lg border border-brand-200 transition-colors gap-2"
            >
              <UserPlus className="w-4 h-4" />
              <span>Apply for New Doctor Registration</span>
            </Link>

            <div className="flex items-center justify-between px-1 text-[11px] text-navy-500 pt-1">
              <Link to="/registration-status" className="hover:text-navy-900 inline-flex items-center gap-1">
                <FileSearch className="w-3.5 h-3.5" /> Application Status
              </Link>
              <Link to="/admin/login" className="hover:text-brand-600 font-semibold inline-flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-brand-600" /> Admin Portal
              </Link>
            </div>
          </div>
        </div>

        {/* Footer Tagline */}
        <div className="mt-6 text-center text-xs text-navy-500 flex items-center justify-center space-x-1">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span className="font-semibold text-navy-700">AI STRUCTURES. DOCTOR DECIDES.</span>
        </div>
      </div>
    </div>
  );
};
