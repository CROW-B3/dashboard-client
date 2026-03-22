'use client';

import { GlassPanel, Header, StatusBadge, StatusIndicator } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertTriangle, Brain, Building2, Copy, Radio, RefreshCw, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface OrgData {
  id: string;
  name: string;
  slug?: string;
  apiKey?: string;
  createdAt?: string;
}

interface OrgContext {
  context?: string;
  updatedAt?: string;
  structuredData?: {
    summary?: string;
    keyProducts?: string;
    insights?: string;
  };
}

interface Member {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className={`text-sm ${mono ? 'font-mono text-xs text-gray-300' : 'text-white'}`}>
        {value}
      </span>
    </div>
  );
}

function CopyableId({ value }: { value: string }) {
  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-white/5">
      <span className="text-sm text-gray-400">Organization ID</span>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 rounded-md px-2 py-1 text-xs font-mono text-gray-300 transition-colors hover:bg-white/10"
      >
        <span className="max-w-[180px] truncate">{value}</span>
        <Copy className="h-3 w-3 flex-shrink-0 text-gray-500" />
      </button>
    </div>
  );
}

function MemberRow({ member }: { member: Member }) {
  const initials = (member.name || member.email || 'U').slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-violet-500/20 text-xs font-medium text-violet-300">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-white truncate">{member.name}</p>
          <p className="text-xs text-gray-500 truncate">{member.email}</p>
        </div>
      </div>
      <StatusBadge variant={member.role === 'admin' ? 'info' : 'neutral'} size="sm">
        {member.role || 'member'}
      </StatusBadge>
    </div>
  );
}

function DataSourceRow({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-2">
        <StatusIndicator status={count > 0 ? 'active' : 'inactive'} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <span className="font-mono text-xs text-gray-400">{count} events</span>
    </div>
  );
}

