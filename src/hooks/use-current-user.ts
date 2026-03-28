import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useRef } from 'react';
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

interface OrgRecord {
  id: string;
  name: string;
  betterAuthOrgId: string;
}

async function fetchUser(userId: string): Promise<UserRecord> {
  const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/by-auth-id/${userId}`, {
    credentials: 'include',
  });
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
}

async function fetchOrg(
  activeOrgId: string | undefined,
  internalOrgId: string | undefined
): Promise<OrgRecord | null> {
  try {
    if (activeOrgId) {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/by-auth-id/${activeOrgId}`, { credentials: 'include' });
      if (res.ok) return res.json();
    }
    if (internalOrgId) {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/organizations/${internalOrgId}`, { credentials: 'include' });
      if (res.ok) return res.json();
    }
  } catch {}
  return null;
}

export function useCurrentUser() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const activeOrgId = (session as any)?.session?.activeOrganizationId as string | undefined;
  const autoSetAttempted = useRef(false);

  const userQuery = useQuery({
    queryKey: ['current-user-base', userId],
    queryFn: () => fetchUser(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const internalOrgId = userQuery.data?.organizationId;

  // Start orgQuery as soon as activeOrgId is available from session (no need to wait for userQuery).
  // Fall back to internalOrgId from userQuery when activeOrgId is not set.
  const orgQueryEnabled = !!(activeOrgId || internalOrgId);
  const orgQuery = useQuery({
    queryKey: ['current-org', activeOrgId, internalOrgId],
    queryFn: () => fetchOrg(activeOrgId, internalOrgId),
    enabled: orgQueryEnabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });

  const mergedData = useMemo<UserRecord | undefined>(() => {
    if (!userQuery.data) return undefined;
    return {
      ...userQuery.data,
      ...(activeOrgId ? { betterAuthOrgId: activeOrgId } : {}),
      ...(orgQuery.data ? { orgUuid: orgQuery.data.id, orgName: orgQuery.data.name, betterAuthOrgId: orgQuery.data.betterAuthOrgId } : {}),
    };
  }, [userQuery.data, activeOrgId, orgQuery.data]);

  useEffect(() => {
    if (autoSetAttempted.current) return;
    if (activeOrgId) return;
    const resolvedBetterAuthOrgId = orgQuery.data?.betterAuthOrgId || userQuery.data?.betterAuthOrgId;
    if (!resolvedBetterAuthOrgId) return;

    autoSetAttempted.current = true;
    // Set the active org in better-auth but do NOT invalidate queries.
    // The session hook will update activeOrgId on its own, and the existing
    // cached data is still valid — invalidating causes a full re-fetch waterfall.
    organization.setActive({ organizationId: resolvedBetterAuthOrgId }).catch(() => {});
  }, [activeOrgId, orgQuery.data?.betterAuthOrgId, userQuery.data?.betterAuthOrgId]);

  const isLoading = userQuery.isLoading || (orgQueryEnabled && orgQuery.isLoading);

  return {
    data: mergedData,
    isLoading,
    isError: userQuery.isError,
    error: userQuery.error,
  };
}
