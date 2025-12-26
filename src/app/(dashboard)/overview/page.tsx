'use client';

import { Header } from '@b3-crow/ui-kit';
import {
  AskCrowCTA,
  DataSourceStatus,
  LatestInteractions,
  MetricsCard,
  PatternsSection,
} from '@/components/overview';

export default function OverviewPage() {
  return (
    <>
      {/* Header: 64px height */}
      <Header
        orgName="Global Retail Ops"
        dateRange="Last 7 days"
        userInitials="SJ"
        showNotification={true}
      />

      {/* Content: padding 120px left/right, 32px top */}
      <div className="relative z-10 px-[120px] py-8">
        <div className="max-w-[1400px]">
          {/* Page Header */}
          <div className="relative mb-8">
            <h1 className="mb-1 text-2xl font-bold leading-8 text-white">
              Overview
            </h1>
            <p className="text-sm font-normal leading-5 text-gray-400">
              Key changes across channels — Web, CCTV, Social.
            </p>
            <p className="absolute right-0 top-2 text-xs font-normal leading-4 text-gray-500">
              Last updated 2 min ago
            </p>
          </div>

          {/* Metrics Cards: 4 cards in one row, gap 16px */}
          <div className="flex gap-4 mb-8">
            <MetricsCard
              title="Total Interactions"
              value="84,392"
              change="+12.5%"
              changeType="positive"
              chartData={[25, 50, 35, 70, 95]}
              chartColor="violet"
            />
            <MetricsCard
              title="Total Patterns"
              value="14"
              change="+2"
              changeType="info"
              chartData={[10, 10, 60, 25, 10]}
              chartColor="violet"
            />
            <MetricsCard
              title="Friction Signals"
              value="1,204"
              change="+5.2%"
              changeType="negative"
              chartData={[35, 50, 40, 55, 70]}
              chartColor="rose"
            />
            <MetricsCard
              title="Conversion Signals"
              value="4.2%"
              change="-1.1%"
              changeType="neutral"
              chartData={[85, 80, 80, 75, 70]}
              chartColor="gray"
            />
          </div>

          {/* Two Column Section: Patterns + Interactions, each 688px, gap 24px */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <PatternsSection />
            <LatestInteractions />
          </div>

          {/* Data Source Status Cards: 3 cards, 456px each, gap 16px */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <DataSourceStatus
              icon="web"
              name="Web"
              isActive={true}
              statusText="Connected • Ingesting"
              lastUpdate="2ms ago"
            />
            <DataSourceStatus
              icon="cctv"
              name="CCTV"
              isActive={true}
              statusText="Connected • 42 Cameras"
              lastUpdate="Live"
            />
            <DataSourceStatus
              icon="social"
              name="Social"
              isActive={false}
              statusText="Connected • Tracking"
              lastUpdate="12s ago"
            />
          </div>

          {/* Ask CROW CTA: 1400px width, 164px height */}
          <div className="mb-8">
            <AskCrowCTA />
          </div>
        </div>
      </div>
    </>
  );
}
