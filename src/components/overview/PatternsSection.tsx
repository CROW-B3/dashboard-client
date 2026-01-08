'use client';

import type { Pattern, PatternsSectionProps } from './types';

import {
  GlassPanel,
  ListItem,
  SectionHeader,
} from '@b3-crow/ui-kit';
import Link from 'next/link';

export type { Pattern, PatternsSectionProps };

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

const severityStyles: Record<string, React.CSSProperties> = {
  high: { background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD' },
  medium: { background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' },
  low: { background: 'rgba(107, 114, 128, 0.15)', color: '#6B7280' },
};

export function PatternsSection({
  patterns = defaultPatterns,
  onPatternClick,
}: PatternsSectionProps) {
  return (
    <GlassPanel variant="heavy" className="overflow-hidden">
      <SectionHeader
        title="Top Patterns"
        viewAllHref="/analysis/patterns"
        viewAllText="View all patterns"
        LinkComponent={Link}
      />
      <div className="p-3 sm:p-4 space-y-1">
        {patterns.map((pattern) => (
          <PatternItem
            key={pattern.id}
            pattern={pattern}
            onClick={() => onPatternClick?.(pattern)}
          />
        ))}
      </div>
    </GlassPanel>
  );
}

interface PatternItemProps {
  pattern: Pattern;
  onClick: () => void;
}

function PatternItem({ pattern, onClick }: PatternItemProps) {
  return (
    <ListItem
      onClick={onClick}
      ariaLabel={`View pattern: ${pattern.title}`}
      showChevron
    >
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
        <h4 className="text-xs sm:text-sm font-medium text-gray-200">
          {pattern.title}
        </h4>
        <SeverityBadge severity={pattern.severity} />
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2">
        {pattern.description}
      </p>
    </ListItem>
  );
}

interface SeverityBadgeProps {
  severity: 'high' | 'medium' | 'low';
}

function SeverityBadge({ severity }: SeverityBadgeProps) {
  return (
    <span
      className="text-[8px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wide leading-none flex-shrink-0"
      style={severityStyles[severity]}
    >
      {severity}
    </span>
  );
}
