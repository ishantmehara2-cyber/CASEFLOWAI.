import React, { useState } from 'react';
import { ConsultationTrendPoint } from '../../types';
import { Select } from '../ui/Select';
import { BarChart3, TrendingUp, CalendarX } from 'lucide-react';

interface ConsultationTrendChartProps {
  data: ConsultationTrendPoint[];
  className?: string;
  onTimeframeChange?: (tf: string) => void;
}

export const ConsultationTrendChart: React.FC<ConsultationTrendChartProps> = ({
  data,
  className,
  onTimeframeChange,
}) => {
  const [timeframe, setTimeframe] = useState('7days');

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setTimeframe(val);
    if (onTimeframeChange) onTimeframeChange(val);
  };

  const totalConsultations = data.reduce((acc, d) => acc + d.count, 0);
  const maxCount = Math.max(...data.map((d) => d.count), 10);

  return (
    <div className={`bg-white rounded-xl border border-slate-200/80 shadow-subtle p-5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-lg bg-brand-50 text-brand-600 border border-brand-100">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-navy-900">Consultation Trend</h3>
            <p className="text-xs text-navy-500">Daily patient volume</p>
          </div>
        </div>

        <div className="w-36">
          <Select
            value={timeframe}
            onChange={handleSelectChange}
            options={[
              { label: 'Last 7 days', value: '7days' },
              { label: 'Last 14 days', value: '14days' },
              { label: 'Last 30 days', value: '30days' },
            ]}
            className="py-1.5 text-xs bg-slate-50"
          />
        </div>
      </div>

      {/* Chart Content or Empty State */}
      {totalConsultations === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center">
          <CalendarX className="w-10 h-10 text-navy-300 mb-2" />
          <p className="text-sm font-semibold text-navy-800">No consultation data available yet.</p>
          <p className="text-xs text-navy-500 mt-1">Consultation history will populate automatically as visits occur.</p>
        </div>
      ) : (
        <>
          <div className="mt-6 pt-2">
            <div className="flex items-end justify-between h-40 gap-2 sm:gap-4 px-2">
              {data.map((item, index) => {
                const heightPercent = Math.round((item.count / maxCount) * 100);
                const isLatest = index === data.length - 1;

                return (
                  <div
                    key={item.date}
                    className="flex-1 flex flex-col items-center group relative cursor-pointer"
                  >
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-navy-900 text-white text-[11px] font-semibold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                      {item.count} Consultations
                    </div>

                    {/* Count indicator above bar */}
                    <span className="text-[11px] font-bold text-navy-600 mb-1 group-hover:text-brand-600">
                      {item.count}
                    </span>

                    {/* Bar */}
                    <div className="w-full bg-slate-100 rounded-t-md h-32 flex items-end overflow-hidden">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full transition-all duration-300 rounded-t-md ${
                          isLatest
                            ? 'bg-gradient-to-t from-brand-700 to-brand-500 shadow-sm'
                            : 'bg-brand-500/80 group-hover:bg-brand-600'
                        }`}
                      />
                    </div>

                    {/* Label */}
                    <span className="text-xs font-medium text-navy-500 mt-2 truncate max-w-full">
                      {item.date}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-navy-500">
            <div className="flex items-center space-x-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-semibold text-navy-800">
                Average {(totalConsultations / data.length).toFixed(1)} patients/day
              </span>
            </div>
            <span>Total: {totalConsultations} Consultations</span>
          </div>
        </>
      )}
    </div>
  );
};
