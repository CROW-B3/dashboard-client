'use client';

import { EmailTagInput, GlassPanel, StatusBadge } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

export default function TeamPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const [emails, setEmails] = useState<string[]>([]);
  const [inviting, setInviting] = useState(false);

  const { data: members, refetch } = useQuery({
    queryKey: ['members', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${orgId}/members`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!orgId,
  });

  const handleInvite = async () => {
    if (!emails.length || !orgId) return;
    setInviting(true);
    try {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/team-invitations/send-invites`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails, organizationId: orgId }),
      });
      if (!res.ok) throw new Error("Request failed");
      toast.success(`Invited ${emails.length} member(s)`);
      setEmails([]);
      refetch();
    } catch {
      toast.error('Failed to send invitations');
    } finally {
      setInviting(false);
    }
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
            value={emails}
            onChange={setEmails}
            placeholder="Enter email addresses..."
          />
          <button
            onClick={handleInvite}
            disabled={!emails.length || inviting}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm transition-colors disabled:opacity-50"
          >
            {inviting ? 'Sending...' : 'Send Invitations'}
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
              <StatusBadge status={member.role} />
            </div>
          ))}
        </div>
      </GlassPanel>
    </div>
  );
}
