'use client';

import type { Pattern, PatternsSectionProps } from './types';

import {
  ListCard,
  ListItem,
  SeverityBadge,
} from '@b3-crow/ui-kit';
import Link from 'next/link';

export type { Pattern, PatternsSectionProps };

function getDefaultPatterns(): Pattern[] {
  return [
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
}

export function PatternsSection({
  patterns = getDefaultPatterns(),
  onPatternClick,
}: PatternsSectionProps) {
  return (
    <ListCard
      title="Top Patterns"
      viewAllHref="/analysis/patterns"
      viewAllText="View all patterns"
      LinkComponent={Link}
    >
      {patterns.map((pattern) => (
        <PatternItem
          key={pattern.id}
          pattern={pattern}
          onClick={() => onPatternClick?.(pattern)}
        />
      ))}
    </ListCard>
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
        <SeverityBadge severity={pattern.severity as any} />
      </div>
      <p className="text-[10px] sm:text-xs text-gray-500 line-clamp-2">
        {pattern.description}
      </p>
    </ListItem>
  );
}
