'use client';

import type { DataSourceStatusProps } from './types';

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
    <div
      className="rounded-xl p-4 flex items-center gap-4"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        outline: '1px solid rgba(255, 255, 255, 0.06)',
        outlineOffset: '-1px',
      }}
    >
      {/* Icon badge */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{
          background: 'rgba(31, 41, 55, 0.50)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
      >
        <IconComponent size={16} color="#9CA3AF" strokeWidth={2} />
      </div>

      {/* Name and status */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          {/* Name: #E5E7EB, 14px, 500, line-height 20 */}
          <h4 style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>{name}</h4>
          <div className={cn(
            'w-1.5 h-1.5 rounded-full',
            isActive ? 'bg-[#8B5CF6]' : 'bg-[#6B7280]'
          )} />
        </div>
        {/* Status: #6B7280, 10px, 400, uppercase, line-height 15, letter-spacing 0.5 */}
        <p style={{ color: '#6B7280', fontSize: 10, fontWeight: 400, lineHeight: '15px', letterSpacing: 0.5, textTransform: 'uppercase' }}>{statusText}</p>
      </div>

      {/* Last update */}
      <span className="font-mono text-xs font-normal leading-4 text-gray-600">{lastUpdate}</span>
    </div>
  );
}
