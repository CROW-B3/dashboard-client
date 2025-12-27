'use client';

import { Sidebar } from '@b3-crow/ui-kit';
import dynamic from 'next/dynamic';
import { usePathname, useRouter } from 'next/navigation';

import { LenisProvider } from '@/components/providers';
import { ChatHistoryProvider, useChatHistory } from '@/contexts/ChatHistoryContext';

const DashboardBackground = dynamic(
  () => import('@b3-crow/ui-kit').then((mod) => mod.DashboardBackground),
  { ssr: false }
);

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { sessions, activeSessionId, isExpanded, setActiveSession, toggleExpanded, updateSessionTitle, deleteSession } =
    useChatHistory();

  const handleLogout = () => {
    router.push('/');
  };

  // Map sessions to ui-kit ChatHistoryItem format
  const chatHistory = sessions.map((session) => ({
    id: session.id,
    title: session.title,
  }));

  return (
    <div className="h-screen flex overflow-hidden relative">
      <DashboardBackground />
      <div className="relative z-10 flex w-full h-full">
        <Sidebar
          activeHref={pathname}
          logoSrc="/favicon.webp"
          userName="Demo User"
          userEmail="demo@crow.ai"
          onLogout={handleLogout}
          chatHistory={chatHistory}
          activeChatId={activeSessionId}
          chatHistoryExpanded={isExpanded}
          onChatClick={setActiveSession}
          onChatHistoryToggle={toggleExpanded}
          onChatRename={updateSessionTitle}
          onChatDelete={deleteSession}
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
      <DashboardContent>{children}</DashboardContent>
    </ChatHistoryProvider>
  );
}
