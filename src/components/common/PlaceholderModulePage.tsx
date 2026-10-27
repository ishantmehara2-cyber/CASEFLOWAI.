import React from 'react';
import { AppShell } from '../layout/AppShell';
import { Button } from '../ui/Button';
import { ArrowLeft, Sparkles, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PlaceholderModulePageProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  phaseNumber: number;
  upcomingFeatures: string[];
}

export const PlaceholderModulePage: React.FC<PlaceholderModulePageProps> = ({
  title,
  subtitle,
  icon,
  phaseNumber,
  upcomingFeatures,
}) => {
  const navigate = useNavigate();

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Module Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600 border border-brand-100">
              {icon}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-navy-900">{title}</h1>
              <p className="text-xs text-navy-500">{subtitle}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/dashboard')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Phase Status Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-card p-8 text-center max-w-2xl mx-auto my-8 space-y-5">
          <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100 shadow-subtle">
            <Clock className="w-7 h-7" />
          </div>

          <div>
            <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-200 inline-flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" /> Scheduled for Phase {phaseNumber}
            </span>
            <h2 className="text-xl font-bold text-navy-900 mt-3">
              {title} Module Foundation Ready
            </h2>
            <p className="text-xs text-navy-600 mt-1 max-w-md mx-auto">
              This module's UI layout and architecture are structured in Phase 1. Backend integration, AI logic, and workflow pipelines will connect in upcoming hackathon phases.
            </p>
          </div>

          {/* Planned Specs */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-left text-xs space-y-2">
            <p className="font-bold text-navy-800 uppercase tracking-wider text-[11px]">
              Planned Capabilities in Phase {phaseNumber}:
            </p>
            <ul className="space-y-1.5 text-navy-700">
              {upcomingFeatures.map((feat, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="pt-2 flex justify-center space-x-3">
            <Button size="sm" onClick={() => navigate('/dashboard')}>
              Explore Dashboard
            </Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
};
