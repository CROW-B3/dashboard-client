'use client';

import type { Interaction, LatestInteractionsProps } from './types';

import { GlassPanel } from '@b3-crow/ui-kit';
import { Globe, Store, Video } from 'lucide-react';

import { ListItem } from './ListItem';
import { SectionHeader } from './SectionHeader';

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
    <GlassPanel variant="heavy" className="overflow-hidden">
      <SectionHeader
        title="Latest Interactions"
        viewAllHref="/interactions"
        viewAllText="View all interactions"
      />
      <div className="p-4 space-y-1">
        {interactions.map((interaction) => {
          const IconComponent = iconComponents[interaction.icon];
          return (
            <ListItem
              key={interaction.id}
              onClick={() => onInteractionClick?.(interaction)}
              ariaLabel={`View interaction: ${interaction.title}`}
              highlighted={interaction.isHighlighted ?? false}
            >
              <h4 className="text-sm font-medium text-gray-200 mb-1">{interaction.title}</h4>
              <div className="flex items-center gap-2">
                <IconComponent size={12} className="text-gray-500" strokeWidth={2} />
                <span className="text-xs text-gray-500">{interaction.location}</span>
                <div className="w-1 h-1 rounded-full bg-gray-700" />
                <span className="text-xs text-gray-500">{interaction.time}</span>
              </div>
            </ListItem>
          );
        })}
      </div>
    </GlassPanel>
  );
}
