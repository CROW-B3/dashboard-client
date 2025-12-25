'use client';

import { GlassPanel } from '@b3-crow/ui-kit';

interface Alert {
  id: string;
  title: string;
  location: string;
  icon: string;
  timestamp: string;
  highlighted?: boolean;
}

interface AlertsSectionProps {
  alerts?: Alert[];
}

const defaultAlerts: Alert[] = [
  {
    id: '1',
    title: 'Inventory Discrepancy',
    location: 'Store NY-04',
    icon: 'store',
    timestamp: '14 mins ago',
    highlighted: true,
  },
  {
    id: '2',
    title: 'Social Negative Spike',
    location: 'Global / Twitter',
    icon: 'public',
    timestamp: '42 mins ago',
  },
  {
    id: '3',
    title: 'Queue Wait Time > 15m',
    location: 'Store LDN-02',
    icon: 'videocam',
    timestamp: '1 hr ago',
  },
];

export function AlertsSection({ alerts = defaultAlerts }: AlertsSectionProps) {
  return (
    <GlassPanel variant="heavy" className="rounded-xl p-0 overflow-hidden flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/[0.06] flex justify-between items-center bg-white/[0.01]">
        <h3 className="text-sm font-semibold text-white">Latest Alerts</h3>
        <a className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1">
          View all alerts
          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
        </a>
      </div>

      {/* Alerts list */}
      <div className="p-4 space-y-1 flex-1">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className={`flex items-center justify-between p-3 rounded-lg hover:bg-white/[0.03] transition-colors ${
              alert.highlighted ? 'border-l-2 border-l-violet-500 bg-violet-500/[0.02]' : 'border-l-2 border-l-transparent hover:border-l-gray-600'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium text-gray-200">{alert.title}</span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span className="material-symbols-outlined text-[12px]">{alert.icon}</span>
                <span>{alert.location}</span>
                <span className="w-1 h-1 bg-gray-700 rounded-full"></span>
                <span>{alert.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
