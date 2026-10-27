import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from '../../components/common/BrandLogo';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Lock, Mail, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [username, setUsername] = useState('dr.priya@caseflowai.med');
  const [password, setPassword] = useState('password123');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      showToast('Login Failed', 'Please enter your username and password.', 'error');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      showToast('Welcome back', 'Logged in as Dr. Priya Sharma', 'success');
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background soft glow decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-brand-100/40 via-brand-50/20 to-transparent pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo size="lg" showTagline={true} className="justify-center mb-6" />
        <h2 className="text-2xl font-bold tracking-tight text-navy-900">
          Welcome back
        </h2>
        <p className="mt-1 text-sm text-navy-600">
          Sign in to your clinical workspace
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-card rounded-2xl border border-slate-200/80 sm:px-10">
          <form className="space-y-5" onSubmit={handleLogin}>
            <FormField label="Username / Email" required>
              <Input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="dr.priya@caseflowai.med"
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
              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Reset link sent to registered clinical email.'); }} className="font-medium text-brand-600 hover:text-brand-700 hover:underline">
                Forgot password?
              </a>
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

          {/* Admin Notice Requirement */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-amber-50/70 border-amber-100 rounded-xl p-3.5 flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-900 leading-relaxed">
              Your account must be verified and approved by an administrator before access.
            </p>
          </div>

          {/* Hackathon Demo Credentials Helper */}
          <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-200/60 text-center">
            <p className="text-[11px] font-semibold text-navy-700">Hackathon Phase 1 Demo Credentials</p>
            <p className="text-[10px] text-navy-500 font-mono mt-0.5">
              Email: dr.priya@caseflowai.med • Pass: password123
            </p>
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
