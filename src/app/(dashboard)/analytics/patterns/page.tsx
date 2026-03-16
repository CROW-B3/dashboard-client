'use client';

import { GlassPanel, SegmentedControl } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

interface PatternResult {
  id: string;
  organizationId: string;
  period: string;
  sourceType: string | null;
  report: string;
  generatedAt: number;
}

interface Pattern {
  id: string;
  organizationId: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt: number;
}

type PatternsApiResponse =
  | { patterns: Pattern[]; total: number }
  | { results: PatternResult[]; total: number };

function isPatternResultResponse(data: PatternsApiResponse): data is { results: PatternResult[]; total: number } {
  return 'results' in data;
}

export default function AnalyticsPatternsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;
  const [period, setPeriod] = useState('weekly');
  const [expandedPatternId, setExpandedPatternId] = useState<string | null>(null);

  const { data, isLoading } = useQuery<PatternsApiResponse | null>({
    queryKey: ['analytics-patterns', orgId, period],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?period=${period}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const renderPatternResults = () => {
    if (!data || !isPatternResultResponse(data)) return null;

    return data.results.map((result) => {
      let report: { insights?: string; productCorrelations?: string[]; interactionCount?: number } = {};
      try {
        report = typeof result.report === 'string' ? JSON.parse(result.report) : result.report;
      } catch { /* empty */ }

      return (
        <GlassPanel key={result.id}>
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-white font-medium">Pattern Report</h3>
            <span className="text-xs text-gray-500">{new Date(result.generatedAt).toLocaleDateString()}</span>
          </div>
          {report.insights && <p className="text-gray-300 text-sm mb-3">{report.insights}</p>}
          {report.productCorrelations && (
            <div>
              <p className="text-xs text-gray-400 mb-2">Product Correlations</p>
              <div className="space-y-1">
                {report.productCorrelations.map((corr) => (
                  <p key={corr} className="text-xs text-gray-300">- {corr}</p>
                ))}
              </div>
            </div>
          )}
        </GlassPanel>
      );
    });
  };

  const renderPatternsList = () => {
    if (!data || isPatternResultResponse(data)) return null;

    return data.patterns.map((pattern) => {
      const isExpanded = expandedPatternId === pattern.id;
      let parsedData: { title?: string; interactionCount?: number } = {};
      try {
        parsedData = typeof pattern.data === 'string' ? JSON.parse(pattern.data) : pattern.data;
      } catch { /* empty */ }

      return (
        <GlassPanel key={pattern.id}>
          <div
            className="flex items-center justify-between cursor-pointer"
            onClick={() => setExpandedPatternId(isExpanded ? null : pattern.id)}
          >
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
              <div>
                <h3 className="text-white font-medium">{parsedData.title || pattern.type}</h3>
                <p className="text-xs text-gray-400">
                  {pattern.confidence != null && `${Math.round(pattern.confidence * 100)}% confidence`}
                  {parsedData.interactionCount != null && ` | ${parsedData.interactionCount} interactions`}
                </p>
              </div>
            </div>
            <span className="text-xs text-gray-500">
              {pattern.detectedAt ? new Date(pattern.detectedAt).toLocaleDateString() : ''}
            </span>
          </div>
          {isExpanded && (
            <div className="mt-3 pt-3 border-t border-white/10">
              <pre className="text-xs text-gray-400 whitespace-pre-wrap break-all">
                {JSON.stringify(parsedData, null, 2)}
              </pre>
            </div>
          )}
        </GlassPanel>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Patterns</h1>
        <p className="text-gray-400 text-sm mt-1">AI-generated behavioral patterns from your data</p>
      </div>

      <SegmentedControl
        options={PERIOD_OPTIONS as any}
        value={period}
        onChange={setPeriod}
      />

      {isLoading ? (
        <div className="space-y-4">
          {['a', 'b', 'c'].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : data && ((isPatternResultResponse(data) && data.results.length > 0) || (!isPatternResultResponse(data) && data.patterns.length > 0)) ? (
        <div className="space-y-4">
          {isPatternResultResponse(data) ? renderPatternResults() : renderPatternsList()}
        </div>
      ) : (
        <GlassPanel>
          <p className="text-gray-500 text-center py-4">No patterns generated yet for this period. Patterns are generated automatically on a schedule.</p>
        </GlassPanel>
      )}
    </div>
  );
}
