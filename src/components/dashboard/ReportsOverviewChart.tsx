import React from 'react';
import { ReportsOverviewData } from '../../types';
import { FileCheck2, ArrowUpRight, FileX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportsOverviewChartProps {
  data: ReportsOverviewData;
  className?: string;
}

export const ReportsOverviewChart: React.FC<ReportsOverviewChartProps> = ({
  data,
  className,
}) => {
  const navigate = useNavigate();

  const total = data.total;

  const categories = [
    { label: 'Normal', value: data.normal, color: 'bg-emerald-500', hex: '#10b981' },
    { label: 'Abnormal', value: data.abnormal, color: 'bg-red-500', hex: '#ef4444' },
    { label: 'Needs Review', value: data.needsReview, color: 'bg-amber-500', hex: '#f59e0b' },
    { label: 'Others', value: data.others, color: 'bg-slate-400', hex: '#94a3b8' },
  ];

  let accumulatedAngle = 0;

  const slices = categories.map((cat) => {
    const percentage = total > 0 ? cat.value / total : 0;
    const strokeDasharray = `${percentage * 283} 283`;
    const strokeDashoffset = -accumulatedAngle * 283;
    accumulatedAngle += percentage;

    return {
      ...cat,
      percentage: total > 0 ? Math.round(percentage * 100) : 0,
      strokeDasharray,
      strokeDashoffset,
    };
  });

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-purple-50 text-purple-600 border border-purple-100">
            <FileCheck2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">Reports Overview</h3>
            <p className="text-xs text-navy-500">Diagnostic status distribution</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/reports')}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline inline-flex items-center"
        >
          <span>All Reports</span>
          <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>

      {/* Donut Chart or Empty State */}
      {total === 0 ? (
        <div className="py-8 text-center flex flex-col items-center justify-center">
          <FileX className="w-10 h-10 text-navy-300 mb-2" />
          <p className="text-sm font-semibold text-navy-800">No medical reports uploaded yet.</p>
          <p className="text-xs text-navy-500 mt-1">Uploaded lab reports will appear here automatically.</p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-around gap-6">
          {/* Donut Graphic */}
          <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="transparent"
                stroke="#f1f5f9"
                strokeWidth="10"
              />
              {slices.map((slice) => (
                <circle
                  key={slice.label}
                  cx="50"
                  cy="50"
                  r="45"
                  fill="transparent"
                  stroke={slice.hex}
                  strokeWidth="10"
                  strokeDasharray={slice.strokeDasharray}
                  strokeDashoffset={slice.strokeDashoffset}
                  className="transition-all duration-500 ease-in-out hover:opacity-80 cursor-pointer"
                />
              ))}
            </svg>

            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-bold text-navy-900 leading-none">{data.total}</span>
              <span className="text-[10px] font-semibold text-navy-500 uppercase tracking-wider mt-1">
                Total Reports
              </span>
            </div>
          </div>

          {/* Categories Legend */}
          <div className="w-full sm:w-auto flex-1 space-y-2.5">
            {slices.map((slice) => (
              <div key={slice.label} className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${slice.color}`} />
                  <span className="font-medium text-navy-700">{slice.label}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-navy-900">{slice.value}</span>
                  <span className="text-navy-400 text-[11px]">({slice.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
