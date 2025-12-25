'use client';

import { Sidebar, Header, DashboardBackground } from '@b3-crow/ui-kit';
import { MetricsCard } from '@/components/overview/MetricsCard';
import { PatternsSection } from '@/components/overview/PatternsSection';
import { AlertsSection } from '@/components/overview/AlertsSection';
import { DataSourceStatus } from '@/components/overview/DataSourceStatus';
import { AskCrowCTA } from '@/components/overview/AskCrowCTA';
import { usePathname } from 'next/navigation';

export default function OverviewPage() {
  const pathname = usePathname();

  const metricsData = [
    {
      label: 'Total Interactions',
      value: '84,392',
      change: '+12.5%',
      changeVariant: 'positive' as const,
      chartData: [20, 40, 30, 60, 80],
    },
    {
      label: 'Alerts Triggered',
      value: '14',
      change: '+2',
      changeVariant: 'info' as const,
      chartData: [10, 10, 50, 20, 10],
    },
    {
      label: 'Friction Signals',
      value: '1,204',
      change: '+5.2%',
      changeVariant: 'negative' as const,
      chartData: [30, 40, 35, 45, 60],
    },
    {
      label: 'Conversion Signals',
      value: '4.2%',
      change: '-1.1%',
      changeVariant: 'neutral' as const,
      chartData: [70, 65, 68, 62, 60],
    },
  ];

  return (
    <>
      {/* Background */}
      <DashboardBackground />

      {/* Main layout */}
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar */}
        <Sidebar activeHref={pathname} />

        {/* Main content */}
        <main className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Header */}
          <Header
            orgName="Global Retail Ops"
            dateRange="Last 7 days"
            userInitials="SJ"
            showNotification={true}
          />

          {/* Content area */}
          <div className="flex-1 overflow-y-auto p-8 relative z-10">
            <div className="max-w-[1400px] mx-auto space-y-8">
              {/* Title section */}
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white mb-1">Overview</h1>
                  <p className="text-sm text-gray-400">Key changes across channels — Web, CCTV, Social.</p>
                </div>
                <span className="text-xs text-gray-500">Last updated 2 min ago</span>
              </div>

              {/* Metrics grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {metricsData.map((metric, index) => (
                  <MetricsCard
                    key={index}
                    label={metric.label}
                    value={metric.value}
                    change={metric.change}
                    changeVariant={metric.changeVariant}
                    chartData={metric.chartData}
                  />
                ))}
              </div>

              {/* Patterns and Alerts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PatternsSection />
                <AlertsSection />
              </div>

              {/* Data source status */}
              <DataSourceStatus />

              {/* Ask CROW CTA */}
              <AskCrowCTA onOpenClick={() => window.location.href = '/ask-crow'} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
