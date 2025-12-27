'use client';

import type { DataSourceStatusProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { Globe, Hash, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export type { DataSourceStatusProps };

const iconComponents = {
  web: Globe,
  cctv: Video,
  social: Hash,
};

export function DataSourceStatus({
  icon,
  name,
  isActive = true,
  statusText,
  lastUpdate,
}: DataSourceStatusProps) {
  const IconComponent = iconComponents[icon];

  return (
    <GlassPanel variant="heavy" className="p-4 flex items-center gap-4">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-800/50 border border-white/5">
        <IconComponent size={16} className="text-gray-400" strokeWidth={2} />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-gray-200">{name}</h4>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            isActive ? 'bg-violet-500' : 'bg-gray-500'
          )} />
        </div>
        <p className="text-[10px] uppercase tracking-wider text-gray-500">{statusText}</p>
      </div>
      <span className="font-mono text-xs text-gray-600">{lastUpdate}</span>
    </GlassPanel>
  );
}
