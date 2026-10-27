import React from 'react';
import { NavLink } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import {
  LayoutDashboard,
  Users,
  Stethoscope,
  FileText,
  Pill,
  Bell,
  Sparkles,
  BarChart3,
  Settings,
  HelpCircle,
  ExternalLink,
  X,
  ShieldAlert,
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navItems: NavItem[] = [
    {
      label: 'Overview',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      label: 'Patient Management',
      path: '/patients',
      icon: <Users className="w-4 h-4" />,
    },
    {
      label: 'Consultations',
      path: '/consultations',
      icon: <Stethoscope className="w-4 h-4" />,
    },
    {
      label: 'Reports',
      path: '/reports',
      icon: <FileText className="w-4 h-4" />,
      badge: '7',
    },
    {
      label: 'Prescriptions',
      path: '/prescriptions',
      icon: <Pill className="w-4 h-4" />,
    },
    {
      label: 'Medication Reminders',
      path: '/reminders',
      icon: <Bell className="w-4 h-4" />,
    },
    {
      label: 'Clinic Branding',
      path: '/branding',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      label: 'Analytics',
      path: '/analytics',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      label: 'Settings',
      path: '/settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-navy-950/40 backdrop-blur-xs lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-full w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-250 ease-in-out lg:translate-x-0 shadow-subtle',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Top: Branding & Close Button */}
        <div>
          <div className="flex items-center justify-between h-16 px-5 border-b border-slate-100">
            <BrandLogo showTagline={false} size="md" />
            <button
              onClick={onClose}
              className="lg:hidden text-navy-400 hover:text-navy-700 p-1 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Items List */}
          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-260px)]">
            <p className="px-3 pt-2 pb-1 text-[11px] font-bold text-navy-400 uppercase tracking-wider">
              Clinical Workspace
            </p>
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => onClose()}
                className={({ isActive }) =>
                  cn(
                    'flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-brand-50 text-brand-700 font-semibold shadow-subtle border-l-4 border-brand-600 pl-2.5'
                      : 'text-navy-600 hover:text-navy-900 hover:bg-slate-50'
                  )
                }
              >
                <div className="flex items-center space-x-3">
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-700 border border-amber-200">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Bottom Section: Help & Tagline */}
        <div className="p-4 border-t border-slate-100 space-y-3 bg-slate-50/50">
          <div className="bg-brand-50/80 border border-brand-100 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center space-x-2 text-brand-800">
              <HelpCircle className="w-4 h-4 text-brand-600 shrink-0" />
              <span className="text-xs font-bold">Need help?</span>
            </div>
            <p className="text-[11px] text-navy-600 leading-relaxed">
              Watch guide or contact support for clinical assistance.
            </p>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                alert('Support portal: Contact support@caseflowai.med or call +91 1800-CLINIC');
              }}
              className="inline-flex items-center text-[11px] font-semibold text-brand-700 hover:text-brand-800 hover:underline gap-1 mt-1"
            >
              <span>Watch guide & support</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          <div className="px-1 py-0.5 text-center">
            <p className="text-[10px] text-navy-400 font-medium">CaseFlowAI v1.0 • Phase 1</p>
          </div>
        </div>
      </aside>
    </>
  );
};
