'use client';

import { EmailTagInput, GlassPanel, StatusBadge } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface InvitationItem { id: string; email: string; role: string; status: string }
interface EmailSuggestion { email: string; name: string }

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
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;
  const [emails, setEmails] = useState<string[]>([]);
  const [searchInput, setSearchInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const debouncedSearch = useDebounced(searchInput, 300);

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

  const { data: members } = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/members`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: invitationsData } = useQuery<{ invitations: InvitationItem[] }>({
    queryKey: ['invitations', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/team-invitations/list-invitations?organizationId=${orgId}`, { credentials: 'include' });
      if (!res.ok) return { invitations: [] };
      return res.json() as Promise<{ invitations: InvitationItem[] }>;
    },
    enabled: !!orgId,
  });

  const pendingInvitations: InvitationItem[] =
    invitationsData?.invitations?.filter((inv) => inv.status === 'pending') ?? [];

  const inviteMutation = useMutation({
    mutationFn: async (emailList: string[]) => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/team-invitations/send-invites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          emails: emailList,
          organizationId: orgId,
          organizationName: user?.orgName ?? '',
          inviterName: user?.name,
          inviterId: user?.betterAuthUserId,
        }),
      });
      if (!res.ok) throw new Error('Request failed');
    },
    onSuccess: (_, emailList) => {
      toast.success(`Invited ${emailList.length} member(s)`);
      setEmails([]);
      void queryClient.invalidateQueries({ queryKey: ['members', orgId] });
      void queryClient.invalidateQueries({ queryKey: ['invitations', orgId] });
    },
    onError: () => toast.error('Failed to send invitations'),
  });

  const handleInvite = () => {
    if (!emails.length || !orgId || !user) return;
    inviteMutation.mutate(emails);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team</h1>
        <p className="text-gray-400 text-sm mt-1">Manage team members and invitations</p>
      </div>

      <GlassPanel>
        <h2 className="text-lg font-semibold text-white mb-4">Invite Members</h2>
        <div className="space-y-3">
          <EmailTagInput
            emails={emails}
            onEmailsChange={setEmails}
            onInputChange={handleInputChange}
          >
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute left-0 right-0 z-50 mt-1 max-h-48 overflow-y-auto bg-zinc-900 border border-white/10 rounded-xl shadow-lg"
              >
                {filteredSuggestions.map((s) => (
                  <button
                    key={s.email}
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelectSuggestion(s.email)}
                    className="w-full text-left px-4 py-2 hover:bg-white/5 transition-colors"
                  >
                    <p className="text-sm text-white">{s.name}</p>
                    <p className="text-xs text-gray-400">{s.email}</p>
                  </button>
                ))}
              </div>
            )}
          </EmailTagInput>
          <button
            onClick={handleInvite}
            disabled={!emails.length || inviteMutation.isPending}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {inviteMutation.isPending ? 'Sending...' : 'Send Invitations'}
          </button>
        </div>
      </GlassPanel>

      <GlassPanel>
        <h2 className="text-lg font-semibold text-white mb-4">Members</h2>
        <div className="space-y-2">
          {Array.isArray(members) && members.map((member: { id: string; name: string; email: string; role: string }) => (
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

      {pendingInvitations.length > 0 && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Pending Invitations</h2>
          <div className="space-y-2">
            {pendingInvitations.map((inv) => (
              <div key={inv.id} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                <div>
                  <p className="text-sm text-white">{inv.email}</p>
                  <p className="text-xs text-gray-400">{inv.role}</p>
                </div>
                <StatusBadge>{inv.status}</StatusBadge>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
