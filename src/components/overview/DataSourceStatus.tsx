'use client';

import type { DataSourceStatusProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { Globe, Hash, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

export type { DataSourceStatusProps };

interface ExtendedDataSourceStatusProps extends DataSourceStatusProps {
  eventCount?: number;
}

function getDataSourceIconComponent(
  iconType: string,
): React.ComponentType<{ size: number; className: string; strokeWidth: number }> {
  const iconMapping = { web: Globe, cctv: Video, social: Hash };
  return iconMapping[iconType as keyof typeof iconMapping];
}

function DataSourceIconBadge({
  Icon,
  isActive,
}: {
  Icon: React.ComponentType<{ size: number; className: string; strokeWidth: number }>;
  isActive: boolean;
}) {
  return (
    <div
      className={cn(
        'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 border transition-colors',
        isActive
          ? 'bg-violet-500/10 border-violet-500/20'
          : 'bg-gray-800/50 border-white/5',
      )}
    >
      <Icon
        size={16}
        className={cn(
          'sm:w-[18px] sm:h-[18px] transition-colors',
          isActive ? 'text-violet-400' : 'text-gray-500',
        )}
        strokeWidth={2}
      />
    </div>
  );
}

function ConnectionQualityBar({ isActive }: { isActive: boolean }) {
  const segments = [0, 1, 2, 3];

  return (
    <div className="flex items-center gap-0.5">
      {segments.map((i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 w-1.5 rounded-full transition-all',
            isActive
              ? i < 3
                ? 'bg-violet-400'
                : 'bg-violet-400/40'
              : 'bg-gray-700',
          )}
        />
      ))}
    </div>
  );
}

function LivePulse() {
  return (
    <span className="relative flex h-2 w-2">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-400" />
    </span>
  );
}

function InactiveDot() {
  return <span className="inline-flex h-2 w-2 rounded-full bg-gray-600" />;
}

export function DataSourceStatus({
  icon,
  name,
  isActive = true,
  statusText,
  lastUpdate,
  eventCount,
}: ExtendedDataSourceStatusProps) {
  const IconComponent = getDataSourceIconComponent(icon);

  return (
    <GlassPanel
      variant="heavy"
      className={cn(
        'p-3 sm:p-4 flex items-center gap-3 sm:gap-4 transition-all',
        isActive && 'hover:border-violet-500/20',
      )}
    >
      <DataSourceIconBadge Icon={IconComponent} isActive={isActive} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-xs sm:text-sm font-medium text-gray-200 truncate">
            {name}
          </h4>
          {isActive ? <LivePulse /> : <InactiveDot />}
        </div>
        <div className="flex items-center gap-2">
          <p className="text-[9px] sm:text-[10px] uppercase tracking-wider text-gray-500 truncate">
            {statusText}
          </p>
          <ConnectionQualityBar isActive={isActive} />
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        {lastUpdate && !lastUpdate.includes('events') && lastUpdate !== 'No data' && (
          <span className="font-mono text-[10px] sm:text-xs text-gray-500">
            {lastUpdate}
          </span>
        )}
        {eventCount !== undefined && eventCount > 0 ? (
          <span className="font-mono text-[10px] text-gray-500">
            {eventCount.toLocaleString()} events
          </span>
        ) : !isActive ? (
          <span className="font-mono text-[10px] text-gray-500">No data</span>
        ) : null}
      </div>
    </GlassPanel>
  );
}
