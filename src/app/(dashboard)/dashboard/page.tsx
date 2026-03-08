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

interface Pattern {
  id: string;
  organizationId: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt: number;
}

interface InteractionsResponse {
  interactions: Interaction[];
  total: number;
}

interface PatternsResponse {
  patterns: Pattern[];
  total: number;
}

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const { data: summaryData, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['dashboard-summary', orgId],
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

  const { data: interactionsData, isLoading: interactionsLoading } = useQuery<InteractionsResponse>({
    queryKey: ['dashboard-interactions', orgId],
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

  const { data: patternsData, isLoading: patternsLoading } = useQuery<PatternsResponse>({
    queryKey: ['dashboard-patterns', orgId],
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

  const interactions = interactionsData?.interactions ?? [];
  const patterns = patternsData?.patterns ?? [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="mt-1 text-sm text-gray-400">
          Welcome back, {user?.name || user?.email || 'User'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total Interactions"
          value={summaryLoading ? '...' : String(summaryData?.total ?? 0)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Active Patterns"
          value={patternsLoading ? '...' : String(patternsData?.total ?? 0)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Web Sources"
          value={summaryLoading ? '...' : String(summaryData?.web ?? 0)}
          change=""
          changeType="info"
        />
        <MetricsCard
          title="CCTV Sources"
          value={summaryLoading ? '...' : String(summaryData?.cctv ?? 0)}
          change=""
          changeType="info"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassPanel>
          <h2 className="mb-4 text-base font-semibold text-white">Recent Interactions</h2>
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
                    <span className="max-w-[180px] truncate text-xs text-gray-300">
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

        <GlassPanel>
          <h2 className="mb-4 text-base font-semibold text-white">Recent Patterns</h2>
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
      </div>
    </div>
  );
}
