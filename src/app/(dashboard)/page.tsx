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
}

interface PatternsCountResponse {
  patterns: unknown[];
  total: number;
}

function createPageHeaderElement() {
  return (
    <div className="relative mb-6 sm:mb-8">
      <h1 className="mb-1 text-xl sm:text-2xl font-bold leading-7 sm:leading-8 text-white">
        Overview
      </h1>
      <p className="text-xs sm:text-sm font-normal leading-5 text-gray-400">
        Key changes across channels — Web, CCTV, Social.
      </p>
      <p className="sm:absolute sm:right-0 sm:top-2 text-[10px] sm:text-xs font-normal leading-4 text-gray-500 mt-2 sm:mt-0">
        Last updated 2 min ago
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

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

  const orgName = user?.orgName || 'My Organization';
  const userInitials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const totalInteractions = summaryLoading ? '...' : String(summary?.total ?? 0);
  const totalPatterns = patternsLoading ? '...' : String(patternsData?.total ?? 0);
  const frictionSignals = summaryLoading ? '...' : String(summary?.web ?? 0);
  const conversionSignals = summaryLoading ? '...' : String(summary?.cctv ?? 0);

  const webActive = (summary?.web ?? 0) > 0;
  const cctvActive = (summary?.cctv ?? 0) > 0;
  const socialActive = (summary?.social ?? 0) > 0;

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
          {createPageHeaderElement()}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <MetricsCard
              title="Total Interactions"
              value={totalInteractions}
              change="+12.5%"
              changeType="positive"
              chartData={[25, 50, 35, 70, 95]}
              chartColor="violet"
            />
            <MetricsCard
              title="Total Patterns"
              value={totalPatterns}
              change="+2"
              changeType="info"
              chartData={[10, 10, 60, 25, 10]}
              chartColor="violet"
            />
            <MetricsCard
              title="Friction Signals"
              value={frictionSignals}
              change="+5.2%"
              changeType="negative"
              chartData={[35, 50, 40, 55, 70]}
              chartColor="rose"
            />
            <MetricsCard
              title="Conversion Signals"
              value={conversionSignals}
              change="-1.1%"
              changeType="neutral"
              chartData={[85, 80, 80, 75, 70]}
              chartColor="gray"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <PatternsSection {...(orgId && { orgId })} />
            <LatestInteractions {...(orgId && { orgId })} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <DataSourceStatus
              icon="web"
              name="Web"
              isActive={webActive}
              statusText={webActive ? 'Connected • Ingesting' : 'Inactive'}
              lastUpdate="2ms ago"
            />
            <DataSourceStatus
              icon="cctv"
              name="CCTV"
              isActive={cctvActive}
              statusText={cctvActive ? 'Connected • Live' : 'Inactive'}
              lastUpdate="Live"
            />
            <DataSourceStatus
              icon="social"
              name="Social"
              isActive={socialActive}
              statusText={socialActive ? 'Connected • Tracking' : 'Inactive'}
              lastUpdate="12s ago"
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
