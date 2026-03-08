'use client';

import { GlassPanel, MetricsCard, SourceIcon } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SKELETON_KEYS = ['a', 'b', 'c'];

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

interface Pattern {
  id: string;
  organizationId: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt: number;
}

interface Interaction {
  id: string;
  organizationId: string;
  sourceType: string;
  sessionId: string | null;
  data: string;
  summary: string | null;
  timestamp: number;
  createdAt: number;
}

export default function OverviewPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const { data: interactionSummary, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['interactions-summary', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`,
        { credentials: 'include' },
      );
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: topPatternsData, isLoading: patternsLoading } = useQuery<{ patterns: Pattern[]; total: number }>({
    queryKey: ['top-patterns', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) return { patterns: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: latestInteractionsData, isLoading: interactionsLoading } = useQuery<{ interactions: Interaction[]; total: number }>({
    queryKey: ['latest-interactions', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const patterns = topPatternsData?.patterns ?? [];
  const interactions = latestInteractionsData?.interactions ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your organization at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Interactions"
          value={summaryLoading ? '...' : String(interactionSummary?.total ?? 0)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Total Patterns"
          value={patternsLoading ? '...' : String(topPatternsData?.total ?? 0)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Web Interactions"
          value={summaryLoading ? '...' : String(interactionSummary?.web ?? 0)}
          change=""
          changeType="info"
        />
        <MetricsCard
          title="CCTV Interactions"
          value={summaryLoading ? '...' : String(interactionSummary?.cctv ?? 0)}
          change=""
          changeType="info"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassPanel>
          <h2 className="mb-4 text-base font-semibold text-white">Top Patterns</h2>
          {patternsLoading ? (
            <div className="space-y-2">
              {SKELETON_KEYS.map((k) => (
                <div key={k} className="h-10 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : patterns.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No patterns detected yet</p>
          ) : (
            <div className="space-y-2">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
                      {pattern.type || 'pattern'}
                    </span>
                    {pattern.confidence != null && (
                      <span className="text-xs text-gray-400">
                        {Math.round(pattern.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {pattern.detectedAt
                      ? new Date(pattern.detectedAt).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>

        <GlassPanel>
          <h2 className="mb-4 text-base font-semibold text-white">Latest Interactions</h2>
          {interactionsLoading ? (
            <div className="space-y-2">
              {SKELETON_KEYS.map((k) => (
                <div key={k} className="h-10 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <p className="py-4 text-center text-sm text-gray-500">No interactions yet</p>
          ) : (
            <div className="space-y-2">
              {interactions.map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-3">
                    {(['web', 'cctv', 'social'] as const).includes(interaction.sourceType as 'web' | 'cctv' | 'social') && (
                      <SourceIcon source={interaction.sourceType as 'web' | 'cctv' | 'social'} size="sm" />
                    )}
                    <span className="max-w-[200px] truncate text-xs text-gray-300">
                      {interaction.summary || interaction.sessionId || interaction.id}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {interaction.timestamp
                      ? new Date(interaction.timestamp).toLocaleDateString()
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </GlassPanel>
      </div>
    </div>
  );
}
