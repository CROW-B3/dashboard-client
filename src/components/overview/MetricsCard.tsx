'use client';

import type { MetricsCardProps } from './types';

export type { MetricsCardProps };

const changeColors = {
  positive: { bg: 'rgba(16, 185, 129, 0.10)', text: '#34D399' },
  negative: { bg: 'rgba(244, 63, 94, 0.10)', text: '#FB7185' },
  neutral: { bg: 'rgba(107, 114, 128, 0.10)', text: '#9CA3AF' },
  info: { bg: 'rgba(139, 92, 246, 0.10)', text: '#C4B5FD' },
};

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
  const colors = changeColors[changeType];
  const barColor = chartColors[chartColor];

  return (
    <div
      className="h-[109px] relative overflow-hidden rounded-xl flex-1 min-w-0"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        outline: '1px solid rgba(255, 255, 255, 0.06)',
        outlineOffset: '-1px',
        backdropFilter: 'blur(2px)'
      }}
    >
      {/* Title: #9CA3AF, 12px, 600, uppercase, line-height 16, letter-spacing 0.6 */}
      <div
        className="absolute left-[21px] top-[21px]"
        style={{ color: '#9CA3AF', fontSize: 12, fontWeight: 600, textTransform: 'uppercase', lineHeight: '16px', letterSpacing: 0.6 }}
      >
        {title}
      </div>

      {/* Change badge */}
      <div
        className="absolute right-[21px] top-[21px] h-[19px] px-1.5 rounded-lg flex items-center justify-center"
        style={{ background: colors.bg }}
      >
        {/* Change: 10px, 500, line-height 15 */}
        <span style={{ color: colors.text, fontSize: 10, fontWeight: 500, lineHeight: '15px' }}>
          {change}
        </span>
      </div>

      {/* Value: white, 24px, 700, line-height 32 */}
      <div
        className="absolute left-[21px] top-[56px]"
        style={{ color: 'white', fontSize: 24, fontWeight: 700, lineHeight: '32px' }}
      >
        {value}
      </div>

      {/* Mini bar chart - 5 bars, 14.41px wide each, positioned at right */}
      <div className="absolute right-[21px] bottom-[21px] flex items-end gap-[2px]">
        {chartData.map((val, index) => {
          const isLast = index === chartData.length - 1;
          const height = Math.max((val / maxValue) * 19.19, 2.39);

          return (
            <div
              key={`bar-${index}-${val}`}
              className="w-[14.41px] rounded-t-sm"
              style={{
                height: `${height}px`,
                opacity: 0.5,
                background: isLast ? barColor.bg : '#374151',
                boxShadow: isLast ? barColor.shadow : 'none',
                borderTopLeftRadius: 2,
                borderTopRightRadius: 2,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
