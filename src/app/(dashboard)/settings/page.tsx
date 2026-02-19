'use client';

import { ApiKeyInput, GlassPanel, SegmentedControl } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isAdmin, usePermissions, useUser  } from '@/hooks/use-permissions';
import { apiKey } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'api-keys', label: 'API Keys' },
  { value: 'billing', label: 'Billing' },
];

export default function SettingsPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: permissions } = usePermissions(currentUser?.id);
  const { data: user } = useUser(currentUser?.id);
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [keyName, setKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const orgId = currentUser?.organizationId;

  const { data: apiKeys, refetch: refetchKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await apiKey.list();
      return res.data?.apiKeys || [];
    },
    enabled: activeTab === 'api-keys' && !!permissions?.apiKeyManagement,
  });

  const { data: billing } = useQuery({
    queryKey: ['billing', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgId}`, { credentials: 'include' });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: activeTab === 'billing' && !!orgId,
  });

  const handleSaveProfile = async () => {
    if (!currentUser?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/${currentUser.id}/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || user?.name }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success('Profile updated');
    } catch {
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateKey = async () => {
    if (!keyName || !orgId) return;
    setCreating(true);
    try {
      const res = await apiKey.create({
        name: keyName,
        expiresIn: 60 * 60 * 24 * 365,
        metadata: { organizationId: orgId },
      });
      if (res.data?.key) {
        setNewKeyValue(res.data.key);
        toast.success('API key created');
        refetchKeys();
        setKeyName('');
      }
    } catch {
      toast.error('Failed to create API key');
    } finally {
      setCreating(false);
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    try {
      await apiKey.revoke({ keyId });
      toast.success('API key revoked');
      refetchKeys();
    } catch {
      toast.error('Failed to revoke key');
    }
  };

  const visibleTabs = TABS.filter(tab => {
    if (tab.value === 'api-keys') return permissions?.apiKeyManagement;
    if (tab.value === 'billing') return isAdmin(user);
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      <SegmentedControl
        options={visibleTabs}
        value={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'profile' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Profile</h2>
          <div className="space-y-4">
            {user?.profilePictureUrl && (
              <img src={user.profilePictureUrl} alt="Profile" className="w-16 h-16 rounded-full" />
            )}
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                onChange={e => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Email</label>
              <input type="email" value={user?.email || ''} disabled className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400" />
            </div>
            <button onClick={handleSaveProfile} disabled={saving} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </GlassPanel>
      )}

      {activeTab === 'api-keys' && permissions?.apiKeyManagement && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">API Keys</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Key name..."
                value={keyName}
                onChange={e => setKeyName(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
              <button onClick={handleCreateKey} disabled={!keyName || creating} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50">
                {creating ? 'Creating...' : 'Create Key'}
              </button>
            </div>
            {newKeyValue && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <p className="text-xs text-violet-300 mb-1">Save this key — it won't be shown again:</p>
                <ApiKeyInput value={newKeyValue} />
              </div>
            )}
            <div className="space-y-2">
              {apiKeys?.map((k: { id: string; name: string; createdAt: string; start: string }) => (
                <div key={k.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/10 rounded-lg">
                  <div>
                    <p className="text-sm text-white">{k.name}</p>
                    <p className="text-xs text-gray-500">{new Date(k.createdAt).toLocaleDateString()} · {k.start}...</p>
                  </div>
                  <button onClick={() => handleRevokeKey(k.id)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Revoke</button>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      )}

      {activeTab === 'billing' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Billing</h2>
          {billing ? (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Plan</span>
                <span className="text-white">{billing.plan || 'Free'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Status</span>
                <span className="text-green-400">{billing.status || 'Active'}</span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No billing information available.</p>
          )}
        </GlassPanel>
      )}
    </div>
  );
}
