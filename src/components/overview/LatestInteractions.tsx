'use client';

import type { Interaction, LatestInteractionsProps } from './types';

import { ArrowRight, Globe, Store, Video } from 'lucide-react';
import Link from 'next/link';

import { cn } from '@/lib/utils';

export type { Interaction, LatestInteractionsProps };

const iconComponents = {
  store: Store,
  globe: Globe,
  video: Video,
};

const defaultInteractions: Interaction[] = [
  {
    id: '1',
    title: 'Inventory Discrepancy',
    icon: 'store',
    location: 'Store NY-04',
    time: '14 mins ago',
    isHighlighted: true,
  },
  {
    id: '2',
    title: 'Social Negative Spike',
    icon: 'globe',
    location: 'Global / Twitter',
    time: '42 mins ago',
  },
  {
    id: '3',
    title: 'Queue Wait Time > 15m',
    icon: 'video',
    location: 'Store LDN-02',
    time: '1 hr ago',
  },
];

export function LatestInteractions({
  interactions = defaultInteractions,
  onInteractionClick,
}: LatestInteractionsProps) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255, 255, 255, 0.01)',
        outline: '1px solid rgba(255, 255, 255, 0.06)',
        outlineOffset: '-1px',
      }}
    >
      {/* Header */}
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'rgba(255, 255, 255, 0.01)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        }}
      >
        {/* Title: white, 14px, 600, line-height 20 */}
        <h3 style={{ color: 'white', fontSize: 14, fontWeight: 600, lineHeight: '20px' }}>Latest Interactions</h3>
        <Link
          href="/interactions"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          {/* Link: #A78BFA, 12px, 400, line-height 16 */}
          <span style={{ color: '#A78BFA', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>View all interactions</span>
          <ArrowRight size={14} color="#A78BFA" strokeWidth={2} />
        </Link>
      </div>

      {/* Interactions list */}
      <div className="p-4 space-y-1">
        {interactions.map((interaction) => {
          const IconComponent = iconComponents[interaction.icon];
          return (
            <button
              key={interaction.id}
              type="button"
              onClick={() => onInteractionClick?.(interaction)}
              aria-label={`View interaction: ${interaction.title}`}
              className={cn(
                'w-full px-3.5 py-3 rounded-lg text-left border-l-2',
                interaction.isHighlighted
                  ? 'border-l-[#8B5CF6] bg-[#8B5CF6]/[0.02]'
                  : 'border-l-transparent'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                {/* Item title: #E5E7EB, 14px, 500, line-height 20 */}
                <h4 style={{ color: '#E5E7EB', fontSize: 14, fontWeight: 500, lineHeight: '20px' }}>{interaction.title}</h4>
              </div>
              <div className="flex items-center gap-2">
                <IconComponent size={12} color="#6B7280" strokeWidth={2} />
                {/* Location/time: #6B7280, 12px, 400, line-height 16 */}
                <span style={{ color: '#6B7280', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>{interaction.location}</span>
                <div className="w-1 h-1 rounded-full bg-[#374151]" />
                <span style={{ color: '#6B7280', fontSize: 12, fontWeight: 400, lineHeight: '16px' }}>{interaction.time}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
