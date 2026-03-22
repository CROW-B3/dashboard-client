'use client';

import { ApiKeyInput, GlassPanel, SegmentedControl } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, ExternalLink, Plus, Trash2, Upload } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/use-current-user';
import { isAdmin, usePermissions, useUser } from '@/hooks/use-permissions';
import { buildProfilePictureUrl } from '@/lib/api';
import { apiKey } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const TABS = [
  { value: 'profile', label: 'Profile' },
  { value: 'api-keys', label: 'API Keys' },
  { value: 'billing', label: 'Billing' },
  { value: 'notifications', label: 'Notifications' },
];

interface ApiKeyRecord {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: Date | string;
  expiresAt?: Date | string | null;
}

interface BillingData {
  currentPeriodEnd?: string;
  currentPeriodStart?: string;
  plan?: string;
  status?: string;
  modules?: { web: boolean; cctv: boolean; social: boolean };
  billingPeriod?: string;
}

interface UserPreferences {
  emailPatternAlerts: boolean;
  emailBillingNotices: boolean;
  emailTeamInvites: boolean;
  emailWeeklyDigest: boolean;
}

type PreferenceKey = keyof UserPreferences;

interface NotificationItem {
  key: PreferenceKey;
  label: string;
  description: string;
}

const NOTIFICATION_ITEMS: NotificationItem[] = [
  { key: 'emailPatternAlerts', label: 'Pattern Alerts', description: 'Receive alerts when new patterns are identified' },
  { key: 'emailBillingNotices', label: 'Billing Updates', description: 'Notifications about subscription and billing changes' },
  { key: 'emailTeamInvites', label: 'Team Invites', description: 'Updates when team members join or change roles' },
  { key: 'emailWeeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of activity' },
];

const DEFAULT_PREFERENCES: UserPreferences = {
  emailPatternAlerts: true,
  emailBillingNotices: true,
  emailTeamInvites: true,
  emailWeeklyDigest: true,
};

