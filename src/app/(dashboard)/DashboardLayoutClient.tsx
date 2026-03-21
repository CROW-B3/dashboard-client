'use client';

import type { NavItem } from '@b3-crow/ui-kit';
import { LenisProvider, MobileSidebar, Sidebar } from '@b3-crow/ui-kit';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/ChatHistoryContext';
import { MobileSidebarProvider, useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { SidebarCollapseProvider, useSidebarCollapse } from '@/contexts/SidebarCollapseContext';
import { useCurrentUser } from '@/hooks/use-current-user';
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
    icon: 'group',
    label: 'Team',
    href: '/team',
  },
  {
    icon: 'inventory_2',
    label: 'Catalog',
    href: '/catalog',
  },
  {
    icon: 'credit_card',
    label: 'Billing',
    href: '/billing',
  },
  {
    icon: 'settings',
    label: 'Settings',
    href: '/dashboard/settings',
  },
];

const DashboardBackground = dynamic(
  () => import('@b3-crow/ui-kit').then((mod) => mod.DashboardBackground)
);

function buildChatHistoryItemsFromSessions(sessions: ReturnType<typeof useChatHistory>['sessions']) {
  return sessions.map((session) => ({
    id: session.id,
    title: session.title,
  }));
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: user } = useCurrentUser();
  const { sessions, activeSessionId, isExpanded, setActiveSession, toggleExpanded, updateSessionTitle, deleteSession } =
    useChatHistory();
  const { isOpen: isMobileSidebarOpen, close: closeMobileSidebar } = useMobileSidebar();
  const { isCollapsed, toggle: toggleCollapse } = useSidebarCollapse();

  const handleLogout = async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://dev.auth.crowai.dev';
    window.location.href = `${authUrl}/login`;
  };
  const handleNavigate = (href: string) => router.push(href);

  const chatHistory = buildChatHistoryItemsFromSessions(sessions);

  const sidebarProps = {
    navItems: DEFAULT_NAV_ITEMS,
    activeHref: pathname ?? '/',
    onNavigate: handleNavigate,
    logoSrc: '/favicon.webp',
    userName: user?.name || user?.email || 'User',
    userEmail: user?.email || '',
    onLogout: handleLogout,
    chatHistory,
    activeChatId: activeSessionId,
    chatHistoryExpanded: isExpanded,
    onChatClick: setActiveSession,
    onChatHistoryToggle: toggleExpanded,
    onChatRename: updateSessionTitle,
    onChatDelete: deleteSession,
    isCollapsed,
    onToggleCollapse: toggleCollapse,
  };

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

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  return (
    <ChatHistoryProvider>
      <MobileSidebarProvider>
        <SidebarCollapseProvider>
          <DashboardContent>{children}</DashboardContent>
        </SidebarCollapseProvider>
      </MobileSidebarProvider>
    </ChatHistoryProvider>
  );
}
