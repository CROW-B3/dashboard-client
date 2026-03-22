const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface TokenCache {
  token: string | null;
  expiresAt: number;
}

let tokenCache: TokenCache = { token: null, expiresAt: 0 };

async function getAuthToken(): Promise<string | null> {
  if (tokenCache.token && Date.now() < tokenCache.expiresAt) {
    return tokenCache.token;
  }
  try {
    const res = await fetch(`${API_GATEWAY_URL}/api/v1/auth/get-session`, {
      credentials: 'include',
    });
    if (!res.ok) { tokenCache = { token: null, expiresAt: 0 }; return null; }
    tokenCache = { token: 'cookie-auth', expiresAt: Date.now() + 5 * 60 * 1000 };
    return tokenCache.token;
  } catch {
    return null;
  }
}

function clearTokenCache() {
  tokenCache = { token: null, expiresAt: 0 };
}

async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const res = await fetch(`${API_GATEWAY_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (res.status === 401) clearTokenCache();
  return res;
}

export const api = {
  get: (path: string) => apiFetch(path),
  post: (path: string, body: unknown) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  patch: (path: string, body: unknown) => apiFetch(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path: string) => apiFetch(path, { method: 'DELETE' }),
};

export const buildProfilePictureUrl = (userId: string): string =>
  `${API_GATEWAY_URL}/api/v1/users/${userId}/profile-picture`;

export { clearTokenCache, getAuthToken };