export default function DashboardSettingsPage() {
  const { data: currentUser } = useCurrentUser();
  const { data: permissions } = usePermissions(currentUser?.id);
  const { data: user } = useUser(currentUser?.id);
  const orgId = currentUser?.organizationId;
  const orgUuid = currentUser?.orgUuid;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState('');
  const [keyName, setKeyName] = useState('');
  const [newKeyValue, setNewKeyValue] = useState<string | null>(null);
  const [avatarVersion, setAvatarVersion] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys'],
    queryFn: async () => {
      const res = await apiKey.list();
      return (res.data as ApiKeyRecord[]) || [];
    },
    enabled: activeTab === 'api-keys' && !!permissions?.apiKeyManagement,
  });

  const { data: preferences } = useQuery<UserPreferences>({
    queryKey: ['user-preferences', currentUser?.id],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/${currentUser!.id}/preferences`, {
        credentials: 'include',
      });
      if (!res.ok) return DEFAULT_PREFERENCES;
      return res.json();
    },
    enabled: activeTab === 'notifications' && !!currentUser?.id,
  });

  const { data: billing, isLoading: billingLoading } = useQuery<BillingData | null>({
    queryKey: ['billing', orgUuid],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgUuid}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: activeTab === 'billing' && !!orgUuid,
  });

  const saveProfileMutation = useMutation({
    mutationFn: async () => {
      if (!currentUser?.id) throw new Error('No user');
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/${currentUser.id}/profile`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name || user?.name }),
      });
      if (!res.ok) throw new Error('Request failed');
    },
    onSuccess: () => {
      toast.success('Profile updated');
      void queryClient.invalidateQueries({ queryKey: ['current-user'] });
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => toast.error('Failed to update profile'),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!currentUser?.id) throw new Error('No user');
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/${currentUser.id}/profile-picture`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
    },
    onSuccess: () => {
      toast.success('Profile picture updated');
      setAvatarVersion((v) => v + 1);
      void queryClient.invalidateQueries({ queryKey: ['current-user'] });
      void queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: () => toast.error('Failed to upload profile picture'),
  });

  const createKeyMutation = useMutation({
    mutationFn: async () => {
      const res = await apiKey.create({
        name: keyName,
        expiresIn: 60 * 60 * 24 * 365,
        metadata: { organizationId: orgId },
      });
      return res.data;
    },
    onSuccess: (data) => {
      if (data?.key) setNewKeyValue(data.key);
      toast.success('API key created');
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
      setKeyName('');
    },
    onError: () => toast.error('Failed to create API key'),
  });

  const revokeKeyMutation = useMutation({
    mutationFn: async (keyId: string) => {
      await apiKey.delete({ keyId });
    },
    onSuccess: () => {
      toast.success('API key revoked');
      void queryClient.invalidateQueries({ queryKey: ['api-keys'] });
    },
    onError: () => toast.error('Failed to revoke key'),
  });

  const handleSaveProfile = () => saveProfileMutation.mutate();
  const handleCreateKey = () => { if (keyName && orgId) createKeyMutation.mutate(); };
  const handleRevokeKey = (keyId: string) => revokeKeyMutation.mutate(keyId);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) uploadAvatarMutation.mutate(file);
  };

  const updatePreferenceMutation = useMutation({
    mutationFn: async (update: Partial<UserPreferences>) => {
      if (!currentUser?.id) throw new Error('No user');
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/${currentUser.id}/preferences`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) throw new Error('Request failed');
      return res.json() as Promise<UserPreferences>;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user-preferences', currentUser?.id], data);
      toast.success('Notification preference updated');
    },
    onError: () => toast.error('Failed to update preference'),
  });

  const handleToggleNotification = (key: PreferenceKey) => {
    const current = preferences ?? DEFAULT_PREFERENCES;
    updatePreferenceMutation.mutate({ [key]: !current[key] });
  };

  const visibleTabs = TABS.filter((tab) => {
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
            <div className="flex items-center gap-4">
              {user?.profilePictureUrl && currentUser?.id ? (
                <img src={`${buildProfilePictureUrl(currentUser.id)}?v=${avatarVersion}`} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center text-violet-300 font-semibold text-lg">
                  {(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadAvatarMutation.isPending}
                  className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {uploadAvatarMutation.isPending ? 'Uploading...' : 'Upload Photo'}
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Name</label>
              <input
                type="text"
                defaultValue={user?.name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-400"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              disabled={saveProfileMutation.isPending}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
            >
              {saveProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </GlassPanel>
      )}

      {activeTab === 'api-keys' && permissions?.apiKeyManagement && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">API Keys</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Key name (e.g. production-key)"
                value={keyName}
                onChange={(e) => setKeyName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateKey()}
              />
              <Button
                disabled={!keyName.trim() || createKeyMutation.isPending}
                onClick={handleCreateKey}
              >
                <Plus className="mr-1 h-4 w-4" />
                {createKeyMutation.isPending ? 'Creating...' : 'Create'}
              </Button>
            </div>
            {newKeyValue && (
              <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg">
                <p className="text-xs text-violet-300 mb-1">Save this key — it will not be shown again:</p>
                <ApiKeyInput apiKey={newKeyValue} />
              </div>
            )}
            <div className="space-y-2">
              {apiKeys?.map((k: ApiKeyRecord) => (
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
                    className="text-red-400 hover:text-red-300"
                    disabled={revokeKeyMutation.isPending}
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRevokeKey(k.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {(!apiKeys || apiKeys.length === 0) && (
                <p className="py-4 text-center text-sm text-gray-400">No API keys yet</p>
              )}
            </div>
          </div>
        </GlassPanel>
      )}

      {activeTab === 'billing' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Billing</h2>
          {billingLoading ? (
            <div className="space-y-2">
              {['a', 'b', 'c'].map((k) => (
                <div key={k} className="h-6 animate-pulse rounded-lg bg-white/5" />
              ))}
            </div>
          ) : billing ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 py-2">
                <span className="text-sm text-gray-400">Plan</span>
                <span className="rounded-full bg-white/10 border border-white/20 px-2 py-0.5 text-xs text-gray-300">
                  {billing.billingPeriod || 'Free'}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 py-2">
                <span className="text-sm text-gray-400">Status</span>
                <span className={`rounded-full px-2 py-0.5 text-xs ${billing.status === 'active' ? 'bg-green-500/20 text-green-300 border border-green-500/30' : 'bg-white/10 text-gray-300 border border-white/20'}`}>
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
              <Button asChild className="mt-2" variant="outline">
                <a href="/billing" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Manage Billing
                </a>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-gray-400">
              No billing information available. Visit the Billing page to set up your subscription.
            </p>
          )}
        </GlassPanel>
      )}

      {activeTab === 'notifications' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Notification Preferences</h2>
          <div className="space-y-3">
            {NOTIFICATION_ITEMS.map((item) => {
              const enabled = (preferences ?? DEFAULT_PREFERENCES)[item.key];
              return (
                <div
                  key={item.key}
                  className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex items-center gap-3">
                    <Bell className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-white">{item.label}</p>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleNotification(item.key)}
                    disabled={updatePreferenceMutation.isPending}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? 'bg-violet-600' : 'bg-white/20'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
