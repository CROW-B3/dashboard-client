'use client';

import { useRouter } from 'next/navigation';

import { GlassPanel, Header, MetricsCard, SectionHeader, SourceIcon, StatusIndicator } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, BarChart3, MessageSquare, Settings, Zap } from 'lucide-react';
import Link from 'next/link';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

const SKELETON_KEYS = ['a', 'b', 'c'];

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

interface Interaction {
  id: string;
  organizationId: string;
  sourceType: string;
  sessionId: string | null;
  data: string;
  summary: string | null;
  timestamp: number;
  createdAt: number;
}

interface Pattern {
  id: string;
  organizationId: string;
  type: string;
  confidence: number | null;
  data: string;
  detectedAt: number;
  createdAt: number;
}

interface InteractionsResponse {
  interactions: Interaction[];
  total: number;
}

interface PatternsResponse {
  patterns: Pattern[];
  total: number;
}

interface QuickAction {
  label: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'View Interactions',
    description: 'Browse all interaction events',
    href: '/analysis/interactions',
    icon: <BarChart3 className="h-4 w-4" />,
  },
  {
    label: 'Ask CROW',
    description: 'Query your data with AI',
    href: '/ask-crow',
    icon: <MessageSquare className="h-4 w-4" />,
  },
  {
    label: 'Integrations',
    description: 'Connect data sources',
    href: '/integrations',
    icon: <Zap className="h-4 w-4" />,
  },
  {
    label: 'Settings',
    description: 'Manage API keys and config',
    href: '/dashboard/settings',
    icon: <Settings className="h-4 w-4" />,
  },
];