export default function OrganizationPage() {
  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const queryClient = useQueryClient();
  const userInitials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const { data: org } = useQuery<OrgData | null>({
    queryKey: ['org', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: orgContext } = useQuery<OrgContext | null>({
    queryKey: ['org-context', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/context`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const betterAuthOrgId = user?.betterAuthOrgId;

  const { data: members } = useQuery<Member[]>({
    queryKey: ['members', orgId, betterAuthOrgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/auth/organization/get-full-organization`,
        { credentials: 'include' },
      );
      if (!res.ok) return [];
      const data = await res.json() as { members?: Array<{ id: string; role: string; user: { id: string; name: string; email: string; image: string | null } }> };
      return (data.members ?? []).map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
      }));
    },
    enabled: !!orgId && !!betterAuthOrgId,
  });

  const { data: interactionSummary } = useQuery<InteractionSummary>({
    queryKey: ['org-interaction-summary', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`,
        { credentials: 'include' },
      );
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const regenerateContextMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/context/trigger`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error('Request failed');
    },
    onSuccess: () => {
      toast.success('Context regeneration started');
      setTimeout(() => {
        void queryClient.invalidateQueries({ queryKey: ['org-context', orgId] });
      }, 5000);
    },
    onError: () => toast.error('Failed to regenerate context'),
  });

  const memberCount = Array.isArray(members) ? members.length : 0;
  const adminCount = Array.isArray(members) ? members.filter((m) => m.role === 'admin').length : 0;

  return (
    <div className="flex flex-col min-h-screen">
      <Header showNotification={false}
        orgName={org?.name || user?.orgName || 'Organization'}
        userInitials={userInitials}
        minimal
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-xl sm:text-2xl font-bold leading-7 sm:leading-8 text-white">
              Organization
            </h1>
            <p className="text-xs sm:text-sm font-normal leading-5 text-gray-400">
              Manage your organization details and team members.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <GlassPanel variant="heavy" className="lg:col-span-2">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Building2 className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">Organization Details</h2>
                </div>
                <div className="space-y-0">
                  <InfoRow label="Name" value={org?.name || '---'} />
                  {orgId && <CopyableId value={orgId} />}
                  {org?.slug && <InfoRow label="Slug" value={org.slug} mono />}
                  {org?.createdAt && (
                    <InfoRow
                      label="Created"
                      value={new Date(org.createdAt).toLocaleDateString()}
                    />
                  )}
                </div>
              </div>
            </GlassPanel>

            <GlassPanel variant="heavy">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Users className="h-5 w-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">Team</h2>
                </div>
                <div className="space-y-3">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                    <p className="text-2xl font-bold text-white">{memberCount}</p>
                    <p className="text-xs text-gray-400">Total Members</p>
                  </div>
                  <div className="flex gap-3">
                    <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-lg font-semibold text-violet-300">{adminCount}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Admins</p>
                    </div>
                    <div className="flex-1 rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                      <p className="text-lg font-semibold text-gray-300">{memberCount - adminCount}</p>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">Members</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <GlassPanel variant="heavy">
              <div className="p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Brain className="h-5 w-5 text-violet-400" />
                    <h2 className="text-lg font-semibold text-white">AI Context</h2>
                  </div>
                  <button
                    onClick={() => regenerateContextMutation.mutate()}
                    disabled={regenerateContextMutation.isPending}
                    className="flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${regenerateContextMutation.isPending ? 'animate-spin' : ''}`} />
                    {regenerateContextMutation.isPending ? 'Generating...' : 'Re-generate'}
                  </button>
                </div>
                {orgContext?.structuredData ? (
                  <div className="space-y-3 text-sm">
                    {orgContext.structuredData.summary && (
                      <p className="text-gray-300 leading-relaxed">{orgContext.structuredData.summary}</p>
                    )}
                    {orgContext.structuredData.keyProducts && (
                      <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Key Products</p>
                        <p className="text-gray-300 text-sm">{orgContext.structuredData.keyProducts}</p>
                      </div>
                    )}
                    {orgContext.structuredData.insights && (
                      <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
                        <p className="text-[10px] uppercase tracking-wider text-violet-400 mb-1">Insights</p>
                        <p className="text-violet-200 text-sm">{orgContext.structuredData.insights}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-gray-500 text-sm">No AI context generated yet.</p>
                    <p className="text-gray-600 text-xs mt-1">Connect data sources and trigger generation above.</p>
                  </div>
                )}
              </div>
            </GlassPanel>

            <GlassPanel variant="heavy">
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-3 mb-4">
                  <Radio className="h-5 w-5 text-emerald-400" />
                  <h2 className="text-lg font-semibold text-white">Data Sources</h2>
                </div>
                <div className="space-y-1">
                  <DataSourceRow label="Web" count={interactionSummary?.web ?? 0} />
                  <DataSourceRow label="CCTV" count={interactionSummary?.cctv ?? 0} />
                  <DataSourceRow label="Social" count={interactionSummary?.social ?? 0} />
                </div>
                <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-3 text-center">
                  <p className="text-lg font-bold text-white">{interactionSummary?.total ?? 0}</p>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">Total Events</p>
                </div>
              </div>
            </GlassPanel>
          </div>

          <GlassPanel variant="heavy" className="mb-6 sm:mb-8">
            <div className="p-4 sm:p-5">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-5 w-5 text-gray-400" />
                <h2 className="text-lg font-semibold text-white">Members</h2>
                <StatusBadge variant="neutral" size="sm">{memberCount}</StatusBadge>
              </div>
              {Array.isArray(members) && members.length > 0 ? (
                <div className="space-y-0">
                  {members.map((member) => (
                    <MemberRow key={member.id} member={member} />
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center">
                  <p className="text-gray-500 text-sm">No members found</p>
                </div>
              )}
            </div>
          </GlassPanel>

          <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 sm:p-5">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              <h2 className="text-lg font-semibold text-red-300">Danger Zone</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Leaving this organization will revoke your access to all shared data and resources.
              This action cannot be undone.
            </p>
            <button className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20">
              Leave Organization
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
