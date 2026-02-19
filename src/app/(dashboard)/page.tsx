'use client';

import { GlassPanel, MetricsCard } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { Clock, Globe, Package, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function OverviewPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;

  const { data: products } = useQuery({
    queryKey: ['products-count', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/products/organization/${orgId}?page=1&pageSize=1`, { credentials: 'include' });
      if (!res.ok) return { total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: members } = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/members`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: orgContext } = useQuery({
    queryKey: ['org-context', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/context`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: crawlerJobs } = useQuery({
    queryKey: ['crawler-jobs', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/crawler-jobs/organization/${orgId}`, { credentials: 'include' });
      if (!res.ok) return { jobs: [] };
      return res.json();
    },
    enabled: !!orgId,
  });

  const lastJob = crawlerJobs?.jobs?.[crawlerJobs.jobs.length - 1];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Overview</h1>
        <p className="text-gray-400 text-sm mt-1">Your organization at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Total Products"
          value={products?.total ?? 0}
          icon={<Package className="w-5 h-5" />}
        />
        <MetricsCard
          title="Team Members"
          value={Array.isArray(members) ? members.length : 0}
          icon={<Users className="w-5 h-5" />}
        />
        <MetricsCard
          title="Active Sources"
          value={crawlerJobs?.jobs?.filter((j: { status: string }) => j.status === 'completed').length ?? 0}
          icon={<Globe className="w-5 h-5" />}
        />
        <MetricsCard
          title="Last Crawl"
          value={lastJob ? new Date(lastJob.completedAt || lastJob.createdAt).toLocaleDateString() : 'Never'}
          icon={<Clock className="w-5 h-5" />}
        />
      </div>

      {orgContext?.structuredData && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-3">AI Organization Summary</h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            {orgContext.structuredData.summary || 'No summary available yet.'}
          </p>
        </GlassPanel>
      )}
    </div>
  );
}
