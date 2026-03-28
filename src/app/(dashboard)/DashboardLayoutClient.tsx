'use client';

import type { NavItem } from '@b3-crow/ui-kit';
import { MobileSidebar, Sidebar } from '@b3-crow/ui-kit';
import { useQueryClient } from '@tanstack/react-query';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo } from 'react';
import { LenisProvider } from '@/components/LenisProvider';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/ChatHistoryContext';
import { MobileSidebarProvider, useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { SidebarCollapseProvider, useSidebarCollapse } from '@/contexts/SidebarCollapseContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { buildProfilePictureUrl } from '@/lib/api';
import { signOut } from '@/lib/auth-client';

const DEFAULT_NAV_ITEMS: NavItem[] = [
  {
    icon: 'grid_view',
    label: 'Overview',
    href: '/',
  },
  {
    icon: 'chat_bubble',
    label: 'Ask CROW',
    href: '/ask-crow',
  },
  {
    icon: 'timeline',
    label: 'Analysis',
    href: '#',
    submenu: [
      {
        icon: '',
        label: 'Interactions',
        href: '/analysis/interactions',
      },
      {
        icon: '',
        label: 'Patterns',
        href: '/analysis/patterns',
      },
    ],
  },
  {
    icon: 'bar_chart',
    label: 'Analytics',
    href: '/analytics',
  },
  {
    icon: 'group',
    label: 'Team',
    href: '/team',
  },
  {
    icon: 'shopping_bag',
    label: 'Products',
    href: '/catalog',
  },
  {
    icon: 'integrations',
    label: 'Integrations',
    href: '/integrations',
  },
  {
    icon: 'credit_card',
    label: 'Billing',
    href: '/billing',
  },
];

const DashboardBackground = dynamic(
  () => import('@b3-crow/ui-kit').then((mod) => mod.DashboardBackground)
);

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

function usePrefetchDashboardData(orgId: string | undefined) {
  const queryClient = useQueryClient();
  useEffect(() => {
    if (!orgId) return;
    const base = `${API_GATEWAY_URL}/api/v1`;
    const opts = { credentials: 'include' as const };
    const prefetch = (key: string[], url: string, staleTime?: number) =>
      queryClient.prefetchQuery({
        queryKey: key,
        queryFn: () => fetch(url, opts).then(r => r.ok ? r.json() : null),
        ...(staleTime ? { staleTime } : {}),
      });

    // WAVE 1: Critical data for current page (immediate)
    prefetch(['interaction-summary', orgId], `${base}/interactions/organization/${orgId}/summary`, 2 * 60 * 1000);
    prefetch(['patterns-overview', orgId], `${base}/patterns/organization/${orgId}?limit=5`, 5 * 60 * 1000);
    prefetch(['interactions-overview', orgId], `${base}/interactions/organization/${orgId}?limit=5`, 2 * 60 * 1000);
    prefetch(['members', orgId], `${base}/auth/organization/get-full-organization`, 10 * 60 * 1000);
    prefetch(['billing-plans'], `${base}/billing/plans`, 30 * 60 * 1000);

    // WAVE 2: Secondary pages (after 2s delay to avoid connection storm)
    const timer = window.setTimeout(() => {
      prefetch(['analysis-interactions', orgId, '1', '', 'all'], `${base}/interactions/organization/${orgId}?limit=20`, 2 * 60 * 1000);
      prefetch(['analysis-patterns', orgId, 'all'], `${base}/patterns/organization/${orgId}?page=1&limit=20`, 5 * 60 * 1000);
      prefetch(['products', orgId, '1', ''], `${base}/products/organization/${orgId}?page=1&pageSize=24`, 10 * 60 * 1000);
      prefetch(['subscription', orgId], `${base}/billing/subscriptions/${orgId}`, 5 * 60 * 1000);
    }, 2000);

    // WAVE 3: Filter variants (after 5s — only useful if user navigates and filters)
    const timer2 = window.setTimeout(() => {
      prefetch(['analysis-interactions', orgId, '1', '', 'web'], `${base}/interactions/organization/${orgId}?limit=20&sourceType=web`, 2 * 60 * 1000);
      prefetch(['analysis-interactions', orgId, '1', '', 'cctv'], `${base}/interactions/organization/${orgId}?limit=20&sourceType=cctv`, 2 * 60 * 1000);
      prefetch(['analysis-interactions', orgId, '1', '', 'social'], `${base}/interactions/organization/${orgId}?limit=20&sourceType=social`, 2 * 60 * 1000);
    }, 5000);

    return () => { clearTimeout(timer); clearTimeout(timer2); };

    // NOTE: Do NOT prefetch chat-sessions here — ChatHistoryContext has its own
    // queryFn that transforms the raw API response. Prefetching with raw data
    // would overwrite the cache with an incompatible shape.
  }, [orgId, queryClient]);
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { sessions, activeSessionId, isExpanded, setActiveSession, toggleExpanded, updateSessionTitle, deleteSession } =
    useChatHistory();
  const { isOpen: isMobileSidebarOpen, close: closeMobileSidebar } = useMobileSidebar();
  const { isCollapsed, toggle: toggleCollapse } = useSidebarCollapse();

  usePrefetchDashboardData(user?.organizationId);

  const handleLogout = useCallback(async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://dev.auth.crowai.dev';
    window.location.href = `${authUrl}/login`;
  }, []);

  const handleNavigate = useCallback((href: string) => router.push(href), [router]);

  const chatHistory = useMemo(
    () => sessions.map((session) => ({ id: session.id, title: session.title })),
    [sessions]
  );

  const userAvatarUrl = useMemo(
    () => (user?.profilePictureUrl && user?.id ? buildProfilePictureUrl(user.id) : undefined),
    [user?.profilePictureUrl, user?.id]
  );

  const sidebarProps = useMemo(() => ({
    navItems: DEFAULT_NAV_ITEMS,
    activeHref: pathname ?? '/',
    onNavigate: handleNavigate,
    logoSrc: '/favicon.webp',
    userName: user?.name || user?.email || '',
    userEmail: user?.email || '',
    ...(userAvatarUrl ? { userAvatar: userAvatarUrl } : {}),
    onLogout: handleLogout,
    chatHistory,
    activeChatId: activeSessionId,
    chatHistoryExpanded: isExpanded,
    onChatClick: (id: string) => {
      setActiveSession(id);
      if (!pathname?.startsWith('/ask-crow')) {
        handleNavigate('/ask-crow');
      }
    },
    onChatHistoryToggle: toggleExpanded,
    onChatRename: updateSessionTitle,
    onChatDelete: deleteSession,
    isCollapsed,
    onToggleCollapse: toggleCollapse,
  }), [
    pathname, handleNavigate, user?.name, user?.email, userAvatarUrl,
    handleLogout, chatHistory, activeSessionId, isExpanded,
    setActiveSession, toggleExpanded, updateSessionTitle, deleteSession,
    isCollapsed, toggleCollapse, pathname,
  ]);

  return (
    <div className="h-screen flex overflow-hidden relative">
      <DashboardBackground sidebarWidth={isCollapsed ? 80 : 280} />
      <div className="relative z-10 flex w-full h-full">
        <Sidebar {...sidebarProps} />
        <MobileSidebar
          {...sidebarProps}
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
        />
        <LenisProvider wrapper="#scroll-wrapper" content="#scroll-content">
          <main id="scroll-wrapper" className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
            <div id="scroll-content">
              {children}
            </div>
          </main>
        </LenisProvider>
      </div>
    </div>
  );
}

function ChatHistoryProviderWithUser({ children }: { children: React.ReactNode }) {
  const { data: user } = useCurrentUser();
  return (
    <ChatHistoryProvider organizationId={user?.organizationId}>
      {children}
    </ChatHistoryProvider>
  );
}

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ChatHistoryProviderWithUser>
      <MobileSidebarProvider>
        <SidebarCollapseProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarCollapseProvider>
      </MobileSidebarProvider>
    </ChatHistoryProviderWithUser>
  );
}
