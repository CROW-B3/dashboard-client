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
  data?: string;
  timestamp: number;
}

interface InteractionsApiResponse {
  interactions: ApiInteraction[];
  total: number;
}

interface ParsedInteractionData {
  url?: string;
  eventCount?: number;
  browser?: string;
  device?: string;
}

function parseInteractionData(raw: string | undefined): ParsedInteractionData {
  if (!raw) return {};
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      url: parsed?.url ?? parsed?.pageUrl ?? parsed?.initialUrl ?? undefined,
      eventCount: parsed?.eventCount ?? parsed?.event_count ?? parsed?.totalEvents ?? parsed?.events?.length ?? undefined,
      browser: parsed?.browser ?? parsed?.browserName ?? undefined,
      device: parsed?.device ?? parsed?.deviceType ?? undefined,
    };
  } catch {
    return {};
  }
}

function extractShortTitle(summary: string): string {
  const levelMatch = summary.match(/^L[12]\s*\|\s*(.+)/);
  if (levelMatch) {
    let body = levelMatch[1];
    body = body.replace(/\s*\[[^\]]*:[0-9.]+\]/g, '').trim();
    const sentenceEnd = body.search(/[.!?](\s|$)/);
    const sentence = sentenceEnd !== -1 ? body.slice(0, sentenceEnd + 1).trim() : body.trim();
    const cleaned = sentence.replace(/^The user\s+/i, '').trim();
    const title = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
    return title.length > 60 ? title.slice(0, 57).trimEnd() + '...' : title;
  }

  const webSessionMatch = summary.match(/Web session on ([^|]+)\|[^|]*\|\s*(\d+)\s*events/i);
  if (webSessionMatch) {
    const rawUrl = webSessionMatch[1].trim();
    const count = webSessionMatch[2];
    let siteName = rawUrl;
    try {
      const u = new URL(rawUrl);
      siteName = u.hostname.replace(/^www\./, '');
    } catch {
    }
    return `${siteName} session \u2022 ${count} events`;
  }

  const firstSentenceEnd = summary.search(/[.!?](\s|$)/);
  const firstSentence = firstSentenceEnd !== -1 ? summary.slice(0, firstSentenceEnd + 1).trim() : summary.trim();
  return firstSentence.length > 60 ? firstSentence.slice(0, 57).trimEnd() + '...' : firstSentence;
}

function deriveInteractionTitle(
  summary: string | null,
  url: string | undefined,
  eventCount: number | undefined,
  browser: string | undefined,
  device: string | undefined,
): string {
  if (summary) return extractShortTitle(summary);

  const parts: string[] = [];
  if (url) {
    try {
      const u = new URL(url);
      parts.push(`${u.hostname.replace(/^www\./, '')} session`);
    } catch {
      parts.push('Web session');
    }
  } else {
    parts.push('Web session');
  }
  if (eventCount !== undefined) parts.push(`${eventCount} events`);
  const deviceBrowser = [device, browser].filter(Boolean).join('/');
  if (deviceBrowser) parts.push(deviceBrowser);
  return parts.join(' \u2022 ');
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
  const parsed = parseInteractionData(i.data);
  const title = deriveInteractionTitle(i.summary, parsed.url, parsed.eventCount, parsed.browser, parsed.device);
  return {
    id: i.id,
    title,
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

function EmptyInteractionsState() {
  return (
    <div className="py-8 flex flex-col items-center gap-3 text-center">
      <p className="text-sm text-gray-400">
        No interactions yet — connect your first data source
      </p>
      <Link
        href="/integrations"
        className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
      >
        Go to Integrations
      </Link>
    </div>
  );
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

  const interactions: Interaction[] = interactionsProp
    ?? (orgId && data && !isError ? data.interactions.map(mapApiInteractionToInteraction) : []);

  const isEmpty = interactions.length === 0;

  return (
    <GlassPanel variant="heavy" className="overflow-hidden">
      <SectionHeader
        title="Latest Interactions"
        viewAllHref="/analysis/interactions"
        viewAllText="View all interactions"
        LinkComponent={Link}
      />
      {isEmpty ? (
        <EmptyInteractionsState />
      ) : (
        <div className="p-3 sm:p-4 space-y-1">
          {interactions.map((interaction) => (
            <InteractionItem
              key={interaction.id}
              interaction={interaction}
              onClick={() => onInteractionClick?.(interaction)}
            />
          ))}
        </div>
      )}
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
      <h4 className="text-xs sm:text-sm font-medium text-gray-200 mb-1 line-clamp-2">
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
