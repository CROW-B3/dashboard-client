import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const apiGatewayUrl = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'https://api.crowai.dev';
  const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crowai.dev';

  try {
    const sessionRes = await fetch(`${apiGatewayUrl}/api/v1/auth/get-session`, {
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    });

    if (!sessionRes.ok || sessionRes.status === 401) {
      return NextResponse.redirect(`${authUrl}/login`);
    }

    const session = await sessionRes.json();
    if (!session?.user) {
      return NextResponse.redirect(`${authUrl}/login`);
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', session.user.id);

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.redirect(`${authUrl}/login`);
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|favicon.svg).*)'],
};
