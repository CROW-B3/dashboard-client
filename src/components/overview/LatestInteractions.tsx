'use client';

import type { Interaction, LatestInteractionsProps } from './types';

import {
  GlassPanel,
  ListItem,
  SectionHeader,
} from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { Globe, Store, Video } from 'lucide-react';
import Link from 'next/link';

export type { Interaction, LatestInteractionsProps };

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface ApiInteraction {
  id: string;
  sourceType: string;
  sessionId: string | null;
  summary: string | null;
  timestamp: number;
}

interface InteractionsApiResponse {
  interactions: ApiInteraction[];
  total: number;
}

function sourceTypeToIcon(sourceType: string): Interaction['icon'] {
  const mapping: Record<string, Interaction['icon']> = {
    web: 'globe',
    cctv: 'video',
    social: 'globe',
    store: 'store',
  };
  return mapping[sourceType.toLowerCase()] ?? 'globe';
}

function mapApiInteractionToInteraction(i: ApiInteraction): Interaction {
  const label = i.summary || i.sessionId || i.id;
  return {
    id: i.id,
    title: label,
    icon: sourceTypeToIcon(i.sourceType),
    location: i.sourceType,
    time: new Date(i.timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}

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

interface LatestInteractionsWithOrgProps extends LatestInteractionsProps {
  orgId?: string;
}

export function LatestInteractions({
  interactions: interactionsProp,
  onInteractionClick,
  orgId,
}: LatestInteractionsWithOrgProps) {
  const { data, isError } = useQuery<InteractionsApiResponse>({
    queryKey: ['interactions-overview', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) throw new Error('Failed to fetch interactions');
      return res.json();
    },
    enabled: !!orgId,
    staleTime: 60 * 1000,
  });

  let interactions: Interaction[];
  if (interactionsProp) {
    interactions = interactionsProp;
  } else if (orgId && data && !isError) {
    interactions = data.interactions.map(mapApiInteractionToInteraction);
  } else {
    interactions = getDefaultLatestInteractions();
  }

  return (
    <GlassPanel variant="heavy" className="overflow-hidden">
      <SectionHeader
        title="Latest Interactions"
        viewAllHref="/analysis/interactions"
        viewAllText="View all interactions"
        LinkComponent={Link}
      />
      <div className="p-3 sm:p-4 space-y-1">
        {interactions.map((interaction) => (
          <InteractionItem
            key={interaction.id}
            interaction={interaction}
            onClick={() => onInteractionClick?.(interaction)}
          />
        ))}
      </div>
    </GlassPanel>
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
