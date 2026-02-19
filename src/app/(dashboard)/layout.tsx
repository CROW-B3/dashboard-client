'use client';

import { DashboardBackground, Header, Sidebar } from '@b3-crow/ui-kit';
import { BarChart, Building, Home, Package, Settings, Users } from 'lucide-react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { usePermissions } from '@/hooks/use-permissions';
import { signOut } from '@/lib/auth-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  
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
        ...(permissions?.interactions ? [{ label: 'Interactions', href: '/analytics/interactions' }] : []),
        ...(permissions?.patterns ? [{ label: 'Patterns', href: '/analytics/patterns' }] : []),
      ],
    },
    ...(permissions?.teamManagement ? [{ label: 'Team', href: '/team', icon: Users }] : []),
    { label: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleSignOut = async () => {
    await signOut();
    const authUrl = process.env.NEXT_PUBLIC_AUTH_URL || 'https://auth.crowai.dev';
    window.location.href = `${authUrl}/login`;
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <DashboardBackground />
      <Sidebar navItems={navItems} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          user={{ name: user?.name || '', email: user?.email || '', avatarUrl: user?.profilePictureUrl }}
          onSignOut={handleSignOut}
        />
        <main className="flex-1 overflow-auto p-6 relative z-10">{children}</main>
      </div>
    </div>
  );
}
