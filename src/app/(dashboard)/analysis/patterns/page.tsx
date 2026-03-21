'use client';

import type { PatternData, PatternDetail } from '@/components/patterns';
import type { SourceFilter } from '@/components/patterns/PatternsFilterBar';
import { Header, PatternCard, TipCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { PatternDetailPanel, PatternsFilterBar } from '@/components/patterns';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
const PAGE_SIZE = 20;

interface ApiPattern {
  id: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt?: number;
  [key: string]: unknown;
}

interface PatternsApiResponse {
  patterns: ApiPattern[];
  total: number;
}

function parsePatternData(raw: string): {
  title?: string;
  severity?: 'high' | 'medium' | 'low';
  affectedStores?: string;
  source?: 'web' | 'cctv' | 'social';
  description?: string;
  recommendations?: string[];
} {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      title: parsed?.title ?? parsed?.name ?? undefined,
      severity: parsed?.severity ?? undefined,
      affectedStores: parsed?.affectedStores ?? parsed?.locations ?? undefined,
      source: parsed?.source ?? parsed?.sourceType ?? undefined,
      description: parsed?.description ?? parsed?.summary ?? undefined,
      recommendations: parsed?.recommendations ?? undefined,
    };
  } catch {
    return {};
  }
}

function toConfidenceLevel(confidence: number | null): 'high' | 'medium' | 'low' {
  if (confidence == null) return 'low';
  if (confidence >= 0.7) return 'high';
  if (confidence >= 0.4) return 'medium';
  return 'low';
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Unknown';
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
}

function mapApiPatternToData(api: ApiPattern): PatternData {
  const parsed = parsePatternData(api.data);
  const validSources = ['web', 'cctv', 'social'] as const;
  const resolvedSource = validSources.includes(parsed.source as typeof validSources[number])
    ? (parsed.source as typeof validSources[number])
    : null;

  return {
    id: api.id,
    title: parsed.title ?? api.type,
    severity: parsed.severity ?? 'medium',
    affectedStores: parsed.affectedStores ?? api.type,
    lastSeen: formatRelativeTime(api.detectedAt ?? api.createdAt ?? 0),
    confidence: toConfidenceLevel(api.confidence),
    ...(resolvedSource ? { source: resolvedSource } : {}),
  };
}

function buildDetailFromApiPattern(
  pattern: PatternData,
  api: ApiPattern,
): PatternDetail {
  const parsed = parsePatternData(api.data);

  let rawDataMetrics: { label: string; value: string }[] = [];
  try {
    const parsedRaw = typeof api.data === 'string' ? JSON.parse(api.data) : api.data;
    if (parsedRaw && typeof parsedRaw === 'object') {
      const skipKeys = new Set(['title', 'name', 'severity', 'affectedStores', 'locations', 'source', 'sourceType', 'description', 'summary', 'recommendations']);
      rawDataMetrics = Object.entries(parsedRaw)
        .filter(([key]) => !skipKeys.has(key))
        .slice(0, 6)
        .map(([label, value]) => ({
          label,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        }));
    }
  } catch {
    // ignore parse errors
  }

  return {
    ...pattern,
    ...(parsed.description ? { description: parsed.description } : {}),
    ...(parsed.recommendations && parsed.recommendations.length > 0 ? { recommendations: parsed.recommendations } : {}),
    ...(rawDataMetrics.length > 0 ? { metrics: rawDataMetrics } : {}),
  };
}

export default function PatternsPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const [selectedPattern, setSelectedPattern] = useState<PatternDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');

  const { data, isLoading } = useQuery<PatternsApiResponse>({
    enabled: !!orgId,
    queryKey: ['analysis-patterns', orgId, sourceFilter],
    queryFn: async () => {
      const params = new URLSearchParams({ page: '1', limit: String(PAGE_SIZE) });
      if (sourceFilter !== 'all') params.set('sourceType', sourceFilter);
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { patterns: [], total: 0 };
      return res.json();
    },
  });

  const apiPatterns = data?.patterns ?? [];
  const allPatterns: PatternData[] = apiPatterns.map(mapApiPatternToData);

  const apiPatternMap = new Map(apiPatterns.map((p) => [p.id, p]));

  const filteredPatterns = useMemo(
    () => (sourceFilter === 'all' ? allPatterns : allPatterns.filter((p) => p.source === sourceFilter)),
    [allPatterns, sourceFilter],
  );

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials="SJ" showNotification minimal onMenuClick={toggle} logoSrc="/favicon.webp" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1640px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Patterns
            </h1>
            <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
              Derived behaviors and anomalies generated from interactions.
            </p>
            <p className="sm:absolute sm:right-0 sm:top-2 text-xs font-medium leading-4 mt-2 sm:mt-0" style={{ color: '#6B7280', letterSpacing: '0.3px' }}>
              {isLoading ? 'Loading...' : `${data?.total ?? 0} patterns detected`}
            </p>
          </div>

          <div className="mb-6">
            <PatternsFilterBar activeSource={sourceFilter} onSourceChange={setSourceFilter} onExport={() => {}} />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {['a', 'b', 'c', 'd'].map((k) => (
                <div key={k} className="h-[160px] animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : filteredPatterns.length === 0 ? (
            <div className="py-12 text-center text-gray-400 mb-8">
              {sourceFilter !== 'all' ? `No ${sourceFilter} patterns found` : 'No patterns detected yet'}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {filteredPatterns.map((pattern) => (
                <PatternCard
                  key={pattern.id}
                  id={pattern.id}
                  title={pattern.title}
                  severity={pattern.severity}
                  affectedStores={pattern.affectedStores}
                  lastSeen={pattern.lastSeen}
                  confidence={pattern.confidence}
                  onViewDetails={() => {
                    const api = apiPatternMap.get(pattern.id);
                    setSelectedPattern(
                      api ? buildDetailFromApiPattern(pattern, api) : { ...pattern },
                    );
                    setIsPanelOpen(true);
                  }}
                  onViewEvidence={() => {}}
                  onCreateAlert={() => {}}
                />
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <TipCard>
              Click on a pattern card to view detailed analysis,
              <br />
              recommendations, and related interactions.
            </TipCard>
          </div>
        </div>
      </main>

      <PatternDetailPanel pattern={selectedPattern} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />
    </div>
  );
}
