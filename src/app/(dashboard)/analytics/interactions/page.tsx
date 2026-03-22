'use client';

import { FilterDropdown, SourceIcon, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const PAGE_SIZE = 20;

const SOURCE_TYPE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'web', label: 'Web' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'social', label: 'Social' },
];

interface Interaction {
  id: string;
  organizationId: string;
  sourceType: string;
  sessionId: string | null;
  data: string;
  summary: string | null;
  timestamp: number;
  createdAt: number;
}

function parseInteractionData(interaction: Interaction): { confidence?: number; tags?: string[] } {
  try {
    const parsed = typeof interaction.data === 'string' ? JSON.parse(interaction.data) : interaction.data;
    return {
      confidence: parsed?.confidence ?? parsed?.score ?? undefined,
      tags: parsed?.tags ?? parsed?.labels ?? [],
    };
  } catch {
    return {};
  }
}

export default function AnalyticsInteractionsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [sourceType, setSourceType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ interactions: Interaction[]; total: number }>({
    queryKey: ['analytics-interactions', orgId, sourceType, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (sourceType) params.set('sourceType', sourceType);
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?${params}`, { credentials: 'include' });
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Interactions</h1>
          <p className="text-gray-400 text-sm mt-1">Customer interaction events from all sources</p>
        </div>
        <FilterDropdown
          options={SOURCE_TYPE_OPTIONS}
          value={sourceType}
          onChange={v => { setSourceType(v); setPage(1); }}
          label="Filter by source"
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {['a', 'b', 'c', 'd', 'e'].map((k) => (
            <div key={k} className="h-20 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {data?.interactions?.map((interaction) => {
            const { confidence, tags } = parseInteractionData(interaction);
            return (
              <div key={interaction.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {(['web', 'cctv', 'social'] as const).includes(interaction.sourceType as 'web' | 'cctv' | 'social') ? (
                      <SourceIcon source={interaction.sourceType as 'web' | 'cctv' | 'social'} size="sm" />
                    ) : (
                      <StatusBadge>{interaction.sourceType}</StatusBadge>
                    )}
                    {confidence != null && (
                      <span className={`text-xs font-medium ${confidence >= 0.7 ? 'text-green-400' : confidence >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                        {Math.round(confidence * 100)}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">{new Date(interaction.timestamp).toLocaleString()}</span>
                </div>
                {interaction.summary && <p className="text-sm text-gray-300">{interaction.summary}</p>}
                {tags && tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] text-gray-300">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          {!data?.interactions?.length && <p className="text-gray-500 text-center py-8">No interactions yet</p>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages} ({data?.total ?? 0} total)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= totalPages}
              className="flex items-center gap-1 px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
