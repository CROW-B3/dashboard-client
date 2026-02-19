'use client';

import { GlassPanel, SegmentedControl } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const PERIOD_OPTIONS = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'yearly', label: 'Yearly' },
];

export default function PatternsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [period, setPeriod] = useState('weekly');

  const { data, isLoading } = useQuery({
    queryKey: ['patterns', orgId, period],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?period=${period}`, { credentials: 'include' });
      if (!res.ok) return { patterns: [] };
      return res.json();
    },
    enabled: !!orgId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Patterns</h1>
        <p className="text-gray-400 text-sm mt-1">AI-generated behavioral patterns from your data</p>
      </div>

      <SegmentedControl
        options={PERIOD_OPTIONS}
        value={period}
        onChange={setPeriod}
      />

      {isLoading ? (
        <div className="text-gray-400">Loading patterns...</div>
      ) : data?.patterns?.length ? (
        <div className="space-y-4">
          {data.patterns.map((pattern: { id: string; report: string; generatedAt: string }) => {
            const report = typeof pattern.report === 'string' ? JSON.parse(pattern.report) : pattern.report;
            return (
              <GlassPanel key={pattern.id}>
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-white font-medium">Pattern Report</h3>
                  <span className="text-xs text-gray-500">{new Date(pattern.generatedAt).toLocaleDateString()}</span>
                </div>
                {report.insights && <p className="text-gray-300 text-sm mb-3">{report.insights}</p>}
                {report.productCorrelations && (
                  <div>
                    <p className="text-xs text-gray-400 mb-2">Product Correlations</p>
                    <div className="space-y-1">
                      {report.productCorrelations.map((corr: string) => (
                        <p key={corr} className="text-xs text-gray-300">• {corr}</p>
                      ))}
                    </div>
                  </div>
                )}
              </GlassPanel>
            );
          })}
        </div>
      ) : (
        <GlassPanel>
          <p className="text-gray-500 text-center py-4">No patterns generated yet for this period. Patterns are generated automatically on a schedule.</p>
        </GlassPanel>
      )}
    </div>
  );
}
