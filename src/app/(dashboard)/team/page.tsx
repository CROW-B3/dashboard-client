'use client';

import { EmailTagInput, GlassPanel, Header, StatusBadge } from '@b3-crow/ui-kit';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { TeamFilterBar } from '@/components/team/TeamFilterBar';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

interface BetterAuthMember {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface OrgMember {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  profilePictureUrl: string | null;
}

interface InvitationItem { id: string; email: string; role: string; status: string }
interface EmailSuggestion { email: string; name: string }

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

const INVITE_ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: 'admin', label: 'Admin' },
  { value: 'member', label: 'Member' },
  { value: 'viewer', label: 'Viewer' },
];

// SVG chevron data-URI used inside native <select> as custom arrow
const CHEVRON_SVG = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' fill='none'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%236B7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E\")";

function getRoleBadgeVariant(role: string): 'high' | 'info' | 'neutral' | 'low' {
  switch (role.toLowerCase()) {
    case 'owner': return 'high';
    case 'admin': return 'info';
    case 'member': return 'neutral';
    default: return 'low';
  }
}

function getInitials(name: string, email: string): string {
  const source = (name || email).trim();
  const parts = source.split(/\s+/);
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return (parts[0][0]! + parts[1][0]!).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function getRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
}

function MemberAvatar({ name, email }: { name: string; email: string }) {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: 'rgba(76, 29, 149, 0.40)',
        boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0.10)',
      }}
    >
      <span className="text-xs font-semibold text-white">
        {getInitials(name, email)}
      </span>
    </div>
  );
}

function InvitedAvatar() {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ outline: '1px #4B5563 solid', outlineOffset: '-1px' }}
    >
      <User size={16} color="#6B7280" />
    </div>
  );
}

function ActiveStatusBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{
        background: 'rgba(16, 185, 129, 0.10)',
        outline: '1px rgba(16, 185, 129, 0.20) solid',
        outlineOffset: '-1px',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#34D399' }} />
      <span style={{ color: '#34D399' }}>Active</span>
    </span>
  );
}

function InvitedStatusBadge() {
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{
        background: 'rgba(107, 114, 128, 0.10)',
        outline: '1px rgba(107, 114, 128, 0.20) solid',
        outlineOffset: '-1px',
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#6B7280' }} />
      <span style={{ color: '#9CA3AF' }}>Invited</span>
    </span>
  );
}

const fetchEmailSuggestions = async (prefix: string): Promise<EmailSuggestion[]> => {
  if (prefix.length < 2) return [];
  const res = await fetch(
    `${API_GATEWAY_URL}/api/v1/users/search-email?q=${encodeURIComponent(prefix)}`,
    { credentials: 'include' },
  );
  if (!res.ok) return [];
  const data = await res.json() as { users: EmailSuggestion[] };
  return data.users ?? [];
};

function useDebounced(value: string, delayMs: number): string {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}

