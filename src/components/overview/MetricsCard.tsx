'use client';

import type { MetricsCardProps } from './types';

import { GlassPanel, StatusBadge } from '@b3-crow/ui-kit';

export type { MetricsCardProps };

const chartColors = {
  violet: { bg: '#8B5CF6', shadow: '0px 0px 8px rgba(124, 58, 237, 0.50)' },
  rose: { bg: '#F43F5E', shadow: '0px 0px 8px rgba(244, 63, 94, 0.50)' },
  gray: { bg: '#6B7280', shadow: 'none' },
};

const DEFAULT_CHART_DATA = [25, 50, 35, 70, 100] as const;

export function MetricsCard({
  title,
  value,
  change,
  changeType,
  chartData = DEFAULT_CHART_DATA,
  chartColor = 'violet',
}: MetricsCardProps) {
  const maxValue = Math.max(...chartData);
  const barColor = chartColors[chartColor];

  return (
    <GlassPanel variant="light" className="h-[109px] relative overflow-hidden flex-1 min-w-0">
      <div className="absolute left-[21px] top-[21px] text-xs font-semibold uppercase tracking-wider text-gray-400">
        {title}
      </div>

      <div className="absolute right-[21px] top-[21px]">
        <StatusBadge variant={changeType}>{change}</StatusBadge>
      </div>

      <div className="absolute left-[21px] top-[56px] text-2xl font-bold text-white">
        {value}
      </div>

      <div className="absolute right-[21px] bottom-[21px] flex items-end gap-[2px]">
        {chartData.map((val, index) => {
          const isLast = index === chartData.length - 1;
          const height = Math.max((val / maxValue) * 19.19, 2.39);

          return (
            <div
              key={`bar-${index}-${val}`}
              className="w-[14.41px] rounded-t-sm opacity-50"
              style={{
                height: `${height}px`,
                background: isLast ? barColor.bg : '#374151',
                boxShadow: isLast ? barColor.shadow : 'none',
              }}
            />
          );
        })}
      </div>
    </GlassPanel>
  );
}
