import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';
import { organization, useSession } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface UserRecord {
  id: string;
  betterAuthUserId: string;
  organizationId?: string;
  betterAuthOrgId?: string;
  orgUuid?: string;
  orgName?: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  role: 'admin' | 'member';
  permissions: Record<string, unknown>;
}

async function fetchOrgByAuthId(authOrgId: string): Promise<{ id: string; name: string; betterAuthOrgId: string } | null> {
  const res = await fetch(
    `${API_GATEWAY_URL}/api/v1/organizations/by-auth-id/${authOrgId}`,
    { credentials: 'include' }
  );
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; name: string; betterAuthOrgId: string }>;
}

async function fetchOrgByInternalId(internalId: string): Promise<{ id: string; name: string; betterAuthOrgId: string } | null> {
  const res = await fetch(
    `${API_GATEWAY_URL}/api/v1/organizations/${internalId}`,
    { credentials: 'include' }
  );
  if (!res.ok) return null;
  return res.json() as Promise<{ id: string; name: string; betterAuthOrgId: string }>;
}

async function fetchWithTimeout(url: string, timeoutMs = 3000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { credentials: 'include', signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchOrgSafe(
  activeOrgId: string | undefined,
  internalOrgId: string | undefined
): Promise<{ id: string; name: string; betterAuthOrgId: string } | null> {
  try {
    if (activeOrgId) {
      const res = await fetchWithTimeout(`${API_GATEWAY_URL}/api/v1/organizations/by-auth-id/${activeOrgId}`);
      if (res.ok) return res.json();
    }
    if (internalOrgId) {
      const res = await fetchWithTimeout(`${API_GATEWAY_URL}/api/v1/organizations/${internalOrgId}`);
      if (res.ok) return res.json();
    }
  } catch {}
  return null;
}

async function fetchUserWithOrgContext(
  userId: string,
  activeOrgId: string | undefined
): Promise<UserRecord> {
  const userRes = await fetch(`${API_GATEWAY_URL}/api/v1/users/by-auth-id/${userId}`, {
    credentials: 'include',
  });
  if (!userRes.ok) throw new Error('Failed to fetch user');
  const user: UserRecord = await userRes.json();

  if (activeOrgId) user.betterAuthOrgId = activeOrgId;

  const org = await fetchOrgSafe(activeOrgId, user.organizationId);
  if (org) return { ...user, orgUuid: org.id, orgName: org.name, betterAuthOrgId: org.betterAuthOrgId };

  return user;
}

export function useCurrentUser() {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const userId = session?.user?.id;
  const activeOrgId = (session as any)?.session?.activeOrganizationId as string | undefined;
  const autoSetAttempted = useRef(false);

  const query = useQuery({
    queryKey: ['current-user', userId, activeOrgId],
    queryFn: () => fetchUserWithOrgContext(userId!, activeOrgId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (autoSetAttempted.current) return;
    if (activeOrgId) return;
    if (!query.data?.betterAuthOrgId) return;

    autoSetAttempted.current = true;
    organization.setActive({ organizationId: query.data.betterAuthOrgId }).then(() => {
      queryClient.invalidateQueries({ queryKey: ['current-user'] });
    }).catch(() => {});
  }, [activeOrgId, query.data?.betterAuthOrgId, queryClient]);

  return query;
}
