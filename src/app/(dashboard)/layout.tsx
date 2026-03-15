'use client';

import { DashboardBackground, Header, Sidebar } from '@b3-crow/ui-kit';
import { BarChart, Building, CreditCard, Home, MessageSquare, Package, Plug, Settings, Users } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/use-current-user';
import { canAccessChat, usePermissions } from '@/hooks/use-permissions';
import { signOut } from '@/lib/auth-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useCurrentUser();
  const { data: permissions } = usePermissions(user?.id);

  const navItems = [
    { label: 'Overview', href: '/', icon: Home },
    { label: 'Catalog', href: '/catalog', icon: Package },
    { label: 'Organization', href: '/organization', icon: Building },
    {
      label: 'Analytics',
      href: '/analytics',
      icon: BarChart,
      children: [
        ...(permissions?.interactions ? [{ label: 'Interactions', href: '/dashboard/interactions' }] : []),
        ...(permissions?.patterns ? [{ label: 'Patterns', href: '/dashboard/patterns' }] : []),
      ],
    },
    ...(canAccessChat(permissions) ? [{ label: 'Chat', href: '/dashboard/chat', icon: MessageSquare }] : []),
    ...(permissions?.teamManagement ? [{ label: 'Team', href: '/team', icon: Users }] : []),
    { label: 'Integrations', href: '/integrations', icon: Plug },
    { label: 'Billing', href: '/billing', icon: CreditCard },
    { label: 'Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const handleNavigate = (href: string) => router.push(href);

  const handleSignOut = async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://dev.auth.crowai.dev';
    window.location.href = `${authUrl}/login`;
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#030005]">
      <DashboardBackground />
      <Sidebar
        navItems={navItems as any}
        activeHref={pathname ?? '/'}
        logoSrc="/logo.webp"
        userName={user?.name || user?.email || 'User'}
        userEmail={user?.email || ''}
        onNavigate={handleNavigate}
        onLogout={handleSignOut}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          userInitials={(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()}
        />
        <main className="flex-1 overflow-auto p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}
