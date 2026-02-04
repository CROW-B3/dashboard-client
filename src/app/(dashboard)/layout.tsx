'use client';

import type { NavItem } from '@b3-crow/ui-kit';
import { LenisProvider, MobileSidebar, Sidebar } from '@b3-crow/ui-kit';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/ChatHistoryContext';
import { MobileSidebarProvider, useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { SidebarCollapseProvider, useSidebarCollapse } from '@/contexts/SidebarCollapseContext';

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
    icon: 'package',
    label: 'Products',
    href: '/products',
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

function createDashboardSidebarPropsObject(
  pathname: string,
  chatHistory: ReturnType<typeof buildChatHistoryItemsFromSessions>,
  activeSessionId: string | null,
  isExpanded: boolean,
  handleLogout: () => void,
  handleNavigate: (href: string) => void,
  setActiveSession: (id: string) => void,
  toggleExpanded: () => void,
  updateSessionTitle: (id: string, title: string) => void,
  deleteSession: (id: string) => void,
  isCollapsed: boolean,
  onToggleCollapse: () => void,
  onProfileClick: () => void,
) {
  return {
    navItems: DEFAULT_NAV_ITEMS,
    activeHref: pathname,
    onNavigate: handleNavigate,
    logoSrc: '/favicon.webp',
    userName: 'Demo User',
    userEmail: 'demo@crow.ai',
    onLogout: handleLogout,
    onProfileClick,
    chatHistory,
    activeChatId: activeSessionId,
    chatHistoryExpanded: isExpanded,
    onChatClick: setActiveSession,
    onChatHistoryToggle: toggleExpanded,
    onChatRename: updateSessionTitle,
    onChatDelete: deleteSession,
    isCollapsed,
    onToggleCollapse,
  };
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, activeSessionId, isExpanded, setActiveSession, toggleExpanded, updateSessionTitle, deleteSession } =
    useChatHistory();
  const { isOpen: isMobileSidebarOpen, close: closeMobileSidebar } = useMobileSidebar();
  const { isCollapsed, toggle: toggleCollapse } = useSidebarCollapse();

  const handleLogout = () => router.push('/');
  const handleNavigate = (href: string) => router.push(href);
  const handleProfileClick = () => router.push('/settings/profile');

  const chatHistory = buildChatHistoryItemsFromSessions(sessions);
const sidebarProps = createDashboardSidebarPropsObject(
    pathname,
    chatHistory,
    activeSessionId,
    isExpanded,
    handleLogout,
    handleNavigate,
    setActiveSession,
    toggleExpanded,
    updateSessionTitle,
    deleteSession,
    isCollapsed,
    toggleCollapse,
    handleProfileClick,
  );

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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
