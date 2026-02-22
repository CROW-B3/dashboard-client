'use client';

import { GlassPanel, MetricsCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SKELETON_KEYS = ['a', 'b', 'c'];

interface Interaction {
  id: string;
  sessionId?: string;
  sourceType?: string;
  summary?: string;
  timestamp?: string;
}

interface Pattern {
  confidence?: number;
  detectedAt?: string;
  generatedAt?: string;
  id: string;
  type?: string;
}

interface InteractionsResponse {
  data?: Interaction[];
  interactions?: Interaction[];
  total?: number;
}

interface PatternsResponse {
  data?: Pattern[];
  patterns?: Pattern[];
  total?: number;
}

interface ProductsResponse {
  total?: number;
}

const SOURCE_COLORS: Record<string, string> = {
  web: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  cctv: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  social: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
  unknown: 'bg-white/10 text-gray-400 border border-white/10',
};

export default function DashboardPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const { data: interactionsData, isLoading: interactionsLoading } =
    useQuery<InteractionsResponse>({
      enabled: !!orgId,
      queryFn: async () => {
        const res = await fetch(
          `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
          { credentials: 'include' },
        );
        if (!res.ok) return {};
        return res.json();
      },
      queryKey: ['dashboard-interactions', orgId],
    });

  const { data: patternsData, isLoading: patternsLoading } =
    useQuery<PatternsResponse>({
      enabled: !!orgId,
      queryFn: async () => {
        const res = await fetch(
          `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?limit=5`,
          { credentials: 'include' },
        );
        if (!res.ok) return {};
        return res.json();
      },
      queryKey: ['dashboard-patterns', orgId],
    });

  const { data: productsData, isLoading: productsLoading } =
    useQuery<ProductsResponse>({
      enabled: !!orgId,
      queryFn: async () => {
        const res = await fetch(
          `${API_GATEWAY_URL}/api/v1/products/organization/${orgId}?pageSize=1`,
          { credentials: 'include' },
        );
        if (!res.ok) return {};
        return res.json();
      },
      queryKey: ['dashboard-products-count', orgId],
    });

  const interactions = interactionsData?.interactions || interactionsData?.data || [];
  const patterns = patternsData?.patterns || patternsData?.data || [];
  const totalInteractions = interactionsData?.total ?? interactions.length;
  const totalPatterns = patternsData?.total ?? patterns.length;
  const totalProducts = productsData?.total ?? 0;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentInteractions = interactions.filter(
    (i) => new Date(i.timestamp ?? '').getTime() >= sevenDaysAgo.getTime(),
  ).length;

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
          title="Total Sessions"
          value={interactionsLoading ? '—' : String(totalInteractions)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Active Patterns"
          value={patternsLoading ? '—' : String(totalPatterns)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Products"
          value={productsLoading ? '—' : String(totalProducts)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Interactions (7d)"
          value={interactionsLoading ? '—' : String(recentInteractions)}
          change=""
          changeType="neutral"
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
              {interactions.slice(0, 5).map((interaction) => (
                <div
                  key={interaction.id}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[interaction.sourceType ?? 'unknown'] ?? SOURCE_COLORS.unknown}`}
                    >
                      {interaction.sourceType || 'unknown'}
                    </span>
                    <span className="max-w-[140px] truncate text-xs text-gray-400">
                      {interaction.summary || interaction.sessionId || interaction.id}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {interaction.timestamp
                      ? new Date(interaction.timestamp).toLocaleDateString()
                      : '—'}
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
              {patterns.slice(0, 5).map((pattern) => (
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
                    {pattern.detectedAt || pattern.generatedAt
                      ? new Date(
                          (pattern.detectedAt || pattern.generatedAt) as string,
                        ).toLocaleDateString()
                      : '—'}
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