function QuickActionCard({ action }: { action: QuickAction }) {
  return (
    <Link
      href={action.href}
      className="group flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3 transition-all hover:border-violet-500/30 hover:bg-white/[0.07]"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 transition-colors group-hover:bg-violet-500/20">
        {action.icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-gray-200">{action.label}</p>
        <p className="truncate text-xs text-gray-500">{action.description}</p>
      </div>
      <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-600 transition-colors group-hover:text-violet-400" />
    </Link>
  );
}

function InteractionRow({ interaction }: { interaction: Interaction }) {
  const validSource = (['web', 'cctv', 'social'] as const).includes(
    interaction.sourceType as 'web' | 'cctv' | 'social',
  );

  return (
    <Link
      href="/analysis/interactions"
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition-all hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-center gap-3">
        {validSource && (
          <SourceIcon source={interaction.sourceType as 'web' | 'cctv' | 'social'} size="sm" />
        )}
        <div className="min-w-0">
          <span className="block max-w-[220px] truncate text-sm text-gray-200">
            {interaction.summary || interaction.sessionId || interaction.id}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-gray-500">
            {interaction.sourceType}
          </span>
        </div>
      </div>
      <span className="flex-shrink-0 text-xs text-gray-500">
        {interaction.timestamp ? new Date(interaction.timestamp).toLocaleDateString() : ''}
      </span>
    </Link>
  );
}

function PatternRow({ pattern }: { pattern: Pattern }) {
  return (
    <Link
      href="/analysis/patterns"
      className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 transition-all hover:border-white/20 hover:bg-white/[0.07]"
    >
      <div className="flex items-center gap-2">
        <span className="rounded-full border border-purple-500/30 bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-300">
          {pattern.type || 'pattern'}
        </span>
        {pattern.confidence != null && (
          <span className="text-xs text-gray-400">
            {Math.round(pattern.confidence * 100)}%
          </span>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-gray-500">
        {pattern.detectedAt ? new Date(pattern.detectedAt).toLocaleDateString() : ''}
      </span>
    </Link>
  );
}

function SourceBreakdownItem({ label, count, total }: { label: string; count: number; total: number }) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <StatusIndicator status={count > 0 ? 'active' : 'inactive'} />
        <span className="text-sm text-gray-300">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="h-1.5 w-20 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-violet-500 transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
        <span className="w-10 text-right font-mono text-xs text-gray-400">{count}</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();

  const { toggle } = useMobileSidebar();
  const { data: user } = useCurrentUser();
  const orgId = user?.organizationId;
  const userInitials = (user?.name || user?.email || 'U').slice(0, 2).toUpperCase();

  const { data: summaryData, isLoading: summaryLoading } = useQuery<InteractionSummary>({
    queryKey: ['dashboard-summary', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`,
        { credentials: 'include' },
      );
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: interactionsData, isLoading: interactionsLoading } = useQuery<InteractionsResponse>({
    queryKey: ['dashboard-interactions', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) return { interactions: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: patternsData, isLoading: patternsLoading } = useQuery<PatternsResponse>({
    queryKey: ['dashboard-patterns', orgId],
    queryFn: async () => {
      const res = await fetch(
        `${API_GATEWAY_URL}/api/v1/patterns/organization/${orgId}?limit=5`,
        { credentials: 'include' },
      );
      if (!res.ok) return { patterns: [], total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const interactions = interactionsData?.interactions ?? [];
  const patterns = patternsData?.patterns ?? [];

  const chartData = summaryLoading
    ? undefined
    : ([
        summaryData?.web ?? 0,
        summaryData?.cctv ?? 0,
        summaryData?.social ?? 0,
        summaryData?.total ?? 0,
      ] as const);

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        orgName={user?.orgName || 'Dashboard'}
        userInitials={userInitials}
        showNotification
        onMenuClick={toggle}
        logoSrc="/favicon.webp"
        onAvatarClick={() => router.push('/dashboard/settings')}
      />

      <main className="flex-1 px-4 sm:px-6 lg:px-12 xl:px-[120px] py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto">
          <div className="relative mb-6 sm:mb-8">
            <h1 className="mb-1 text-xl sm:text-2xl font-bold leading-7 sm:leading-8 text-white">
              Analytics
            </h1>
            <p className="text-xs sm:text-sm font-normal leading-5 text-gray-400">
              Welcome back, {user?.name || user?.email || 'User'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            <MetricsCard
              title="Total Interactions"
              value={summaryLoading ? '...' : String(summaryData?.total ?? 0)}
              change=""
              changeType="neutral"
              {...(chartData ? { chartData } : {})}
            />
            <MetricsCard
              title="Active Patterns"
              value={patternsLoading ? '...' : String(patternsData?.total ?? 0)}
              change=""
              changeType="info"
              {...(chartData ? { chartData, chartColor: 'violet' as const } : {})}
            />
            <MetricsCard
              title="Web Sources"
              value={summaryLoading ? '...' : String(summaryData?.web ?? 0)}
              change=""
              changeType="info"
            />
            <MetricsCard
              title="CCTV Sources"
              value={summaryLoading ? '...' : String(summaryData?.cctv ?? 0)}
              change=""
              changeType="info"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <GlassPanel variant="heavy" className="overflow-hidden">
              <SectionHeader
                title="Recent Interactions"
                viewAllHref="/analysis/interactions"
                viewAllText="View all"
                LinkComponent={Link}
              />
              <div className="p-3 sm:p-4">
                {interactionsLoading ? (
                  <div className="space-y-2">
                    {SKELETON_KEYS.map((k) => (
                      <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : interactions.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-gray-400">No interactions yet</p>
                    <Link
                      href="/integrations"
                      className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Connect a data source
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {interactions.map((interaction) => (
                      <InteractionRow key={interaction.id} interaction={interaction} />
                    ))}
                  </div>
                )}
              </div>
            </GlassPanel>

            <GlassPanel variant="heavy" className="overflow-hidden">
              <SectionHeader
                title="Recent Patterns"
                viewAllHref="/analysis/patterns"
                viewAllText="View all"
                LinkComponent={Link}
              />
              <div className="p-3 sm:p-4">
                {patternsLoading ? (
                  <div className="space-y-2">
                    {SKELETON_KEYS.map((k) => (
                      <div key={k} className="h-12 animate-pulse rounded-lg bg-white/5" />
                    ))}
                  </div>
                ) : patterns.length === 0 ? (
                  <div className="py-8 flex flex-col items-center gap-3 text-center">
                    <p className="text-sm text-gray-400">No patterns detected yet</p>
                    <Link
                      href="/integrations"
                      className="text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Connect a data source
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patterns.map((pattern) => (
                      <PatternRow key={pattern.id} pattern={pattern} />
                    ))}
                  </div>
                )}
              </div>
            </GlassPanel>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <GlassPanel variant="heavy" className="lg:col-span-1">
              <h3 className="text-sm font-semibold text-white mb-4 px-4 pt-4">Source Breakdown</h3>
              <div className="space-y-3 px-4 pb-4">
                <SourceBreakdownItem
                  label="Web"
                  count={summaryData?.web ?? 0}
                  total={summaryData?.total ?? 1}
                />
                <SourceBreakdownItem
                  label="CCTV"
                  count={summaryData?.cctv ?? 0}
                  total={summaryData?.total ?? 1}
                />
                <SourceBreakdownItem
                  label="Social"
                  count={summaryData?.social ?? 0}
                  total={summaryData?.total ?? 1}
                />
              </div>
            </GlassPanel>

            <div className="lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_ACTIONS.map((action) => (
                  <QuickActionCard key={action.href} action={action} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
