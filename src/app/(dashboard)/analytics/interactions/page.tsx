'use client';

import { FilterDropdown, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SOURCE_TYPE_OPTIONS = [
  { value: '', label: 'All Sources' },
  { value: 'web', label: 'Web' },
  { value: 'cctv', label: 'CCTV' },
  { value: 'social', label: 'Social' },
];

export default function InteractionsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;
  const [sourceType, setSourceType] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery<{ interactions: { id: string; sourceType: string; summary: string; timestamp: string }[]; total: number }>({
    queryKey: ['interactions', orgId, sourceType, page],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (sourceType) params.set('sourceType', sourceType);
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?${params}`, { credentials: 'include' });
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

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
        <div className="text-gray-400">Loading interactions...</div>
      ) : (
        <div className="space-y-3">
          {data?.interactions?.map((interaction: { id: string; sourceType: string; summary: string; timestamp: string }) => (
            <div key={interaction.id} className="bg-white/[0.04] border border-white/10 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <StatusBadge>{interaction.sourceType}</StatusBadge>
                <span className="text-xs text-gray-500">{new Date(interaction.timestamp).toLocaleString()}</span>
              </div>
              {interaction.summary && <p className="text-sm text-gray-300">{interaction.summary}</p>}
            </div>
          ))}
          {!data?.interactions?.length && <p className="text-gray-500 text-center py-8">No interactions yet</p>}
        </div>
      )}

      {(data?.total ?? 0) > 20 && (
        <div className="flex gap-2 justify-center">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Previous</button>
          <button onClick={() => setPage(p => p + 1)} disabled={(data?.interactions?.length ?? 0) < 20} className="px-4 py-2 bg-white/10 rounded-lg text-sm text-white disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
