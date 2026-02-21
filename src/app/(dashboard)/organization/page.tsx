'use client';

import { GlassPanel, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function OrganizationPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [regenerating, setRegenerating] = useState(false);

  const { data: org } = useQuery<{ id: string; name: string; slug?: string; apiKey?: string } | null>({
    queryKey: ['org', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: orgContext, refetch: refetchContext } = useQuery<{ context?: string; updatedAt?: string; structuredData?: { summary?: string; keyProducts?: string; insights?: string } } | null>({
    queryKey: ['org-context', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/context`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: members } = useQuery<{ id: string; name: string; email: string; role?: string }[]>({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/members`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const handleRegenerateContext = async () => {
    if (!orgId) return;
    setRegenerating(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/context/trigger`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success('Context regeneration started');
      setTimeout(() => refetchContext(), 5000);
    } catch {
      toast.error('Failed to regenerate context');
    } finally {
      setRegenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Organization</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your organization details</p>
      </div>

      <GlassPanel>
        <h2 className="text-lg font-semibold text-white mb-3">Organization Info</h2>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Name</span>
            <span className="text-white">{org?.name || '—'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">ID</span>
            <span className="text-gray-300 font-mono text-xs">{orgId || '—'}</span>
          </div>
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-white">AI Context</h2>
          <button
            onClick={handleRegenerateContext}
            disabled={regenerating}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
          >
            {regenerating ? 'Generating...' : 'Re-generate'}
          </button>
        </div>
        {orgContext?.structuredData ? (
          <div className="space-y-3 text-sm">
            {orgContext.structuredData.summary && (
              <p className="text-gray-300 leading-relaxed">{orgContext.structuredData.summary}</p>
            )}
            {orgContext.structuredData.keyProducts && (
              <div>
                <p className="text-gray-400 mb-1">Key Products</p>
                <p className="text-gray-300">{orgContext.structuredData.keyProducts}</p>
              </div>
            )}
            {orgContext.structuredData.insights && (
              <div>
                <p className="text-gray-400 mb-1">Insights</p>
                <p className="text-gray-300">{orgContext.structuredData.insights}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No AI context generated yet. Connect products and trigger generation.</p>
        )}
      </GlassPanel>

      <GlassPanel>
        <h2 className="text-lg font-semibold text-white mb-3">Members</h2>
        <div className="space-y-2">
          {Array.isArray(members) && members.map((member: { id: string; name: string; email: string; role?: string }) => (
            <div key={member.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <div>
                <p className="text-sm text-white">{member.name}</p>
                <p className="text-xs text-gray-400">{member.email}</p>
              </div>
              <StatusBadge>{member.role}</StatusBadge>
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
