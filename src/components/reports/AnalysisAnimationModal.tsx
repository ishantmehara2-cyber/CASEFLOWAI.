import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Sparkles, FileText, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisAnimationModalProps {
  isOpen: boolean;
  onComplete: () => void;
  reportName: string;
}

export const AnalysisAnimationModal: React.FC<AnalysisAnimationModalProps> = ({
  isOpen,
  onComplete,
  reportName,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);

  const steps = [
    'Analyzing report document structure...',
    'Reading clinical parameters & values...',
    'Structuring findings against reference ranges...',
    'Preparing CaseFlowAI clinical summary...',
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 400);
          return prev;
        }
      });
    }, 700);

    return () => clearInterval(interval);
  }, [isOpen, onComplete, steps.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-dropdown max-w-md w-full p-6 text-center space-y-6 animate-scale-in">
        {/* Top Icon */}
        <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mx-auto border border-brand-100 shadow-subtle relative">
          <Sparkles className="w-8 h-8 animate-pulse text-brand-600" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs shadow">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          </div>
        </div>

        <div>
          <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-[11px] font-bold border border-brand-100 inline-flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> CaseFlowAI Engine v1.0
          </span>
          <h3 className="text-lg font-bold text-navy-900 mt-2">Processing Medical Report</h3>
          <p className="text-xs text-navy-500 truncate max-w-xs mx-auto mt-0.5">{reportName}</p>
        </div>

        {/* Steps Progress List */}
        <div className="space-y-2.5 text-left bg-slate-50 p-4 rounded-xl border border-slate-200/60">
          {steps.map((stepText, idx) => {
            const isDone = idx < currentStep;
            const isCurrent = idx === currentStep;
            const isPending = idx > currentStep;

            return (
              <div key={idx} className="flex items-center space-x-3 text-xs">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-brand-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span
                  className={
                    isDone
                      ? 'text-navy-700 font-medium'
                      : isCurrent
                      ? 'text-navy-900 font-bold'
                      : 'text-navy-400'
                  }
                >
                  {stepText}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-navy-400 italic">
          AI structures. Doctor decides. Secure clinical review protocol.
        </p>
      </div>
    </div>
  );
};
