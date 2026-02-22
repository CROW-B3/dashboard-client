'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
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
import { useSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.api.crowai.dev';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e'];

const SOURCE_COLORS: Record<string, string> = {
  web: 'bg-blue-500/20 text-blue-300 border border-blue-500/30',
  cctv: 'bg-purple-500/20 text-purple-300 border border-purple-500/30',
  social: 'bg-pink-500/20 text-pink-300 border border-pink-500/30',
};

interface Interaction {
  [key: string]: unknown;
  createdAt?: string;
  id: string;
  sessionId?: string;
  sourceType?: string;
  summary?: string;
  timestamp?: string;
}

interface InteractionsResponse {
  data?: Interaction[];
  interactions?: Interaction[];
  total?: number;
}

export function InteractionsTable() {
  const { data: session } = useSession();
  const orgId =
    (session?.session as { activeOrganizationId?: string })?.activeOrganizationId || '';
  const token = session?.session?.token || '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [selected, setSelected] = useState<Interaction | null>(null);

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
  };

  const { data, isLoading } = useQuery<InteractionsResponse>({
    enabled: !!orgId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      const res = await fetch(
        `${API_URL}/api/v1/interactions/organization/${orgId}?${params}`,
        { headers },
      );
      if (!res.ok) return {};
      return res.json();
    },
    queryKey: ['interactions', orgId, query],
  });

  const interactions = data?.interactions || data?.data || [];

  const handleSearch = useCallback(
    (value: string) => {
      setQuery(value);
      const params = new URLSearchParams(searchParams?.toString() ?? '');
      if (value) {
        params.set('query', value);
      } else {
        params.delete('query');
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams],
  );

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-9"
          placeholder="Search interactions..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
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
          {query ? `No interactions found for "${query}"` : 'No interactions yet'}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="text-gray-400">Session ID</TableHead>
                <TableHead className="text-gray-400">Source Type</TableHead>
                <TableHead className="text-gray-400">Timestamp</TableHead>
                <TableHead className="text-gray-400">Summary</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {interactions.map((interaction) => (
                <TableRow
                  key={interaction.id}
                  className="cursor-pointer border-white/10 hover:bg-white/5"
                  onClick={() => setSelected(interaction)}
                >
                  <TableCell className="font-mono text-xs text-white">
                    {interaction.sessionId || interaction.id}
                  </TableCell>
                  <TableCell>
                    {interaction.sourceType ? (
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${SOURCE_COLORS[interaction.sourceType] ?? 'bg-white/10 text-gray-300 border border-white/20'}`}
                      >
                        {interaction.sourceType}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-gray-400">
                    {interaction.timestamp || interaction.createdAt
                      ? new Date(
                          (interaction.timestamp || interaction.createdAt) as string,
                        ).toLocaleString()
                      : '—'}
                  </TableCell>
                  <TableCell className="max-w-[240px] truncate text-sm text-white">
                    {interaction.summary || (
                      <span className="text-gray-400">No summary</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
