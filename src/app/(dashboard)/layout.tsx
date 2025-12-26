'use client';

import {
  DashboardBackground,
  Sidebar,
} from '@b3-crow/ui-kit';
import { useRouter } from 'next/navigation';
import { LenisProvider } from '@/components/providers';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = () => {
    router.push('/');
  };

  return (
    <div className="h-screen flex overflow-hidden relative">
      {/* Background */}
      <DashboardBackground />

      {/* Main container */}
      <div className="relative z-10 flex w-full h-full">
        {/* Sidebar with built-in settings drop-up */}
        <Sidebar
          activeHref="/overview"
          logoSrc="/favicon.png"
          userName="Demo User"
          userEmail="demo@crow.ai"
          onLogout={handleLogout}
        />

        {/* Main content with Lenis smooth scroll */}
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
