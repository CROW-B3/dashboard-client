'use client';

import type { InteractionData, InteractionDetail } from '@/components/interactions';
import { Header, TipCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import toast from 'react-hot-toast';
import {
  InteractionDetailPanel,
  InteractionsFilterBar,
  InteractionsTable,
} from '@/components/interactions';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';
const PAGE_SIZE = 20;

interface ApiInteraction {
  id: string;
  sourceType: string;
  sessionId: string | null;
  summary: string | null;
  data: string;
  timestamp: number;
  confidence?: number;
  tags?: string[];
  [key: string]: unknown;
}

interface InteractionsApiResponse {
  interactions: ApiInteraction[];
  total: number;
}

function parseInteractionData(raw: string): { confidence?: number; tags?: string[] } {
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return {
      confidence: parsed?.confidence ?? parsed?.score ?? undefined,
      tags: parsed?.tags ?? parsed?.labels ?? [],
    };
  } catch {
    return {};
  }
}

function toConfidenceLevel(confidence: number): 'high' | 'medium' | 'low' {
  if (confidence >= 0.7) return 'high';
  if (confidence >=  0.4) return 'medium';
  return 'low';
}

function mapApiInteractionToData(api: ApiInteraction): InteractionData {
  const parsed = parseInteractionData(api.data);
  const confidence = api.confidence ?? parsed.confidence ?? 0;
  const tags = api.tags ?? parsed.tags ?? [];
  const sourceType = api.sourceType as 'web' | 'cctv' | 'social';

  return {
    id: api.id,
    source: (['web', 'cctv', 'social'] as const).includes(sourceType) ? sourceType : 'web',
    title: api.summary ?? `Interaction ${api.id}`,
    subtitle: api.sessionId ? `Session ID: ${api.sessionId}` : api.id,
    storeSite: (parsed as Record<string, unknown>)?.storeSite as string ?? api.sourceType,
    timestamp: api.timestamp ? new Date(api.timestamp).toLocaleString() : '',
    confidence,
    confidenceLevel: toConfidenceLevel(confidence),
    tags,
  };
}

function downloadCsv(filename: string, rows: InteractionData[]): void {
  const headers = ['ID', 'Source', 'Title', 'Subtitle', 'Store/Site', 'Timestamp', 'Confidence', 'Tags'];
  const csvRows = [
    headers.join(','),
    ...rows.map((r) =>
      [r.id, r.source, `"${r.title}"`, `"${r.subtitle}"`, r.storeSite, r.timestamp, r.confidence, `"${(r.tags ?? []).join(';')}"`].join(',')
    ),
  ];
  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function saveFilterView(key: string, filters: Record<string, string>): void {
  const existing = JSON.parse(localStorage.getItem('crow-saved-views') ?? '{}');
  existing[key] = { ...filters, savedAt: new Date().toISOString() };
  localStorage.setItem('crow-saved-views', JSON.stringify(existing));
}

function buildDetailFromApiInteraction(
  interaction: InteractionData,
  api: ApiInteraction,
): InteractionDetail {
  let rawDataItems: { label: string; value: string }[] = [];
  try {
    const parsed = typeof api.data === 'string' ? JSON.parse(api.data) : api.data;
    if (parsed && typeof parsed === 'object') {
      rawDataItems = Object.entries(parsed)
        .filter(([key]) => !['confidence', 'score', 'tags', 'labels'].includes(key))
        .slice(0, 6)
        .map(([label, value]) => ({
          label,
          value: typeof value === 'object' ? JSON.stringify(value) : String(value),
        }));
    }
  } catch {
  }

  return {
    ...interaction,
    ...(api.summary ? { description: api.summary } : {}),
    ...(rawDataItems.length > 0 ? { sourceData: rawDataItems } : {}),
  };
}

export default function InteractionsPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const [selectedInteraction, setSelectedInteraction] = useState<InteractionDetail | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [page] = useState(1);
  const [filterState, setFilterState] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery<InteractionsApiResponse>({
    enabled: !!orgId,
    queryKey: ['analysis-interactions', orgId, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
  });

  const apiInteractions = data?.interactions ?? [];
  const interactions: InteractionData[] = apiInteractions.map(mapApiInteractionToData);

  const apiInteractionMap = new Map(apiInteractions.map((i) => [i.id, i]));

  const handleExport = useCallback(() => {
    if (interactions.length === 0) return;
    downloadCsv(`interactions-${new Date().toISOString().slice(0, 10)}.csv`, interactions);
    toast.success('Interactions exported');
  }, [interactions]);

  const handleSaveView = useCallback(() => {
    saveFilterView('interactions', filterState);
    toast.success('View saved');
  }, [filterState]);

  const handleDateRangeChange = useCallback((v: string) => setFilterState((s) => ({ ...s, dateRange: v })), []);
  const handleSourceChange = useCallback((v: string) => setFilterState((s) => ({ ...s, source: v })), []);
  const handleSiteChange = useCallback((v: string) => setFilterState((s) => ({ ...s, site: v })), []);
  const handleSeverityChange = useCallback((v: string) => setFilterState((s) => ({ ...s, severity: v })), []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials="SJ" showNotification minimal onMenuClick={toggle} logoSrc="/favicon.webp" />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-[30px] font-bold leading-9 text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
              Interactions
            </h1>
            <p className="text-sm font-normal leading-5" style={{ color: '#9CA3AF' }}>
              Unified evidence feed across Web, CCTV, and Social.
            </p>
            <p className="sm:absolute sm:right-0 sm:top-2 text-xs font-medium leading-4 mt-2 sm:mt-0" style={{ color: '#6B7280', letterSpacing: '0.3px' }}>
              {isLoading ? 'Loading...' : `${data?.total ?? 0} interactions`}
            </p>
          </div>

          <div className="mb-6">
            <InteractionsFilterBar
              onExport={handleExport}
              onSaveView={handleSaveView}
              onSearch={() => {}}
              onDateRangeChange={handleDateRangeChange}
              onSourceChange={handleSourceChange}
              onSiteChange={handleSiteChange}
              onSeverityChange={handleSeverityChange}
            />
          </div>

          {isLoading ? (
            <div className="space-y-2 mb-8">
              {['a', 'b', 'c', 'd', 'e'].map((k) => (
                <div key={k} className="h-[68px] animate-pulse rounded-xl bg-white/5" />
              ))}
            </div>
          ) : interactions.length === 0 ? (
            <div className="py-12 text-center text-gray-400 mb-8">
              No interactions found
            </div>
          ) : (
            <div className="mb-8">
              <InteractionsTable
                interactions={interactions}
                onRowClick={(interaction) => {
                  const api = apiInteractionMap.get(interaction.id);
                  setSelectedInteraction(
                    api ? buildDetailFromApiInteraction(interaction, api) : { ...interaction },
                  );
                  setIsPanelOpen(true);
                }}
              />
            </div>
          )}

          <div className="flex justify-end">
            <TipCard>
              Open an interaction to view supporting evidence, raw
              <br />
              source data, and confidence metrics.
            </TipCard>
          </div>
        </div>
      </main>

      <InteractionDetailPanel
        interaction={selectedInteraction}
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
      />
    </div>
  );
}
