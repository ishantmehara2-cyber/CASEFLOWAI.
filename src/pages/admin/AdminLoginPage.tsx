import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { ShieldCheck, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';
import { useToast } from '../../context/ToastContext';
import { loginAdmin } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { setSession } = useAuth();

  const [username, setUsername] = useState('admin@caseflowai.med');
  const [password, setPassword] = useState('AdminPass123!');
  const [isLoading, setIsLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      showToast('Validation Error', 'Please enter admin username and password.', 'error');
      return;
    }

    setIsLoading(true);

    try {
      const session = await loginAdmin(username, password);
      setIsLoading(false);
      setSession(session);
      showToast('Admin Authenticated', 'Welcome to CaseFlowAI Verification Portal', 'success');
      navigate('/admin/dashboard');
    } catch (err: any) {
      setIsLoading(false);
      showToast('Admin Access Denied', err.message || 'Invalid administrator credentials.', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-white relative">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" showTagline={false} className="justify-center mb-6" />
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-brand-900/80 text-brand-300 border border-brand-700/60 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
          <ShieldCheck className="w-4 h-4 text-brand-400" />
          <span>Administrative Verification Portal</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white">
          Administrator Sign In
        </h2>
        <p className="mt-1 text-xs text-navy-300">
          CaseFlowAI License Verification & Approval Console
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-navy-900 py-8 px-6 shadow-2xl rounded-2xl border border-navy-800 sm:px-10 space-y-5">
          <form className="space-y-4" onSubmit={handleAdminLogin}>
            <FormField label="Admin Username / Email" required>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin@caseflowai.med"
                leftIcon={<Mail className="w-4 h-4 text-navy-400" />}
                className="bg-navy-950 text-white border-navy-800 placeholder:text-navy-500 focus:border-brand-500"
              />
            </FormField>

            <FormField label="Admin Password" required>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-navy-400" />}
                className="bg-navy-950 text-white border-navy-800 focus:border-brand-500"
              />
            </FormField>

            <Button
              type="submit"
              size="lg"
              className="w-full bg-brand-600 hover:bg-brand-500 text-white shadow-md mt-2"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Access Admin Verification Console
            </Button>
          </form>

          {/* Seed Credentials Box */}
          <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 text-center text-xs">
            <p className="text-[11px] font-semibold text-brand-400">Default Admin Credentials</p>
            <p className="text-[10px] text-navy-300 font-mono mt-0.5">
              Username: admin@caseflowai.med • Password: AdminPass123!
            </p>
          </div>

          <div className="pt-2 text-center text-xs">
            <Link to="/login" className="text-navy-400 hover:text-white transition-colors">
              ← Return to Doctor Workspace Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
