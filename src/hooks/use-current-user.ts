import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

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

async function fetchUserWithOrgContext(
  userId: string,
  activeOrgId: string | undefined
): Promise<UserRecord> {
  const userRes = await fetch(`${API_GATEWAY_URL}/api/v1/users/by-auth-id/${userId}`, {
    credentials: 'include',
  });
  if (!userRes.ok) throw new Error('Failed to fetch user');
  const user: UserRecord = await userRes.json();

  if (activeOrgId) {
    user.betterAuthOrgId = activeOrgId;
  }

  const orgLookupId = activeOrgId || user.organizationId;
  if (!orgLookupId) return user;

  const orgRes = await fetch(
    `${API_GATEWAY_URL}/api/v1/organizations/by-auth-id/${orgLookupId}`,
    { credentials: 'include' }
  );
  if (!orgRes.ok) return user;
  const org = await orgRes.json() as { id: string; name: string };
  return { ...user, orgUuid: org.id, orgName: org.name };
}

export function useCurrentUser() {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const activeOrgId = (session as any)?.session?.activeOrganizationId as string | undefined;

  return useQuery({
    queryKey: ['current-user', userId, activeOrgId],
    queryFn: () => fetchUserWithOrgContext(userId!, activeOrgId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
