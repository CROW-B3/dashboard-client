'use client';

import { FilterDropdown, SourceIcon } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e'];
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
  [key: string]: unknown;
}

interface InteractionsResponse {
  interactions: Interaction[];
  total: number;
  page: number;
  limit: number;
}

function parseInteractionData(interaction: Interaction): { confidence?: number; tags?: string[]; products?: string[] } {
  try {
    const parsed = typeof interaction.data === 'string' ? JSON.parse(interaction.data) : interaction.data;
    return {
      confidence: parsed?.confidence ?? parsed?.score ?? undefined,
      tags: parsed?.tags ?? parsed?.labels ?? [],
      products: parsed?.products ?? parsed?.productNames ?? [],
    };
  } catch {
    return {};
  }
}

export function InteractionsTable() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams?.get('q') || '');
  const [sourceTypeFilter, setSourceTypeFilter] = useState(searchParams?.get('sourceType') || '');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Interaction | null>(null);

  const { data, isLoading } = useQuery<InteractionsResponse>({
    enabled: !!orgId,
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (query) params.set('q', query);
      if (sourceTypeFilter) params.set('sourceType', sourceTypeFilter);
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0, page: 1, limit: PAGE_SIZE };
      return res.json();
    },
    queryKey: ['interactions', orgId, query, sourceTypeFilter, page],
  });

  const interactions = data?.interactions ?? [];
  const totalInteractions = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalInteractions / PAGE_SIZE));

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      setPage(1);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  const handleSourceTypeChange = useCallback(
    (value: string) => {
      setSourceTypeFilter(value);
      setPage(1);
    },
    [],
  );

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search interactions..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>
        <FilterDropdown
          options={SOURCE_TYPE_OPTIONS}
          value={sourceTypeFilter}
          onChange={handleSourceTypeChange}
          label="Source type"
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {SKELETON_KEYS.map((k) => (
            <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : interactions.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          {query || sourceTypeFilter ? 'No interactions match your filters' : 'No interactions yet'}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Source</TableHead>
                <TableHead className="text-gray-400">AI Summary</TableHead>
                <TableHead className="text-gray-400">Confidence</TableHead>
                <TableHead className="text-gray-400">Tags</TableHead>
                <TableHead className="text-gray-400">Products</TableHead>
                <TableHead className="text-gray-400">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => {
                const { confidence, tags, products } = parseInteractionData(interaction);
                return (
                  <TableRow
                    key={interaction.id}
                    className="cursor-pointer border-white/10 hover:bg-white/5"
                    onClick={() => setSelected(interaction)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {(['web', 'cctv', 'social'] as const).includes(interaction.sourceType as 'web' | 'cctv' | 'social') ? (
                          <SourceIcon source={interaction.sourceType as 'web' | 'cctv' | 'social'} size="sm" />
                        ) : (
                          <span className="text-gray-400 text-xs">{interaction.sourceType}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate text-sm text-white">
                      {interaction.summary || (
                        <span className="text-gray-500">No summary</span>
                      )}
                    </TableCell>
                    <TableCell className="text-sm">
                      {confidence != null ? (
                        <span className={`font-medium ${confidence >= 0.7 ? 'text-green-400' : confidence >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {Math.round(confidence * 100)}%
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tags && tags.length > 0 ? (
                          tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-[10px] text-gray-300"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {products && products.length > 0 ? (
                          products.slice(0, 2).map((productName) => (
                            <span
                              key={productName}
                              className="rounded-full bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300"
                            >
                              {productName}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500 text-xs">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-400">
                      {interaction.timestamp
                        ? new Date(interaction.timestamp).toLocaleString()
                        : ''}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages} ({totalInteractions} total)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm text-white disabled:opacity-40"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-auto">
          <DialogHeader>
            <DialogTitle>Interaction Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <pre className="overflow-auto whitespace-pre-wrap break-all rounded-lg bg-white/5 p-4 text-xs text-gray-300">
              {JSON.stringify(selected, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
