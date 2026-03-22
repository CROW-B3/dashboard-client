'use client';

import { MetricsCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePermissions } from '@/hooks/use-permissions';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

export default function AnalyticsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const { data: permissions } = usePermissions(user?.id);

  const { data: summary, isLoading } = useQuery<InteractionSummary>({
    queryKey: ['interactions-summary', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`, { credentials: 'include' });
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Interactions"
          value={isLoading ? '...' : String(summary?.total ?? 0)}
          change=""
          changeType="neutral"
        />
        <MetricsCard
          title="Web"
          value={isLoading ? '...' : String(summary?.web ?? 0)}
          change=""
          changeType="info"
        />
        <MetricsCard
          title="CCTV"
          value={isLoading ? '...' : String(summary?.cctv ?? 0)}
          change=""
          changeType="info"
        />
        <MetricsCard
          title="Social"
          value={isLoading ? '...' : String(summary?.social ?? 0)}
          change=""
          changeType="info"
        />
      </div>

      <div className="flex gap-4">
        {permissions?.interactions && (
          <Link href="/dashboard/interactions" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors">
            View Interactions
          </Link>
        )}
        {permissions?.patterns && (
          <Link href="/dashboard/patterns" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm transition-colors">
            View Patterns
          </Link>
        )}
      </div>
    </div>
  );
}
