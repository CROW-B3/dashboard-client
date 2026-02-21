'use client';

import { useQuery } from '@tanstack/react-query';
import { Activity, BarChart2, Layers, Package } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://dev.api.crowai.dev';

const SKELETON_KEYS = ['a', 'b', 'c'];

interface Interaction {
  id: string;
  sessionId?: string;
  sourceType?: string;
  summary?: string;
  timestamp?: string;
}

interface Pattern {
  confidence?: number;
  detectedAt?: string;
  generatedAt?: string;
  id: string;
  type?: string;
}

interface InteractionsResponse {
  data?: Interaction[];
  interactions?: Interaction[];
  total?: number;
}

interface PatternsResponse {
  data?: Pattern[];
  patterns?: Pattern[];
  total?: number;
}

function StatCard({
  icon: Icon,
  loading,
  title,
  value,
}: {
  icon: React.ElementType;
  loading?: boolean;
  title: string;
  value: number | string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-8 w-16 animate-pulse rounded bg-muted" />
        ) : (
          <p className="text-2xl font-bold">{value}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const orgId =
    (session?.session as { activeOrganizationId?: string })?.activeOrganizationId || '';
  const token = session?.session?.token || '';

  const headers: Record<string, string> = {
    'Authorization': `Bearer ${token}`,
    'X-Organization-Id': orgId,
  };

  const { data: interactionsData, isLoading: interactionsLoading } =
    useQuery<InteractionsResponse>({
      enabled: !!orgId,
      queryFn: async () => {
        const res = await fetch(
          `${API_URL}/api/v1/interactions/organization/${orgId}?limit=5`,
          { headers },
        );
        if (!res.ok) return {};
        return res.json();
      },
      queryKey: ['dashboard-interactions', orgId],
    });

  const { data: patternsData, isLoading: patternsLoading } =
    useQuery<PatternsResponse>({
      enabled: !!orgId,
      queryFn: async () => {
        const res = await fetch(
          `${API_URL}/api/v1/patterns/organization/${orgId}?limit=5`,
          { headers },
        );
        if (!res.ok) return {};
        return res.json();
      },
      queryKey: ['dashboard-patterns', orgId],
    });

  const interactions = interactionsData?.interactions || interactionsData?.data || [];
  const patterns = patternsData?.patterns || patternsData?.data || [];
  const totalInteractions = interactionsData?.total ?? interactions.length;
  const totalPatterns = patternsData?.total ?? patterns.length;

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const recentInteractions = interactions.filter(
    (i) => new Date(i.timestamp ?? '').getTime() >= sevenDaysAgo.getTime(),
  ).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {session?.user?.name || session?.user?.email || 'User'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Activity}
          loading={interactionsLoading}
          title="Total Sessions"
          value={totalInteractions}
        />
        <StatCard
          icon={Layers}
          loading={patternsLoading}
          title="Active Patterns"
          value={totalPatterns}
        />
        <StatCard icon={Package} title="Products" value="—" />
        <StatCard
          icon={BarChart2}
          loading={interactionsLoading}
          title="Interactions (7d)"
          value={interactionsLoading ? '—' : recentInteractions}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            {interactionsLoading ? (
              <div className="space-y-2">
                {SKELETON_KEYS.map((k) => (
                  <div key={k} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : interactions.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No interactions yet
              </p>
            ) : (
              <div className="space-y-2">
                {interactions.slice(0, 5).map((interaction) => (
                  <div
                    key={interaction.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        {interaction.sourceType || 'unknown'}
                      </Badge>
                      <span className="max-w-[140px] truncate text-xs text-muted-foreground">
                        {interaction.summary || interaction.sessionId || interaction.id}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {interaction.timestamp
                        ? new Date(interaction.timestamp).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Patterns</CardTitle>
          </CardHeader>
          <CardContent>
            {patternsLoading ? (
              <div className="space-y-2">
                {SKELETON_KEYS.map((k) => (
                  <div key={k} className="h-10 animate-pulse rounded bg-muted" />
                ))}
              </div>
            ) : patterns.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No patterns detected yet
              </p>
            ) : (
              <div className="space-y-2">
                {patterns.slice(0, 5).map((pattern) => (
                  <div
                    key={pattern.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{pattern.type || 'pattern'}</Badge>
                      {pattern.confidence != null && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {pattern.detectedAt || pattern.generatedAt
                        ? new Date(
                            (pattern.detectedAt || pattern.generatedAt) as string,
                          ).toLocaleDateString()
                        : '—'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