export default function TeamPage() {
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { toggle } = useMobileSidebar();
  const orgId = user?.organizationId;
  const betterAuthOrgId = user?.betterAuthOrgId;

  const [showInviteSection, setShowInviteSection] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);
  const [inviteRole, setInviteRole] = useState<string>('member');
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [memberSearch, setMemberSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounced(searchInput, 300);

  // Optimistic role state while PATCH is in-flight
  const [pendingRoles, setPendingRoles] = useState<Record<string, string>>({});
  // Two-step remove confirmation: memberId -> true when user clicked Remove once
  const [confirmRemove, setConfirmRemove] = useState<Record<string, boolean>>({});

  const isAdminOrOwner = user?.role === 'admin';

  const { data: suggestions } = useQuery({
    queryKey: ['email-suggestions', debouncedSearch],
    queryFn: () => fetchEmailSuggestions(debouncedSearch),
    enabled: debouncedSearch.length >= 2,
    staleTime: 10_000,
  });

  const filteredSuggestions = (suggestions ?? []).filter(
    (s) => !emails.includes(s.email),
  );

  const handleInputChange = useCallback((value: string) => {
    setSearchInput(value);
    setShowSuggestions(value.length >= 2);
  }, []);

  const handleSelectSuggestion = useCallback((email: string) => {
    if (!emails.includes(email)) setEmails((prev) => [...prev, email]);
    setSearchInput('');
    setShowSuggestions(false);
  }, [emails]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target as Node))
        setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { data: members = [], isLoading: membersLoading } = useQuery<OrgMember[]>({
    queryKey: ['members', orgId, betterAuthOrgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/auth/organization/get-full-organization`,
        { credentials: 'include' },
      );
      if (!res.ok) return [];
      const data = await res.json() as { members?: BetterAuthMember[] };
      return (data.members ?? []).map((m) => ({
        id: m.id,
        name: m.user.name,
        email: m.user.email,
        role: m.role,
        createdAt: m.createdAt,
        profilePictureUrl: m.user.image,
      }));
    },
    enabled: !!orgId,
  });

  const { data: invitationsData } = useQuery<{ invitations: InvitationItem[] }>({
    queryKey: ['invitations', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/auth/team-invitations/list-invitations?organizationId=${orgId}`,
        { credentials: 'include' },
      );
      if (!res.ok) return { invitations: [] };
      return res.json() as Promise<{ invitations: InvitationItem[] }>;
    },
    enabled: !!orgId,
  });

  const pendingInvitations: InvitationItem[] =
    invitationsData?.invitations?.filter((inv) => inv.status === 'pending') ?? [];

  // ---- Mutations ----

  const inviteMutation = useMutation({
    mutationFn: async ({ emailList, role }: { emailList: string[]; role: string }) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/team-invitations/send-invites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          role,
          organizationId: orgId,
          organizationName: user?.orgName ?? '',
          inviterName: user?.name ?? 'Team Admin',
          inviterId: user!.betterAuthUserId,
          permissions: { interactions: true },
        }),
      });
      if (!res.ok) throw new Error('Request failed');
    },
    onSuccess: (_, { emailList }) => {
      toast.success(`Invited ${emailList.length} member(s)`);
      setEmails([]);
      setShowInviteSection(false);
      void queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      void queryClient.invalidateQueries({ queryKey: ['invitations', orgId] });
    },
    onError: () => toast.error('Failed to send invitations'),
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/organization/update-member-role`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, role }),
      });
      if (!res.ok) throw new Error('Failed to update role');
    },
    onMutate: ({ memberId, role }) => {
      setPendingRoles((prev) => ({ ...prev, [memberId]: role }));
    },
    onSuccess: (_, { memberId }) => {
      toast.success('Role updated');
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ['members', orgId, betterAuthOrgId] });
    },
    onError: (_, { memberId }) => {
      toast.error('Failed to update role');
      setPendingRoles((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/organization/remove-member`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) throw new Error('Failed to remove member');
    },
    onSuccess: (_, memberId) => {
      toast.success('Member removed');
      setConfirmRemove((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ['members', orgId, betterAuthOrgId] });
    },
    onError: (_, memberId) => {
      toast.error('Failed to remove member');
      setConfirmRemove((prev) => {
        const next = { ...prev };
        delete next[memberId];
        return next;
      });
    },
  });

  // ---- Handlers ----

  const handleInvite = () => {
    if (!emails.length || !orgId || !user?.betterAuthUserId) {
      if (!user?.betterAuthUserId) toast.error('Session expired. Please refresh the page.');
      return;
    }
    inviteMutation.mutate({ emailList: emails, role: inviteRole });
  };

  const handleRoleChange = (memberId: string, newRole: string) => {
    updateRoleMutation.mutate({ memberId, role: newRole });
  };

  const handleRemoveMember = (memberId: string) => {
    if (!confirmRemove[memberId]) {
      setConfirmRemove((prev) => ({ ...prev, [memberId]: true }));
      setTimeout(() => {
        setConfirmRemove((prev) => {
          const next = { ...prev };
          delete next[memberId];
          return next;
        });
      }, 4000);
      return;
    }
    removeMemberMutation.mutate(memberId);
  };

  // ---- Filtering ----

  const filteredMembers = members.filter((m) => {
    const search = memberSearch.toLowerCase();
    const matchesSearch =
      !search ||
      m.name.toLowerCase().includes(search) ||
      m.email.toLowerCase().includes(search);
    const matchesRole =
      roleFilter === 'all' || m.role.toLowerCase() === roleFilter.toLowerCase();
    // Active members: status filter "active" or "all"
    const matchesStatus = statusFilter === 'all' || statusFilter === 'active';
    return matchesSearch && matchesRole && matchesStatus;
  });

  const filteredInvitations = pendingInvitations.filter((inv) => {
    const search = memberSearch.toLowerCase();
    const matchesSearch = !search || inv.email.toLowerCase().includes(search);
    const matchesRole =
      roleFilter === 'all' || inv.role.toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || statusFilter === 'invited';
    return matchesSearch && matchesRole && matchesStatus;
  });

  const totalCount = filteredMembers.length + filteredInvitations.length;

  // ---- Render ----

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        userInitials={(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
        showNotification={false}
        minimal
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
        onAvatarClick={() => router.push('/dashboard/settings')}
      />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">

          {/* Page heading */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Team</h1>
              <p className="text-gray-400 text-sm mt-1">Manage users and permissions in your workspace</p>
            </div>
            <button
              onClick={() => setShowInviteSection((v) => !v)}
              className="h-9 px-4 bg-violet-600 hover:bg-violet-700 active:bg-violet-800 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap self-start sm:self-auto"
            >
              Invite members
            </button>
          </div>

          {/* ---- Invite section (collapsible) ---- */}
          {showInviteSection && (
            <GlassPanel className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-base font-semibold text-white">Invite Members</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Add people to your organization by email address</p>
                </div>
                <button
                  onClick={() => setShowInviteSection(false)}
                  className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
                  aria-label="Close invite section"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3">
                <div className="relative" ref={suggestionsRef}>
                  <EmailTagInput
                    emails={emails}
                    onEmailsChange={setEmails}
                    onInputChange={handleInputChange}
                  >
                    {showSuggestions && filteredSuggestions.length > 0 && (
                      <div className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-lg">
                        {filteredSuggestions.map((s) => (
                          <button
                            key={s.email}
                            type="button"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => handleSelectSuggestion(s.email)}
                            className="w-full text-left px-4 py-2.5 hover:bg-white/5 transition-colors"
                          >
                            <p className="text-sm text-white">{s.name}</p>
                            <p className="text-xs text-gray-400">{s.email}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </EmailTagInput>
                </div>

                <div className="flex items-center gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    <label htmlFor="invite-role" className="text-xs text-gray-400 whitespace-nowrap">
                      Invite as
                    </label>
                    <select
                      id="invite-role"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      className="h-8 px-2.5 pr-7 rounded-lg text-xs text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer"
                      style={{
                        backgroundImage: CHEVRON_SVG,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 8px center',
                      }}
                    >
                      {INVITE_ROLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-zinc-900">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleInvite}
                    disabled={!emails.length || inviteMutation.isPending}
                    className="h-8 px-4 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {inviteMutation.isPending ? 'Sending...' : 'Send Invitations'}
                  </button>
                </div>
              </div>
            </GlassPanel>
          )}

          {/* ---- Members table ---- */}
          <GlassPanel className="overflow-hidden">
            {/* Filter bar */}
            <div className="px-6 py-4 border-b border-white/[0.06]">
              <TeamFilterBar
                onSearch={setMemberSearch}
                onRoleChange={setRoleFilter}
                onStatusChange={setStatusFilter}
                roleOptions={[
                  { label: 'Role: All', value: 'all' },
                  { label: 'Owner', value: 'owner' },
                  { label: 'Admin', value: 'admin' },
                  { label: 'Member', value: 'member' },
                  { label: 'Viewer', value: 'viewer' },
                ]}
              />
            </div>

            {/* Table */}
            {membersLoading ? (
              <div className="py-12 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-violet-500/30 border-t-violet-400 animate-spin" />
              </div>
            ) : totalCount === 0 ? (
              <div className="py-12 text-center">
                <p className="text-sm text-gray-500">No members found</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block">
                  {/* Table header */}
                  <div
                    className="h-[40px] flex items-center px-6 border-b"
                    style={{
                      background: 'rgba(255, 255, 255, 0.02)',
                      borderColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <div className="flex-[2] min-w-0 text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
                      Member
                    </div>
                    <div className="flex-[2] min-w-0 text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
                      Email
                    </div>
                    <div className="w-[120px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
                      Role
                    </div>
                    <div className="w-[110px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
                      Status
                    </div>
                    <div className="w-[130px] shrink-0 text-[10px] font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
                      Last Active
                    </div>
                    <div className="w-[80px] shrink-0" />
                  </div>

                  {/* Active members */}
                  {filteredMembers.map((member) => {
                    const isOwner = member.role === 'owner';
                    const displayRole = pendingRoles[member.id] ?? member.role;
                    const isPendingRole = !!pendingRoles[member.id];
                    const isCurrentUser = member.email === user?.email;
                    const canEditThisMember = isAdminOrOwner && !isOwner && !isCurrentUser;

                    return (
                      <div
                        key={member.id}
                        className="h-[57px] flex items-center px-6 border-t transition-colors hover:bg-white/[0.02] group"
                        style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        {/* Member */}
                        <div className="flex-[2] min-w-0 flex items-center gap-3">
                          <MemberAvatar name={member.name} email={member.email} />
                          <span className="text-sm font-medium text-white truncate">
                            {member.name}
                            {isCurrentUser && (
                              <span className="ml-1.5 text-[10px] text-gray-500 font-normal">(you)</span>
                            )}
                          </span>
                        </div>

                        {/* Email */}
                        <div className="flex-[2] min-w-0">
                          <span className="text-sm text-gray-400 truncate block">{member.email}</span>
                        </div>

                        {/* Role */}
                        <div className="w-[120px] shrink-0">
                          {canEditThisMember ? (
                            <div className="relative inline-flex">
                              <select
                                value={displayRole}
                                onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                disabled={isPendingRole}
                                className="h-7 pl-2.5 pr-7 rounded-md text-xs text-white bg-white/[0.04] border border-white/10 focus:outline-none focus:border-violet-500/50 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed transition-colors hover:border-white/20"
                                style={{
                                  backgroundImage: CHEVRON_SVG,
                                  backgroundRepeat: 'no-repeat',
                                  backgroundPosition: 'right 6px center',
                                }}
                              >
                                {ROLE_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value} className="bg-zinc-900">
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              {isPendingRole && (
                                <div className="absolute inset-0 flex items-center justify-center rounded-md bg-black/20 pointer-events-none">
                                  <div className="w-3 h-3 rounded-full border border-violet-400/40 border-t-violet-400 animate-spin" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <StatusBadge variant={getRoleBadgeVariant(displayRole)} uppercase tracking>
                              {displayRole}
                            </StatusBadge>
                          )}
                        </div>

                        {/* Status */}
                        <div className="w-[110px] shrink-0">
                          <ActiveStatusBadge />
                        </div>

                        {/* Last Active */}
                        <div className="w-[130px] shrink-0">
                          <span className="text-sm text-gray-400">
                            {getRelativeTime(member.createdAt)}
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="w-[80px] shrink-0 flex items-center justify-end">
                          {canEditThisMember && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removeMemberMutation.isPending}
                              className={
                                confirmRemove[member.id]
                                  ? 'px-2.5 py-1 rounded-md text-[11px] text-white bg-rose-600/80 border border-rose-500/50 transition-all duration-150 disabled:cursor-not-allowed'
                                  : 'opacity-0 group-hover:opacity-100 px-2.5 py-1 rounded-md text-[11px] text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-all duration-150 disabled:cursor-not-allowed focus:opacity-100'
                              }
                            >
                              {confirmRemove[member.id] ? 'Confirm?' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Pending invitations in table */}
                  {filteredInvitations.map((inv) => (
                    <div
                      key={inv.id}
                      className="h-[57px] flex items-center px-6 border-t transition-colors hover:bg-white/[0.02]"
                      style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
                    >
                      {/* Member */}
                      <div className="flex-[2] min-w-0 flex items-center gap-3">
                        <InvitedAvatar />
                        <span className="text-sm font-medium text-gray-400 italic truncate">
                          {inv.email}
                        </span>
                      </div>

                      {/* Email */}
                      <div className="flex-[2] min-w-0">
                        <span className="text-sm text-gray-500 italic truncate block">{inv.email}</span>
                      </div>

                      {/* Role */}
                      <div className="w-[120px] shrink-0">
                        <StatusBadge variant={getRoleBadgeVariant(inv.role)} uppercase tracking>
                          {inv.role}
                        </StatusBadge>
                      </div>

                      {/* Status */}
                      <div className="w-[110px] shrink-0">
                        <InvitedStatusBadge />
                      </div>

                      {/* Last Active */}
                      <div className="w-[130px] shrink-0">
                        <span className="text-sm text-gray-600">—</span>
                      </div>

                      {/* Actions */}
                      <div className="w-[80px] shrink-0" />
                    </div>
                  ))}
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-white/[0.05]">
                  {filteredMembers.map((member) => {
                    const isOwner = member.role === 'owner';
                    const displayRole = pendingRoles[member.id] ?? member.role;
                    const isCurrentUser = member.email === user?.email;
                    const canEditThisMember = isAdminOrOwner && !isOwner && !isCurrentUser;

                    return (
                      <div key={member.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0 flex-1">
                            <MemberAvatar name={member.name} email={member.email} />
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-white truncate">
                                {member.name}
                                {isCurrentUser && (
                                  <span className="ml-1.5 text-[10px] text-gray-500 font-normal">(you)</span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500 truncate mt-0.5">{member.email}</p>
                            </div>
                          </div>
                          <ActiveStatusBadge />
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <StatusBadge variant={getRoleBadgeVariant(displayRole)} uppercase tracking>
                              {displayRole}
                            </StatusBadge>
                            <span className="text-xs text-gray-500">{getRelativeTime(member.createdAt)}</span>
                          </div>
                          {canEditThisMember && (
                            <button
                              type="button"
                              onClick={() => handleRemoveMember(member.id)}
                              disabled={removeMemberMutation.isPending}
                              className={
                                confirmRemove[member.id]
                                  ? 'px-2.5 py-1 rounded-md text-[11px] text-white bg-rose-600/80 border border-rose-500/50 transition-colors disabled:cursor-not-allowed'
                                  : 'px-2.5 py-1 rounded-md text-[11px] text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 transition-colors disabled:cursor-not-allowed'
                              }
                            >
                              {confirmRemove[member.id] ? 'Confirm?' : 'Remove'}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {filteredInvitations.map((inv) => (
                    <div key={inv.id} className="p-4 hover:bg-white/[0.02] transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <InvitedAvatar />
                          <p className="text-sm text-gray-400 italic truncate">{inv.email}</p>
                        </div>
                        <InvitedStatusBadge />
                      </div>
                      <StatusBadge variant={getRoleBadgeVariant(inv.role)} uppercase tracking>
                        {inv.role}
                      </StatusBadge>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Footer count */}
            {totalCount > 0 && (
              <div
                className="px-6 py-3 border-t flex items-center"
                style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}
              >
                <span className="text-xs text-gray-500">
                  {totalCount} member{totalCount !== 1 ? 's' : ''}
                  {pendingInvitations.length > 0 && ` (${pendingInvitations.length} pending)`}
                </span>
              </div>
            )}
          </GlassPanel>

        </div>
      </main>
    </div>
  );
}
