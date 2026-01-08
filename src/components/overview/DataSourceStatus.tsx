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
    <GlassPanel
      variant="heavy"
      className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4"
    >
      <IconBadge Icon={IconComponent} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 sm:mb-1">
          <h4 className="text-xs sm:text-sm font-medium text-gray-200 truncate">
            {name}
          </h4>
          <StatusDot isActive={isActive} />
        </div>
        <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 truncate">
          {statusText}
        </p>
      </div>

      <span className="font-mono text-[10px] sm:text-xs text-gray-600 flex-shrink-0">
        {lastUpdate}
      </span>
    </GlassPanel>
  );
}

interface IconBadgeProps {
  Icon: React.ComponentType<{ size: number; className: string; strokeWidth: number }>;
}

function IconBadge({ Icon }: IconBadgeProps) {
  return (
    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-gray-800/50 border border-white/5">
      <Icon size={14} className="text-gray-400 sm:w-4 sm:h-4" strokeWidth={2} />
    </div>
  );
}

interface StatusDotProps {
  isActive: boolean;
}

function StatusDot({ isActive }: StatusDotProps) {
  return (
    <div
      className={cn(
        'w-1.5 h-1.5 rounded-full flex-shrink-0',
        isActive ? 'bg-violet-500' : 'bg-gray-500'
      )}
    />
  );
}
