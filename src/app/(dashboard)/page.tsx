'use client';

import { Header, MetricsCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import {
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

const DATE_RANGES: Record<string, number> = {
  'Today': 1,
  'Yesterday': 2,
  'Last 7 days': 7,
  'Last 14 days': 14,
  'Last 30 days': 30,
  'This month': 30,
  'Last month': 60,
  'This quarter': 90,
};

function getDateRange(label: string): { from: number; to: number } {
  const now = Date.now();
  const days = DATE_RANGES[label] ?? 7;
  return {
    from: Math.floor((now - days * 24 * 60 * 60 * 1000) / 1000),
    to: Math.floor(now / 1000),
  };
}

function getPreviousDateRange(label: string): { from: number; to: number } {
  const days = DATE_RANGES[label] ?? 7;
  const now = Date.now();
  return {
    from: Math.floor((now - days * 2 * 24 * 60 * 60 * 1000) / 1000),
    to: Math.floor((now - days * 24 * 60 * 60 * 1000) / 1000),
  };
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

function resolveDataSourceStatus(
  _name: 'Web' | 'CCTV' | 'Social',
  isActive: boolean,
  timestamp: number | undefined,
): { statusText: string; lastUpdate: string } {
  if (!isActive) return { statusText: 'Inactive', lastUpdate: 'No data' };
  return { statusText: 'Connected', lastUpdate: formatRelativeTimestamp(timestamp) };
}

export default function DashboardPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [dateRange, setDateRange] = useState('Last 7 days');

  const range = getDateRange(dateRange);
  const prevRange = getPreviousDateRange(dateRange);

  const handleDateRangeChange = useCallback((value: string) => {
    setDateRange(value);
  }, []);

  const { data: summary, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['interaction-summary', orgId, range.from, range.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: String(range.from),
        to: String(range.to),
      });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch interaction summary');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: previousSummary } = useQuery<InteractionSummary>({
    queryKey: ['interaction-summary-previous', orgId, prevRange.from, prevRange.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: String(prevRange.from),
        to: String(prevRange.to),
      });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000,
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery<PatternsCountResponse>({
    queryKey: ['patterns-count', orgId, range.from, range.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: String(range.from),
        to: String(range.to),
        limit: '1',
      });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch patterns count');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  const { data: previousPatternsData } = useQuery<PatternsCountResponse>({
    queryKey: ['patterns-count-previous', orgId, prevRange.from, prevRange.to],
    queryFn: async () => {
      const params = new URLSearchParams({
        from: String(prevRange.from),
        to: String(prevRange.to),
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

  const neutralDelta = { change: '—', changeType: 'neutral' as const };
  const totalDelta = summaryLoading ? neutralDelta : formatDelta(summary?.total ?? 0, previousSummary?.total ?? 0);
  const patternsDelta = patternsLoading ? neutralDelta : formatDelta(patternsData?.total ?? 0, previousPatternsData?.total ?? 0);

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
        dateRange={dateRange}
        onDateRangeChange={handleDateRangeChange}
        userInitials={userInitials}
        showNotification={false}
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-xl sm:text-2xl font-bold leading-7 sm:leading-8 text-white">
              Overview
            </h1>
            <p className="text-xs sm:text-sm font-normal leading-5 text-gray-400">
              Key changes across channels — Web, CCTV, Social.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <MetricsCard
              title="Interactions"
              value={totalInteractions}
              change={totalDelta.change}
              changeType={totalDelta.changeType}
              chartData={[summary?.web ?? 0, summary?.cctv ?? 0, summary?.social ?? 0, summary?.total ?? 0]}
            />
            <MetricsCard
              title="Patterns"
              value={totalPatterns}
              change={patternsDelta.change}
              changeType={patternsDelta.changeType === 'negative' ? 'negative' : 'info'}
              chartData={[patternsData?.total ?? 0, previousPatternsData?.total ?? 0]}
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

        </div>
      </div>
    </>
  );
}
