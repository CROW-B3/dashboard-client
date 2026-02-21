'use client';

import { GlassPanel } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePermissions } from '@/hooks/use-permissions';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function AnalyticsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const { data: permissions } = usePermissions(user?.id);

  const { data: summary } = useQuery<Record<string, number | string> | null>({
    queryKey: ['interactions-summary', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Insights from your data sources</p>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(summary).map(([key, value]) => (
            <GlassPanel key={key}>
              <p className="text-gray-400 text-sm capitalize">{key}</p>
              <p className="text-2xl font-bold text-white mt-1">{String(value)}</p>
            </GlassPanel>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        {permissions?.interactions && (
          <Link href="/analytics/interactions" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors">
            View Interactions
          </Link>
        )}
        {permissions?.patterns && (
          <Link href="/analytics/patterns" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
            View Patterns
          </Link>
        )}
      </div>
    </div>
  );
}
