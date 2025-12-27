'use client';

import { Header, MetricsCard } from '@b3-crow/ui-kit';
import {
  AskCrowCTA,
  DataSourceStatus,
  LatestInteractions,
  PatternsSection,
} from '@/components/overview';

export default function DashboardPage() {
  return (
    <>
      <Header
        orgName="Global Retail Ops"
        dateRange="Last 7 days"
        userInitials="SJ"
        showNotification={true}
      />

      <div className="relative z-10 px-4 sm:px-6 lg:px-12 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <PageHeader />

          <MetricsSection />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <PatternsSection />
            <LatestInteractions />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
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

          <div className="mb-6 sm:mb-8">
            <AskCrowCTA />
          </div>
        </div>
      </div>
    </>
  );
}

function PageHeader() {
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

function MetricsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
  );
}
