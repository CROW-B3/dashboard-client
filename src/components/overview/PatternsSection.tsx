'use client';

import type { Pattern, PatternsSectionProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { ListItem } from './ListItem';
import { SectionHeader } from './SectionHeader';

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
        viewAllHref="/patterns"
        viewAllText="View all patterns"
      />
      <div className="p-4 space-y-1">
        {patterns.map((pattern) => (
          <ListItem
            key={pattern.id}
            onClick={() => onPatternClick?.(pattern)}
            ariaLabel={`View pattern: ${pattern.title}`}
            showChevron
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <h4 className="text-sm font-medium text-gray-200">{pattern.title}</h4>
              <span
                style={{
                  ...severityStyles[pattern.severity],
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 4,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  lineHeight: 1,
                  flexShrink: 0,
                }}
              >
                {pattern.severity}
              </span>
            </div>
            <p className="text-xs text-gray-500">{pattern.description}</p>
          </ListItem>
        ))}
      </div>
    </GlassPanel>
  );
}
