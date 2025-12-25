'use client';

import { GlassPanel } from '@b3-crow/ui-kit';

interface DataSource {
  name: string;
  icon: string;
  status: string;
  timestamp: string;
  isActive: boolean;
}

interface DataSourceStatusProps {
  sources?: DataSource[];
}

const defaultSources: DataSource[] = [
  {
    name: 'Web',
    icon: 'language',
    status: 'Connected • Ingesting',
    timestamp: '2ms ago',
    isActive: true,
  },
  {
    name: 'CCTV',
    icon: 'videocam',
    status: 'Connected • 42 Cameras',
    timestamp: 'Live',
    isActive: true,
  },
  {
    name: 'Social',
    icon: 'tag',
    status: 'Connected • Tracking',
    timestamp: '12s ago',
    isActive: false,
  },
];

export function DataSourceStatus({ sources = defaultSources }: DataSourceStatusProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {sources.map((source) => (
        <GlassPanel key={source.name} className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-800/50 flex items-center justify-center border border-white/5">
              <span className="material-symbols-outlined text-gray-400 text-[18px]">{source.icon}</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-200">{source.name}</span>
                <span className={`w-1.5 h-1.5 rounded-full ${source.isActive ? 'bg-violet-500' : 'bg-gray-500'}`}></span>
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">{source.status}</span>
            </div>
          </div>
          <span className="text-xs text-gray-600 font-mono">{source.timestamp}</span>
        </GlassPanel>
      ))}
    </div>
  );
}
