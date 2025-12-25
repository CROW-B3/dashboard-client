'use client';

import { GlassPanel, StatusBadge } from '@b3-crow/ui-kit';

interface Pattern {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
}

interface PatternsSectionProps {
  patterns?: Pattern[];
}

const defaultPatterns: Pattern[] = [
  {
    id: '1',
    title: 'Checkout Drop-off Spike',
    description: 'Unusual abandonment rate detected at step 3 payment gateway.',
    severity: 'high',
  },
  {
    id: '2',
    title: 'Store A24 Traffic Anomalies',
    description: 'Foot traffic mismatch with POS transactions during peak hours.',
    severity: 'medium',
  },
  {
    id: '3',
    title: 'Positive Sentiment Surge',
    description: 'Brand mentions increasing following the weekend campaign.',
    severity: 'low',
  },
];

export function PatternsSection({ patterns = defaultPatterns }: PatternsSectionProps) {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'high';
      case 'medium':
        return 'medium';
      case 'low':
        return 'low';
      default:
        return 'low';
    }
  };

  const getSeverityLabel = (severity: string) => {
    return severity.charAt(0).toUpperCase() + severity.slice(1);
  };

  return (
    <GlassPanel variant="heavy" className="rounded-xl p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
        <h3 className="text-sm font-semibold text-white">Top Patterns</h3>
        <a className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
          View all patterns
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>

      {/* Patterns list */}
      <div className="p-4 space-y-1 flex-1">
        {patterns.map((pattern) => (
          <div
            key={pattern.id}
            className="group flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer border border-transparent hover:border-white/[0.05]"
          >
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">{pattern.title}</span>
                <StatusBadge
                  variant={getSeverityVariant(pattern.severity) as 'high' | 'medium' | 'low'}
                  size="sm"
                  uppercase
                  tracking
                  className="font-bold"
                >
                  {getSeverityLabel(pattern.severity)}
                </StatusBadge>
              </div>
              <span className="text-xs text-gray-500">{pattern.description}</span>
            </div>
            <span className="material-symbols-outlined text-gray-600 group-hover:text-gray-400 text-[18px]">
              chevron_right
            </span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
