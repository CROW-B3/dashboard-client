'use client';

import { useQuery } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

import { Badge } from '@/components/ui/badge';
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

interface Pattern {
  [key: string]: unknown;
  confidence?: number;
  createdAt?: string;
  detectedAt?: string;
  generatedAt?: string;
  id: string;
  type?: string;
}

interface PatternsResponse {
  data?: Pattern[];
  patterns?: Pattern[];
  total?: number;
}

export function PatternsTable() {
  const { data: session } = useSession();
  const orgId =
    (session?.session as { activeOrganizationId?: string })?.activeOrganizationId || '';
  const token = session?.session?.token || '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [selected, setSelected] = useState<Pattern | null>(null);

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
  };

  const { data, isLoading } = useQuery<PatternsResponse>({
    enabled: !!orgId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      const res = await fetch(
        `${API_URL}/api/v1/patterns/organization/${orgId}?${params}`,
        { headers },
      );
      if (!res.ok) return {};
      return res.json();
    },
    queryKey: ['patterns', orgId, query],
  });

  const patterns = data?.patterns || data?.data || [];

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
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search patterns..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {SKELETON_KEYS.map((k) => (
            <div key={k} className="h-12 animate-pulse rounded bg-muted" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          {query ? `No patterns found for "${query}"` : 'No patterns detected yet'}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Detected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patterns.map((pattern) => (
                <TableRow
                  key={pattern.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelected(pattern)}
                >
                  <TableCell className="font-mono text-xs">{pattern.id}</TableCell>
                  <TableCell>
                    {pattern.type ? (
                      <Badge variant="outline">{pattern.type}</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm">
                    {pattern.confidence != null ? (
                      <span>{Math.round(pattern.confidence * 100)}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {pattern.detectedAt || pattern.generatedAt || pattern.createdAt
                      ? new Date(
                          (pattern.detectedAt ||
                            pattern.generatedAt ||
                            pattern.createdAt) as string,
                        ).toLocaleString()
                      : '—'}
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
            <DialogTitle>Pattern Detail</DialogTitle>
          </DialogHeader>
          {selected && (
            <pre className="overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-xs">
              {JSON.stringify(selected, null, 2)}
            </pre>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
