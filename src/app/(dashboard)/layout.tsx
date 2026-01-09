'use client';

import { MobileSidebar, Sidebar } from '@b3-crow/ui-kit';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';

import { LenisProvider } from '@/components/providers';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/ChatHistoryContext';
import { MobileSidebarProvider, useMobileSidebar } from '@/contexts/MobileSidebarContext';

const DashboardBackground = dynamic(
  () => import('@b3-crow/ui-kit').then((mod) => mod.DashboardBackground)
);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, activeSessionId, isExpanded, setActiveSession, toggleExpanded, updateSessionTitle, deleteSession } =
    useChatHistory();
  const { isOpen: isMobileSidebarOpen, close: closeMobileSidebar } = useMobileSidebar();

  const handleLogout = () => {
    router.push('/');
  };

  // Handle navigation from mobile sidebar
  const handleMobileNavigate = (href: string) => {
    router.push(href);
  };

  // Map sessions to ui-kit ChatHistoryItem format
  const chatHistory = sessions.map((session) => ({
    id: session.id,
    title: session.title,
  }));

  // Shared sidebar props
  const sidebarProps = {
    activeHref: pathname,
    logoSrc: '/favicon.webp',
    userName: 'Demo User',
    userEmail: 'demo@crow.ai',
    onLogout: handleLogout,
    chatHistory,
    activeChatId: activeSessionId,
    chatHistoryExpanded: isExpanded,
    onChatClick: setActiveSession,
    onChatHistoryToggle: toggleExpanded,
    onChatRename: updateSessionTitle,
    onChatDelete: deleteSession,
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      <DashboardBackground />
      <div className="relative z-10 flex w-full h-full">
        {/* Desktop Sidebar */}
        <Sidebar {...sidebarProps} />

        {/* Mobile Sidebar */}
        <MobileSidebar
          {...sidebarProps}
          isOpen={isMobileSidebarOpen}
          onClose={closeMobileSidebar}
          onNavigate={handleMobileNavigate}
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
        <DashboardContent>{children}</DashboardContent>
      </MobileSidebarProvider>
    </ChatHistoryProvider>
  );
}
