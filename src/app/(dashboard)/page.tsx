'use client';

import { Header, MetricsCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import {
  AskCrowCTA,
  DataSourceStatus,
  LatestInteractions,
  PatternsSection,
} from '@/components/overview';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
  lastEventTimestamps?: {
    web?: number;
    cctv?: number;
    social?: number;
  };
}

interface PatternsCountResponse {
  patterns: unknown[];
  total: number;
}

interface PreviousSummary {
  total: number;
  web: number;
  cctv: number;
}

function formatRelativeTimestamp(epochMs: number | undefined): string {
  if (!epochMs) return 'No data';
  const diffMs = Date.now() - epochMs;
  if (diffMs < 1000) return 'Just now';
  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function formatDelta(current: number, previous: number): { change: string; changeType: 'positive' | 'negative' | 'neutral' } {
  if (previous === 0 && current === 0) return { change: '0', changeType: 'neutral' };
  if (previous === 0) return { change: `+${current}`, changeType: 'positive' };
  const pct = ((current - previous) / previous) * 100;
  if (pct === 0) return { change: '0%', changeType: 'neutral' };
  const sign = pct > 0 ? '+' : '';
  return {
    change: `${sign}${pct.toFixed(1)}%`,
    changeType: pct > 0 ? 'positive' : 'negative',
  };
}

function formatLastUpdated(summary: InteractionSummary | undefined): string {
  if (!summary) return '';
  const timestamps = summary.lastEventTimestamps;
  if (!timestamps) return '';
  const all = [timestamps.web, timestamps.cctv, timestamps.social].filter(Boolean) as number[];
  if (all.length === 0) return '';
  const latest = Math.max(...all);
  return `Last updated ${formatRelativeTimestamp(latest)}`;
}

function createPageHeaderElement(summary: InteractionSummary | undefined) {
  const lastUpdatedText = formatLastUpdated(summary);

  return (
    <div className="relative mb-6 sm:mb-8">
      <h1 className="mb-1 text-xl sm:text-2xl font-bold leading-7 sm:leading-8 text-white">
        Overview
      </h1>
      <p className="text-xs sm:text-sm font-normal leading-5 text-gray-400">
        Key changes across channels — Web, CCTV, Social.
      </p>
      {lastUpdatedText && (
        <p className="sm:absolute sm:right-0 sm:top-2 text-[10px] sm:text-xs font-normal leading-4 text-gray-500 mt-2 sm:mt-0">
          {lastUpdatedText}
        </p>
      )}
    </div>
  );
}

function resolveDataSourceStatus(
  name: 'Web' | 'CCTV' | 'Social',
  isActive: boolean,
  timestamp: number | undefined,
): { statusText: string; lastUpdate: string } {
  if (!isActive) return { statusText: 'Inactive', lastUpdate: 'No data' };
  return {
    statusText: 'Connected',
    lastUpdate: formatRelativeTimestamp(timestamp),
  };
}

export default function DashboardPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;

  const { data: summary, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['interaction-summary', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch interaction summary');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: previousSummary } = useQuery<PreviousSummary>({
    queryKey: ['interaction-summary-previous', orgId],
    queryFn: async () => {
      const weekAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const weekAgoEnd = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const params = new URLSearchParams({
        from: String(Math.floor(weekAgo / 1000)),
        to: String(Math.floor(weekAgoEnd / 1000)),
      });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { total: 0, web: 0, cctv: 0 };
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery<PatternsCountResponse>({
    queryKey: ['patterns-count', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?limit=1`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch patterns count');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: previousPatternsData } = useQuery<PatternsCountResponse>({
    queryKey: ['patterns-count-previous', orgId],
    queryFn: async () => {
      const weekAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const weekAgoEnd = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const params = new URLSearchParams({
        from: String(Math.floor(weekAgo / 1000)),
        to: String(Math.floor(weekAgoEnd / 1000)),
        limit: '1',
      });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { patterns: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const orgName = user?.orgName || 'My Organization';
  const userInitials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const totalInteractions = summaryLoading ? '...' : String(summary?.total ?? 0);
  const totalPatterns = patternsLoading ? '...' : String(patternsData?.total ?? 0);
  const frictionSignals = summaryLoading ? '...' : String(summary?.web ?? 0);
  const conversionSignals = summaryLoading ? '...' : String(summary?.cctv ?? 0);

  const totalDelta = formatDelta(summary?.total ?? 0, previousSummary?.total ?? 0);
  const patternsDelta = formatDelta(patternsData?.total ?? 0, previousPatternsData?.total ?? 0);
  const frictionDelta = formatDelta(summary?.web ?? 0, previousSummary?.web ?? 0);
  const conversionDelta = formatDelta(summary?.cctv ?? 0, previousSummary?.cctv ?? 0);

  const webActive = (summary?.web ?? 0) > 0;
  const cctvActive = (summary?.cctv ?? 0) > 0;
  const socialActive = (summary?.social ?? 0) > 0;

  const timestamps = summary?.lastEventTimestamps;
  const webStatus = resolveDataSourceStatus('Web', webActive, timestamps?.web);
  const cctvStatus = resolveDataSourceStatus('CCTV', cctvActive, timestamps?.cctv);
  const socialStatus = resolveDataSourceStatus('Social', socialActive, timestamps?.social);

  return (
    <>
      <Header
        orgName={orgName}
        dateRange="Last 7 days"
        userInitials={userInitials}
        showNotification={true}
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          {createPageHeaderElement(summary)}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <MetricsCard
              title="Interactions"
              value={totalInteractions}
              change={totalDelta.change}
              changeType={totalDelta.changeType}
            />
            <MetricsCard
              title="Patterns"
              value={totalPatterns}
              change={patternsDelta.change}
              changeType={patternsDelta.changeType === 'negative' ? 'negative' : 'info'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <PatternsSection {...(orgId && { orgId })} />
            <LatestInteractions {...(orgId && { orgId })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <DataSourceStatus
              icon="web"
              name="Web"
              isActive={webActive}
              statusText={webStatus.statusText}
              lastUpdate={webStatus.lastUpdate}
              eventCount={summary?.web ?? 0}
            />
            <DataSourceStatus
              icon="cctv"
              name="CCTV"
              isActive={cctvActive}
              statusText={cctvStatus.statusText}
              lastUpdate={cctvStatus.lastUpdate}
              eventCount={summary?.cctv ?? 0}
            />
            <DataSourceStatus
              icon="social"
              name="Social"
              isActive={socialActive}
              statusText={socialStatus.statusText}
              lastUpdate={socialStatus.lastUpdate}
              eventCount={summary?.social ?? 0}
            />
          </div>

          <div className="mb-6 sm:mb-8">
            <AskCrowCTA />
          </div>
        </div>
      </div>
    </>
  );
}
