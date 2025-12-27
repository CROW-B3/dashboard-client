'use client';

import dynamic from 'next/dynamic';
import { Sidebar } from '@b3-crow/ui-kit';
import { useRouter, usePathname } from 'next/navigation';

import { LenisProvider } from '@/components/providers';

const DashboardBackground = dynamic(
  () => import('@b3-crow/ui-kit').then((mod) => mod.DashboardBackground),
  { ssr: false }
);

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    router.push('/');
  };

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
