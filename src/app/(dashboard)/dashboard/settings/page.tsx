'use client';

import { GlassPanel } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Copy, ExternalLink, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiKey, useSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.api.crowai.dev';

interface ApiKeyRecord {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: Date | string;
  expiresAt?: Date | string | null;
}

interface BillingData {
  currentPeriodEnd?: string;
  plan?: string;
  portalUrl?: string;
  status?: string;
}

interface OrgMember {
  email?: string;
  id: string;
  name?: string;
  role?: string;
}

interface CreateApiKeyResponse {
  key?: string;
  [k: string]: unknown;
}

export default function DashboardSettingsPage() {
  const { data: session } = useSession();
  const { data: currentUser } = useCurrentUser();
  const orgId =
    (session?.session as { activeOrganizationId?: string })?.activeOrganizationId || '';
  const token = session?.session?.token || '';
  const orgName = currentUser?.orgName || (session?.session as { activeOrganizationName?: string })?.activeOrganizationName || 'Your Organization';
  const queryClient = useQueryClient();

  const [newKeyName, setNewKeyName] = useState('');
  const [createdKey, setCreatedKey] = useState<string | null>(null);

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
  };

  const { data: apiKeys, isLoading: apiKeysLoading } = useQuery<ApiKeyRecord[]>({
    enabled: !!orgId,
    queryFn: async () => {
      const res = await apiKey.list();
      return (res.data as ApiKeyRecord[]) || [];
    },
    queryKey: ['api-keys', orgId],
  });

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData | null>({
    enabled: !!orgId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/billing/subscription/${orgId}`, {
        headers,
      });
      if (!res.ok) return null;
      return res.json();
    },
    queryKey: ['billing', orgId],
  });

  const { data: members, isLoading: membersLoading } = useQuery<OrgMember[]>({
    enabled: !!orgId,
    queryFn: async () => {
      const res = await fetch(`${API_URL}/api/v1/organizations/${orgId}/members`, {
        headers,
      });
      if (!res.ok) return [];
      return res.json();
    },
    queryKey: ['org-members', orgId],
  });

  const createKeyMutation = useMutation<CreateApiKeyResponse, Error, string>({
    mutationFn: async (name: string) => {
      const res = await fetch(`${API_URL}/api/v1/auth/api-key/create`, {
        body: JSON.stringify({
          name,
          expiresIn: 60 * 60 * 24 * 365,
          metadata: { organizationId: orgId },
        }),
        headers: { ...headers, 'Content-Type': 'application/json' },
        method: 'POST',
      });
      if (!res.ok) throw new Error('Failed to create API key');
      return res.json() as Promise<CreateApiKeyResponse>;
    },
    onError: () => {
      toast.error('Failed to create API key');
    },
    onSuccess: (data) => {
      if (data?.key) setCreatedKey(data.key);
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
      setNewKeyName('');
      toast.success('API key created');
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiKey.delete({ keyId });
    },
    onError: () => {
      toast.error('Failed to revoke API key');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['api-keys', orgId] });
      toast.success('API key revoked');
    },
  });

  const handleCreateKey = () => {
    if (!newKeyName.trim()) return;
    createKeyMutation.mutate(newKeyName.trim());
  };

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success('Key copied to clipboard');
  };

  const skeletonRows = ['a', 'b', 'c'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-400">
          Manage your organization settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api-keys">API Keys</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent className="mt-6 space-y-6" value="general">
          <GlassPanel className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Organization</h2>
              <p className="text-sm text-gray-400">General information about your organization</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-1">
                <p className="text-sm font-medium text-white">Organization Name</p>
                <p className="text-sm text-gray-400">{orgName}</p>
              </div>
              {orgId && (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-white">Organization ID</p>
                  <p className="font-mono text-xs text-gray-400">{orgId}</p>
                </div>
              )}
            </div>
          </GlassPanel>

          <GlassPanel className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Members</h2>
              <p className="text-sm text-gray-400">People in your organization</p>
            </div>
            {membersLoading ? (
              <div className="space-y-2">
                {skeletonRows.map((k) => (
                  <div key={k} className="h-10 animate-pulse rounded-lg bg-white/5" />
                ))}
              </div>
            ) : !members || members.length === 0 ? (
              <p className="text-sm text-gray-400">No members found</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {member.name || member.email || member.id}
                      </p>
                      {member.email && member.name && (
                        <p className="text-xs text-gray-400">{member.email}</p>
                      )}
                    </div>
                    {member.role && (
                      <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs text-gray-300">
                        {member.role}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </GlassPanel>
        </TabsContent>

        <TabsContent className="mt-6 space-y-6" value="api-keys">
          <GlassPanel className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">API Keys</h2>
              <p className="text-sm text-gray-400">
                Manage API keys for programmatic access to CROW
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Key name (e.g. production-key)"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
                />
                <Button
                  disabled={!newKeyName.trim() || createKeyMutation.isPending}
                  onClick={handleCreateKey}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  {createKeyMutation.isPending ? 'Creating...' : 'Create'}
                </Button>
              </div>

              {createdKey && (
                <div className="space-y-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                  <p className="text-xs font-medium text-green-400">
                    Save this key now — it will not be shown again
                  </p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 break-all rounded bg-white/5 px-2 py-1 text-xs text-gray-300">
                      {createdKey}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyKey(createdKey)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}

              {apiKeysLoading ? (
                <div className="space-y-2">
                  {skeletonRows.map((k) => (
                    <div key={k} className="h-14 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : !apiKeys || apiKeys.length === 0 ? (
                <p className="py-4 text-center text-sm text-gray-400">
                  No API keys yet
                </p>
              ) : (
                <div className="space-y-2">
                  {apiKeys.map((k) => (
                    <div
                      key={k.id}
                      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-white">{k.name || 'Unnamed key'}</p>
                        <p className="text-xs text-gray-400">
                          Created {new Date(k.createdAt).toLocaleDateString()}
                          {k.start && ` · ${k.start}...`}
                        </p>
                      </div>
                      <Button
                        className="text-destructive hover:text-destructive"
                        disabled={revokeKeyMutation.isPending}
                        size="sm"
                        variant="ghost"
                        onClick={() => revokeKeyMutation.mutate(k.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </GlassPanel>
        </TabsContent>

        <TabsContent className="mt-6" value="billing">
          <GlassPanel className="p-6">
            <div className="mb-4">
              <h2 className="text-base font-semibold text-white">Billing</h2>
              <p className="text-sm text-gray-400">Manage your subscription and billing</p>
            </div>
            <div className="space-y-4">
              {billingLoading ? (
                <div className="space-y-2">
                  {skeletonRows.map((k) => (
                    <div key={k} className="h-6 animate-pulse rounded-lg bg-white/5" />
                  ))}
                </div>
              ) : billing ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-white/10 py-2">
                    <span className="text-sm text-gray-400">Plan</span>
                    <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs text-gray-300">
                      {billing.plan || 'Free'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 py-2">
                    <span className="text-sm text-gray-400">Status</span>
                    <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs text-gray-300">
                      {billing.status || 'Unknown'}
                    </span>
                  </div>
                  {billing.currentPeriodEnd && (
                    <div className="flex items-center justify-between border-b border-white/10 py-2">
                      <span className="text-sm text-gray-400">Renews</span>
                      <span className="text-sm text-white">
                        {new Date(billing.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  {billing.portalUrl && (
                    <Button asChild className="mt-2" variant="outline">
                      <a href={billing.portalUrl} rel="noopener noreferrer" target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Open Billing Portal
                      </a>
                    </Button>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-400">
                  No billing information available. Contact support to manage your
                  subscription.
                </p>
              )}
            </div>
          </GlassPanel>
        </TabsContent>
      </Tabs>
    </div>
  );
}
