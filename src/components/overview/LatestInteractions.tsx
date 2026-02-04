'use client';

import type { Interaction, LatestInteractionsProps } from './types';

import {
  ListCard,
  ListItem,
} from '@b3-crow/ui-kit';
import { Globe, Store, Video } from 'lucide-react';
import Link from 'next/link';

export type { Interaction, LatestInteractionsProps };

function getInteractionIconComponent(
  iconType: string,
): React.ComponentType<{ size: number; className: string; strokeWidth: number }> {
  const iconMapping = { store: Store, globe: Globe, video: Video };
  return iconMapping[iconType as keyof typeof iconMapping];
}

function getDefaultLatestInteractions(): Interaction[] {
  return [
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
}

export function LatestInteractions({
  interactions = getDefaultLatestInteractions(),
  onInteractionClick,
}: LatestInteractionsProps) {
  return (
    <ListCard
      title="Latest Interactions"
      viewAllHref="/analysis/interactions"
      viewAllText="View all interactions"
      LinkComponent={Link}
    >
      {interactions.map((interaction) => (
        <InteractionItem
          key={interaction.id}
          interaction={interaction}
          onClick={() => onInteractionClick?.(interaction)}
        />
      ))}
    </ListCard>
  );
}

interface InteractionItemProps {
  interaction: Interaction;
  onClick: () => void;
}

function InteractionItem({ interaction, onClick }: InteractionItemProps) {
  const IconComponent = getInteractionIconComponent(interaction.icon);

  return (
    <ListItem
      onClick={onClick}
      ariaLabel={`View interaction: ${interaction.title}`}
      highlighted={interaction.isHighlighted ?? false}
    >
      <h4 className="text-xs sm:text-sm font-medium text-gray-200 mb-1">
        {interaction.title}
      </h4>
      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        <IconComponent
          size={10}
          className="text-gray-500 sm:w-3 sm:h-3"
          strokeWidth={2}
        />
        <span className="text-[10px] sm:text-xs text-gray-500">
          {interaction.location}
        </span>
        <div className="w-1 h-1 rounded-full bg-gray-700 hidden sm:block" />
        <span className="text-[10px] sm:text-xs text-gray-500">
          {interaction.time}
        </span>
      </div>
    </ListItem>
  );
}
