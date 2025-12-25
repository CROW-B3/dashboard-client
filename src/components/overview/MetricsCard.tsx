'use client';

import { GlassPanel, StatusBadge } from '@b3-crow/ui-kit';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  label: string;
  value: string | number;
  change: string;
  changeVariant: 'positive' | 'negative' | 'neutral';
  chartData?: number[]; // Array of percentages for mini chart
}

export function MetricsCard({
  label,
  value,
  change,
  changeVariant,
  chartData = [20, 40, 30, 60, 80],
}: MetricsCardProps) {
  return (
    <GlassPanel className="p-5 h-full flex flex-col justify-between group hover:border-violet-500/20">
      {/* Header with label and badge */}
      <div className="flex justify-between items-start mb-4">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {label}
        </span>
        <StatusBadge
          variant={changeVariant === 'positive' ? 'positive' : changeVariant === 'negative' ? 'negative' : 'neutral'}
          className={cn(
            'text-[10px]',
            changeVariant === 'positive' && 'px-1.5 py-0.5',
            changeVariant === 'negative' && 'px-1.5 py-0.5',
            changeVariant === 'neutral' && 'px-1.5 py-0.5'
          )}
        >
          {change}
        </StatusBadge>
      </div>

      {/* Main value and chart */}
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-white">{value}</span>

        {/* Mini bar chart */}
        <div className="h-6 w-20 flex items-end gap-0.5 opacity-50">
          {chartData.map((percentage, index) => (
            <div
              key={index}
              className={cn(
                'w-full rounded-t-sm transition-all',
                index === chartData.length - 1
                  ? 'bg-violet-500 shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                  : 'bg-gray-700'
              )}
              style={{ height: `${percentage}%` }}
            ></div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
