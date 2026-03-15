'use client';

import { SourceIcon } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Fragment, useCallback, useState } from 'react';

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

interface Pattern {
  id: string;
  organizationId: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt: number;
}

interface PatternsResponse {
  patterns: Pattern[];
  total: number;
}

interface LinkedInteraction {
  id: string;
  sourceType: string;
  summary: string | null;
  timestamp: number;
}

function parsePatternData(pattern: Pattern): { title: string; interactionCount: number; interactionIds: string[] } {
  try {
    const parsed = typeof pattern.data === 'string' ? JSON.parse(pattern.data) : pattern.data;
    return {
      title: parsed?.title ?? parsed?.name ?? pattern.type,
      interactionCount: parsed?.interactionCount ?? parsed?.interactionIds?.length ?? 0,
      interactionIds: parsed?.interactionIds ?? [],
    };
  } catch {
    return { title: pattern.type, interactionCount: 0, interactionIds: [] };
  }
}

function PatternExpandedRow({ pattern, orgId }: { pattern: Pattern; orgId: string }) {
  const parsedData = parsePatternData(pattern);

  const { data: interactionsData, isLoading } = useQuery<{ interactions: LinkedInteraction[] }>({
    queryKey: ['pattern-interactions', pattern.id, orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [] };
      return res.json();
    },
    enabled: !!orgId,
  });

  const linkedInteractions = interactionsData?.interactions ?? [];

  return (
    <TableRow className="border-white/10 bg-white/[0.02]">
      <TableCell colSpan={4} className="px-6 py-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-400">
              Pattern Data
            </span>
          </div>
          {parsedData.interactionIds.length > 0 && (
            <p className="text-xs text-gray-500">
              Linked interaction IDs: {parsedData.interactionIds.slice(0, 5).join(', ')}
              {parsedData.interactionIds.length > 5 && ` +${parsedData.interactionIds.length - 5} more`}
            </p>
          )}
          <div className="space-y-1">
            <p className="text-xs font-medium text-gray-400">Recent Interactions</p>
            {isLoading ? (
              <div className="space-y-1">
                {['x', 'y'].map((k) => (
                  <div key={k} className="h-8 animate-pulse rounded bg-white/5" />
                ))}
              </div>
            ) : linkedInteractions.length === 0 ? (
              <p className="text-xs text-gray-500">No linked interactions found</p>
            ) : (
              <div className="space-y-1">
                {linkedInteractions.map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-center gap-3 rounded-md bg-white/5 px-3 py-1.5"
                  >
                    {(['web', 'cctv', 'social'] as const).includes(interaction.sourceType as 'web' | 'cctv' | 'social') && (
                      <SourceIcon source={interaction.sourceType as 'web' | 'cctv' | 'social'} size="sm" />
                    )}
                    <span className="flex-1 truncate text-xs text-gray-300">
                      {interaction.summary || interaction.id}
                    </span>
                    <span className="text-[10px] text-gray-500">
                      {interaction.timestamp ? new Date(interaction.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function PatternsTable() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid ?? '';
  const searchParams = useSearchParams();
  const router = useRouter();

  const [query, setQuery] = useState(searchParams?.get('query') || '');
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PatternsResponse>({
    enabled: !!orgId,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (query) params.set('query', query);
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?${params}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { patterns: [], total: 0 };
      return res.json();
    },
    queryKey: ['patterns', orgId, query],
  });

  const patterns = data?.patterns ?? [];

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

  const handleToggleExpand = (patternId: string) => {
    setExpandedPatternId((prev) => (prev === patternId ? null : patternId));
  };

  return (
    <>
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
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
            <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
          ))}
        </div>
      ) : patterns.length === 0 ? (
        <div className="py-12 text-center text-gray-400">
          {query ? `No patterns found for "${query}"` : 'No patterns detected yet'}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10">
          <Table>
            <TableHeader>
              <TableRow className="border-white/10">
                <TableHead className="w-8 text-gray-400" />
                <TableHead className="text-gray-400">Title</TableHead>
                <TableHead className="text-gray-400">Confidence</TableHead>
                <TableHead className="text-gray-400">Interactions</TableHead>
                <TableHead className="text-gray-400">Detected At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patterns.map((pattern) => {
                const { title, interactionCount } = parsePatternData(pattern);
                const isExpanded = expandedPatternId === pattern.id;
                return (
                  <Fragment key={pattern.id}>
                    <TableRow
                      className="cursor-pointer border-white/10 hover:bg-white/5"
                      onClick={() => handleToggleExpand(pattern.id)}
                    >
                      <TableCell className="w-8 px-2">
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-white font-medium">
                        {title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {pattern.confidence != null ? (
                          <span className={`font-medium ${pattern.confidence >= 0.7 ? 'text-green-400' : pattern.confidence >= 0.4 ? 'text-yellow-400' : 'text-red-400'}`}>
                            {Math.round(pattern.confidence * 100)}%
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-300">
                        {interactionCount > 0 ? (
                          <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs">
                            {interactionCount}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {pattern.detectedAt
                          ? new Date(pattern.detectedAt).toLocaleString()
                          : pattern.createdAt
                          ? new Date(pattern.createdAt).toLocaleString()
                          : ''}
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <PatternExpandedRow
                        key={`${pattern.id}-expanded`}
                        pattern={pattern}
                        orgId={orgId}
                      />
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  );
}
