'use client';

import type { Pattern, PatternsSectionProps } from './types';

import {
  GlassPanel,
  ListItem,
  SectionHeader,
} from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

export type { Pattern, PatternsSectionProps };

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface ApiPattern {
  id: string;
  type: string;
  confidence: number | null;
  detectedAt: number;
  createdAt: number;
}

interface PatternsApiResponse {
  patterns: ApiPattern[];
  total: number;
}

function mapApiPatternToPattern(p: ApiPattern, index: number): Pattern {
  const severities: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  const severity = severities[index % severities.length] ?? 'low';
  return {
    id: p.id,
    title: p.type || `Pattern ${p.id}`,
    description: `Detected at ${new Date(p.detectedAt * 1000).toLocaleString()}${p.confidence != null ? ` — confidence: ${(p.confidence * 100).toFixed(0)}%` : ''}`,
    severity,
  };
}

function EmptyPatternsState() {
  return (
    <div className="py-8 flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-gray-400">
        No patterns detected yet — connect your first data source
      </p>
      <Link
        href="/integrations"
        className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
      >
        Go to Integrations
      </Link>
    </div>
  );
}

function getSeverityBadgeStyles(severity: string): React.CSSProperties {
  const styleMapping: Record<string, React.CSSProperties> = {
    high: { background: 'rgba(139, 92, 246, 0.2)', color: '#C4B5FD' },
    medium: { background: 'rgba(139, 92, 246, 0.15)', color: '#A78BFA' },
    low: { background: 'rgba(107, 114, 128, 0.15)', color: '#6B7280' },
  };
  return styleMapping[severity] || (styleMapping as any).low || { background: 'rgba(107, 114, 128, 0.15)', color: '#6B7280' };
}

interface PatternsSectionWithOrgProps extends PatternsSectionProps {
  orgId?: string;
}

export function PatternsSection({
  patterns: patternsProp,
  onPatternClick,
  orgId,
}: PatternsSectionWithOrgProps) {
  const { data, isError } = useQuery<PatternsApiResponse>({
    queryKey: ['patterns-overview', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch patterns');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const patterns: Pattern[] = patternsProp
    ?? (orgId && data && !isError ? data.patterns.map(mapApiPatternToPattern) : []);

  const isEmpty = patterns.length === 0;

  return (
    <GlassPanel variant="heavy" className="overflow-hidden">
      <SectionHeader
        title="Top Patterns"
        viewAllHref="/analysis/patterns"
        viewAllText="View all patterns"
        LinkComponent={Link}
      />
      {isEmpty ? (
        <EmptyPatternsState />
      ) : (
        <div className="p-3 sm:p-4 space-y-1">
          {patterns.map((pattern) => (
            <PatternItem
              key={pattern.id}
              pattern={pattern}
              onClick={() => onPatternClick?.(pattern)}
            />
          ))}
        </div>
      )}
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
      style={getSeverityBadgeStyles(severity)}
    >
      {severity}
    </span>
  );
}
