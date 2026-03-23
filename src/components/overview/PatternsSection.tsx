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
  data: string;
  detectedAt: number;
  createdAt: number;
}

interface PatternsApiResponse {
  patterns: ApiPattern[];
  total: number;
}

function extractPatternTitle(type: string, data: string): string {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    if (parsed?.insights && typeof parsed.insights === 'string') {
      let clean = parsed.insights
        .replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '')
        .replace(/\borganization\s*/gi, '')
        .replace(/\bUsers?\s+within\s*/gi, 'Users ')
        .replace(/\bUsers?\s+in\s+\b/gi, 'Users ')
        .replace(/\s{2,}/g, ' ')
        .trim();
      if (/^[a-z]/.test(clean)) clean = clean.charAt(0).toUpperCase() + clean.slice(1);
      const sentence = clean.split(/[.!]\s/)[0]?.trim();
      if (sentence && sentence.length > 10) {
        return sentence.length > 80 ? sentence.slice(0, 77) + '...' : sentence;
      }
    }
  } catch {}
  const label = type.charAt(0).toUpperCase() + type.slice(1).replace(/[_-]/g, ' ');
  return `${label} Pattern Detected`;
}

function toSeverity(confidence: number | null): 'high' | 'medium' | 'low' {
  if (confidence == null) return 'medium';
  if (confidence >= 0.85) return 'high';
  if (confidence >= 0.6) return 'medium';
  return 'low';
}

function formatTimeAgo(epochMs: number): string {
  const diff = Date.now() - epochMs;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function mapApiPatternToPattern(p: ApiPattern): Pattern {
  const ts = new Date(p.detectedAt > 1e12 ? p.detectedAt : p.detectedAt * 1000);
  const ago = formatTimeAgo(ts.getTime());
  return {
    id: p.id,
    title: extractPatternTitle(p.type, p.data),
    description: `${ago}${p.confidence != null ? ` — ${(p.confidence * 100).toFixed(0)}% confidence` : ''}`,
    severity: toSeverity(p.confidence),
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
    <GlassPanel variant="heavy" className="overflow-hidden h-full">
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
