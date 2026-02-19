import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface UserRecord {
  id: string;
  betterAuthUserId: string;
  organizationId?: string;
  name: string;
  email: string;
  profilePictureUrl?: string;
  role: 'admin' | 'member';
  permissions: Record<string, unknown>;
}

export function useCurrentUser() {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  return useQuery({
    queryKey: ['current-user', userId],
    queryFn: async (): Promise<UserRecord> => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/users/by-auth-id/${userId}`, {
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json();
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}
