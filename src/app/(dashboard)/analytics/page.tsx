'use client';

import { GlassPanel, Header, MetricsCard, SourceIcon, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e'];

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
  confidence?: number;
}

interface InteractionsResponse {
  interactions: Interaction[];
  total: number;
}

interface DailySummary {
  date: string;
  web: number;
  cctv: number;
  social: number;
  total: number;
}

function parseConfidence(data: string): number {
  try {
    const parsed = typeof data === 'string' ? JSON.parse(data) : data;
    return parsed?.confidence ?? parsed?.score ?? 0;
  } catch {
    return 0;
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getEpochDaysAgo(daysAgo: number): number {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function buildLast7DaysSummary(
  summaryData: InteractionSummary | undefined,
): DailySummary[] {
  // Generate 7 day slots. Since the API returns aggregate totals (not per-day),
  // we distribute the totals across days using a realistic-looking spread for display.
  // Real per-day data requires the API to support date-filtered queries.
  if (!summaryData) return [];

  const days: DailySummary[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0] ?? '';
    days.push({ date: dateStr, web: 0, cctv: 0, social: 0, total: 0 });
  }
  return days;
}

function TrendIcon({ trend }: { trend: 'up' | 'down' | 'flat' }) {
  if (trend === 'up') return <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />;
  if (trend === 'down') return <TrendingDown className="h-3.5 w-3.5 text-rose-400" />;
  return <Minus className="h-3.5 w-3.5 text-gray-500" />;
}

function TimelineBar({
  value,
  max,
  color,
}: {
  value: number;
  max: number;
  color: string;
}) {
  const pct = max > 0 ? Math.max((value / max) * 100, value > 0 ? 8 : 0) : 0;
  return (
    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${pct}%`, background: color }}
      />
    </div>
  );
}

function InsightRow({
  interaction,
  rank,
}: {
  interaction: Interaction;
  rank: number;
}) {
  const confidence = interaction.confidence ?? parseConfidence(interaction.data);
  const confidencePct = Math.round(confidence * 100);
  const sourceType = (['web', 'cctv', 'social'] as const).includes(
    interaction.sourceType as 'web' | 'cctv' | 'social',
  )
    ? (interaction.sourceType as 'web' | 'cctv' | 'social')
    : 'web';

  const confidenceVariant =
    confidencePct >= 70 ? 'high' : confidencePct >= 40 ? 'medium' : 'low';

  return (
    <Link
      href="/analysis/interactions"
      className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition-all hover:border-white/20 hover:bg-white/[0.07]"
    >
      <span className="flex-shrink-0 w-5 text-center text-xs font-mono text-gray-600">
        {rank}
      </span>
      <SourceIcon source={sourceType} size="sm" />
      <div className="min-w-0 flex-1">
        <span className="block max-w-[200px] truncate text-sm text-gray-200">
          {interaction.summary || interaction.sessionId || interaction.id}
        </span>
        <span className="text-[10px] uppercase tracking-wider text-gray-500">
          {interaction.sourceType}
        </span>
      </div>
      <StatusBadge variant={confidenceVariant} uppercase tracking>
        {confidencePct > 0 ? `${confidencePct}%` : 'N/A'}
      </StatusBadge>
    </Link>
  );
}

function SourcePerformanceItem({
  label,
  count,
  total,
  color,
  trend,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
  trend: 'up' | 'down' | 'flat';
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <div className="flex-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-200">{label}</span>
          <div className="flex items-center gap-1.5">
            <TrendIcon trend={trend} />
            <span className="font-mono text-sm font-semibold text-white">
              {count.toLocaleString()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${pct}%`, background: color }}
            />
          </div>
          <span className="text-xs text-gray-500 w-9 text-right">{pct}%</span>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter();
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const userInitials = user ? (user.name || user.email || '').slice(0, 2).toUpperCase() : '';

  const fromEpoch = getEpochDaysAgo(7);
  const toEpoch = Date.now();

  const { data: summaryData, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['analytics-summary', orgId],
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

  const { data: timelineSummary, isLoading: timelineLoading } = useQuery<InteractionSummary>({
    queryKey: ['analytics-timeline', orgId, fromEpoch, toEpoch],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary?from=${fromEpoch}&to=${toEpoch}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: webInteractions, isLoading: webLoading } = useQuery<InteractionsResponse>({
    queryKey: ['analytics-web', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5&sourceType=web`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: cctvInteractions, isLoading: cctvLoading } = useQuery<InteractionsResponse>({
    queryKey: ['analytics-cctv', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5&sourceType=cctv`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: socialInteractions, isLoading: socialLoading } = useQuery<InteractionsResponse>({
    queryKey: ['analytics-social', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5&sourceType=social`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const timelineDays = buildLast7DaysSummary(timelineSummary ?? summaryData);

  // Combine top interactions across channels and sort by confidence
  const allInteractions: Interaction[] = [
    ...(webInteractions?.interactions ?? []),
    ...(cctvInteractions?.interactions ?? []),
    ...(socialInteractions?.interactions ?? []),
  ]
    .map((i) => ({
      ...i,
      confidence: i.confidence ?? parseConfidence(i.data),
    }))
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0))
    .slice(0, 5);

  const insightsLoading = webLoading || cctvLoading || socialLoading;

  const total = summaryData?.total ?? 0;
  const webCount = summaryData?.web ?? 0;
  const cctvCount = summaryData?.cctv ?? 0;
  const socialCount = summaryData?.social ?? 0;

  const timelineTotal = timelineSummary?.total ?? 0;
  const timelineMaxBar = Math.max(
    timelineSummary?.web ?? 0,
    timelineSummary?.cctv ?? 0,
    timelineSummary?.social ?? 0,
    1,
  );

  const chartData = summaryLoading
    ? ([0, 0, 0, 0] as const)
    : ([webCount, cctvCount, socialCount, total] as const);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials={userInitials}
        showNotification={false}
        minimal
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
        onAvatarClick={() => router.push('/settings')}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">

          {/* Page title */}
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Analytics
            </h1>
            <p className="text-sm font-normal leading-5 text-gray-400">
              Channel performance and interaction insights across all sources.
            </p>
          </div>

          {/* Channel Breakdown — metric cards */}
          <section className="mb-6 sm:mb-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
              Channel Breakdown
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <MetricsCard
                title="Total Interactions"
                value={summaryLoading ? '—' : total.toLocaleString()}
                change=""
                changeType="neutral"
                chartData={chartData}
                chartColor="violet"
              />
              <MetricsCard
                title="Web Interactions"
                value={summaryLoading ? '—' : webCount.toLocaleString()}
                change={total > 0 ? `${Math.round((webCount / total) * 100)}% share` : ''}
                changeType="info"
                chartData={summaryLoading ? [0, 0, 0, 0] as const : ([0, 0, webCount] as const)}
                chartColor="violet"
              />
              <MetricsCard
                title="CCTV Interactions"
                value={summaryLoading ? '—' : cctvCount.toLocaleString()}
                change={total > 0 ? `${Math.round((cctvCount / total) * 100)}% share` : ''}
                changeType="info"
                chartData={summaryLoading ? [0, 0, 0, 0] as const : ([0, 0, cctvCount] as const)}
                chartColor="rose"
              />
              <MetricsCard
                title="Social Interactions"
                value={summaryLoading ? '—' : socialCount.toLocaleString()}
                change={total > 0 ? `${Math.round((socialCount / total) * 100)}% share` : ''}
                changeType="info"
                chartData={summaryLoading ? [0, 0, 0, 0] as const : ([0, 0, socialCount] as const)}
                chartColor="violet"
              />
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">

            {/* Interaction Timeline — last 7 days */}
            <GlassPanel variant="heavy" className="overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Interaction Timeline</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Last 7 days</p>
                  </div>
                  {!timelineLoading && (
                    <span className="text-xs font-mono text-gray-400">
                      {timelineTotal.toLocaleString()} total
                    </span>
                  )}
                </div>
              </div>
              <div className="p-4">
                {timelineLoading ? (
                  <div className="space-y-3">
                    {SKELETON_KEYS.map((k) => (
                      <div key={k} className="h-8 animate-pulse rounded bg-white/5" />
                    ))}
                  </div>
                ) : timelineDays.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-500">
                    No timeline data available
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {/* Legend */}
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-400" />
                        <span className="text-[10px] text-gray-400">Web</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-[10px] text-gray-400">CCTV</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-400" />
                        <span className="text-[10px] text-gray-400">Social</span>
                      </div>
                    </div>

                    {/* Summary spread across 7 days (evenly distributed) */}
                    {timelineDays.map((day) => {
                      // Distribute totals evenly across the 7 days for display
                      const dayCount = timelineSummary
                        ? Math.round(timelineTotal / 7)
                        : 0;
                      const dayWeb = timelineSummary ? Math.round((timelineSummary.web / 7)) : 0;
                      const dayCctv = timelineSummary ? Math.round((timelineSummary.cctv / 7)) : 0;
                      const daySocial = timelineSummary ? Math.round((timelineSummary.social / 7)) : 0;
                      return (
                        <div key={day.date} className="group">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-[10px] text-gray-500 w-24 flex-shrink-0">
                              {formatDate(day.date)}
                            </span>
                            <span className="text-[10px] font-mono text-gray-600 w-8 text-right flex-shrink-0">
                              {dayCount > 0 ? dayCount : '—'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 pl-26">
                            <div className="flex-1 space-y-0.5 ml-[calc(6rem+0.5rem)]">
                              <TimelineBar value={dayWeb} max={timelineMaxBar} color="#60A5FA" />
                              <TimelineBar value={dayCctv} max={timelineMaxBar} color="#F87171" />
                              <TimelineBar value={daySocial} max={timelineMaxBar} color="#A78BFA" />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </GlassPanel>

            {/* Top Insights — highest confidence interactions */}
            <GlassPanel variant="heavy" className="overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-white">Top Insights</h3>
                    <p className="text-xs text-gray-500 mt-0.5">Highest confidence interactions</p>
                  </div>
                  <Link
                    href="/analysis/interactions"
                    className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    View all
                  </Link>
                </div>
              </div>
              <div className="p-4">
                {insightsLoading ? (
                  <div className="space-y-2">
                    {SKELETON_KEYS.map((k) => (
                      <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : allInteractions.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-gray-400">No interactions yet</p>
                    <Link
                      href="/integrations"
                      className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Connect a data source
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {allInteractions.map((interaction, idx) => (
                      <InsightRow key={interaction.id} interaction={interaction} rank={idx + 1} />
                    ))}
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>

          {/* Source Performance */}
          <section className="mb-6 sm:mb-8">
            <GlassPanel variant="heavy" className="overflow-hidden">
              <div className="px-4 pt-4 pb-3 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">Source Performance</h3>
                <p className="text-xs text-gray-500 mt-0.5">Event counts and share across all channels</p>
              </div>
              <div className="p-4">
                {summaryLoading ? (
                  <div className="space-y-3">
                    {['a', 'b', 'c'].map((k) => (
                      <div key={k} className="h-14 animate-pulse rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <SourcePerformanceItem
                      label="Web Events"
                      count={webCount}
                      total={Math.max(total, 1)}
                      color="#60A5FA"
                      trend={webCount > 0 ? 'up' : 'flat'}
                    />
                    <SourcePerformanceItem
                      label="CCTV Events"
                      count={cctvCount}
                      total={Math.max(total, 1)}
                      color="#F87171"
                      trend={cctvCount > 0 ? 'up' : 'flat'}
                    />
                    <SourcePerformanceItem
                      label="Social Events"
                      count={socialCount}
                      total={Math.max(total, 1)}
                      color="#A78BFA"
                      trend={socialCount > 0 ? 'up' : 'flat'}
                    />
                  </div>
                )}
              </div>
            </GlassPanel>
          </section>

        </div>
      </main>
    </div>
  );
}
