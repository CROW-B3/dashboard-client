'use client';

import type { DataSourceStatusProps } from './types';

import { StatusCard } from '@b3-crow/ui-kit';
import { Globe, Hash, Video } from 'lucide-react';

export type { DataSourceStatusProps };

function getDataSourceIconComponent(
  iconType: string,
): React.ComponentType<{ size?: number; className?: string; strokeWidth?: number }> {
  const iconMapping = { web: Globe, cctv: Video, social: Hash };
  return iconMapping[iconType as keyof typeof iconMapping];
}

export function DataSourceStatus({
  icon,
  name,
  isActive = true,
  statusText,
  lastUpdate,
}: DataSourceStatusProps) {
  const IconComponent = getDataSourceIconComponent(icon);

  return (
    <StatusCard
      icon={IconComponent}
      name={name}
      status={isActive ? 'active' : 'inactive'}
      statusText={statusText}
      lastUpdate={lastUpdate}
    />
  );
}
