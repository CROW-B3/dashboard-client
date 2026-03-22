'use client';

import { GlassPanel, Header, MetricsCard, PlanCard } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, CreditCard, Download, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface SubscriptionData {
  id: string;
  organizationId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  modules: { web: boolean; cctv: boolean; social: boolean };
  payAsYouGo: boolean;
  billingPeriod: 'monthly' | 'annual';
  status: 'active' | 'cancelled' | 'past_due';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId?: string;
  features: string[];
}

interface Invoice {
  id: string;
  number: string | null;
  status: string | null;
  amountDue: number;
  amountPaid: number;
  currency: string;
  created: string;
  periodStart: string;
  periodEnd: string;
  hostedInvoiceUrl: string | null;
  invoicePdf: string | null;
}

interface PaymentMethod {
  id: string;
  type: string;
  card: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  } | null;
}

interface ModuleUsage {
  module: string;
  current: number;
  limit: number;
  percentage: number;
}

interface UsageData {
  modules: ModuleUsage[];
  totalInteractions: number;
  billingPeriodStart: string;
  billingPeriodEnd: string;
}

function fetchJson<T>(url: string): () => Promise<T | null> {
  return async () => {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) return null;
    return (await res.json()) as T;
  };
}

function getUsageColor(percentage: number): string {
  if (percentage >= 90) return 'bg-red-500';
  if (percentage >= 70) return 'bg-yellow-500';
  return 'bg-green-500';
}

function getUsageTextColor(percentage: number): string {
  if (percentage >= 90) return 'text-red-400';
  if (percentage >= 70) return 'text-yellow-400';
  return 'text-green-400';
}

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function UsageProgressBar({ usage }: { usage: ModuleUsage }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-white capitalize">{usage.module}</span>
        <span className={`text-xs font-medium ${getUsageTextColor(usage.percentage)}`}>
          {usage.current.toLocaleString()} / {usage.limit.toLocaleString()}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-white/10">
        <div
          className={`h-2 rounded-full transition-all ${getUsageColor(usage.percentage)}`}
          style={{ width: `${Math.min(usage.percentage, 100)}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{usage.percentage}% used</p>
    </div>
  );
}

function InvoiceStatusBadge({ status }: { status: string | null }) {
  const styles: Record<string, string> = {
    paid: 'bg-green-500/20 text-green-300 border-green-500/30',
    open: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    draft: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    uncollectible: 'bg-red-500/20 text-red-300 border-red-500/30',
    void: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };

  const displayStatus = status ?? 'unknown';
  const className = styles[displayStatus] ?? styles.draft;

  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium border ${className}`}>
      {displayStatus}
    </span>
  );
}

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

export default function BillingPage() {
  const { data: user } = useCurrentUser();
  const { toggle } = useMobileSidebar();
  const orgId = user?.organizationId;
  const queryClient = useQueryClient();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionData | null>({
    queryKey: ['subscription', orgId],
    queryFn: fetchJson<SubscriptionData>(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgId}`),
    enabled: !!orgId,
  });

  const { data: interactionSummary } = useQuery<InteractionSummary>({
    queryKey: ['interactions-summary', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/interactions/organization/${orgId}/summary`, { credentials: 'include' });
      if (!res.ok) return { web: 0, cctv: 0, social: 0, total: 0 };
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: plansData } = useQuery<{ plans: Plan[] }>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/plans`, { credentials: 'include' });
      if (!res.ok) return { plans: [] };
      return res.json();
    },
  });

  const { data: usageData } = useQuery<UsageData | null>({
    queryKey: ['billing-usage', orgId],
    queryFn: fetchJson<UsageData>(`${API_GATEWAY_URL}/api/v1/billing/usage/${orgId}`),
    enabled: !!orgId && !!subscription,
  });

  const { data: invoicesData } = useQuery<{ invoices: Invoice[] } | null>({
    queryKey: ['billing-invoices', orgId],
    queryFn: fetchJson<{ invoices: Invoice[] }>(`${API_GATEWAY_URL}/api/v1/billing/invoices/${orgId}`),
    enabled: !!orgId && !!subscription,
  });

  const { data: paymentMethodsData } = useQuery<{ paymentMethods: PaymentMethod[] } | null>({
    queryKey: ['billing-payment-methods', orgId],
    queryFn: fetchJson<{ paymentMethods: PaymentMethod[] }>(`${API_GATEWAY_URL}/api/v1/billing/payment-methods/${orgId}`),
    enabled: !!orgId && !!subscription,
  });

  const checkoutMutation = useMutation({
    mutationFn: async (_planId: string) => {
      const builderRes = await fetch(`${API_GATEWAY_URL}/api/v1/billing/billing-builders`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organizationId: orgId,
          modules: ['web'],
          billingPeriod: 'monthly',
        }),
      });
      if (!builderRes.ok) throw new Error('Failed to create billing builder');
      const builder = (await builderRes.json()) as { id: string };

      const checkoutRes = await fetch(`${API_GATEWAY_URL}/api/v1/billing/checkout/session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billingBuilderId: builder.id,
          organizationName: user?.orgName,
          successUrl: `${window.location.origin}/billing?success=true`,
          cancelUrl: `${window.location.origin}/billing?cancelled=true`,
        }),
      });
      if (!checkoutRes.ok) throw new Error('Failed to create checkout session');
      return (await checkoutRes.json()) as { url: string };
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: () => toast.error('Failed to start checkout'),
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgId}/cancel`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to cancel subscription');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Subscription will be cancelled at the end of the billing period');
      setCancelDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['subscription', orgId] });
    },
    onError: () => toast.error('Failed to cancel subscription'),
  });

  const resumeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgId}/resume`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to resume subscription');
      return res.json();
    },
    onSuccess: () => {
      toast.success('Subscription resumed');
      queryClient.invalidateQueries({ queryKey: ['subscription', orgId] });
    },
    onError: () => toast.error('Failed to resume subscription'),
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/portal-session`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnUrl: window.location.href }),
      });
      if (!res.ok) throw new Error('Failed to create portal session');
      return (await res.json()) as { url: string };
    },
    onSuccess: (data) => {
      if (data?.url) window.location.href = data.url;
    },
    onError: () => toast.error('Failed to open billing portal'),
  });

  const plans = plansData?.plans ?? [];
  const invoices = invoicesData?.invoices ?? [];
  const paymentMethods = paymentMethodsData?.paymentMethods ?? [];
  const primaryCard = paymentMethods.find(pm => pm.card !== null);

  const activeModules = subscription?.modules
    ? [
        subscription.modules.web && 'Web',
        subscription.modules.cctv && 'CCTV',
        subscription.modules.social && 'Social',
      ].filter(Boolean)
    : [];

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials={(user?.name || user?.email || 'U').slice(0, 2).toUpperCase()} showNotification={false} minimal onMenuClick={toggle} logoSrc="/favicon.webp" />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      {subscriptionLoading ? (
        <div className="space-y-4">
          {['a', 'b', 'c', 'd', 'e'].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <GlassPanel>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Current Plan</h2>
              {subscription && (
                <div className="flex items-center gap-2">
                  {subscription.status === 'cancelled' ? (
                    <Button
                      size="sm"
                      onClick={() => resumeMutation.mutate()}
                      disabled={resumeMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      {resumeMutation.isPending ? 'Resuming...' : 'Resume Subscription'}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => setCancelDialogOpen(true)}
                    >
                      Cancel Subscription
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => portalMutation.mutate()}
                    disabled={portalMutation.isPending}
                    className="border-white/20 text-white hover:bg-white/10"
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    {portalMutation.isPending ? 'Opening...' : 'Manage Subscription'}
                  </Button>
                </div>
              )}
            </div>
            {subscription ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-5 w-5 text-violet-400" />
                    <div>
                      <p className="text-white font-medium capitalize">{subscription.billingPeriod} Plan</p>
                      <p className="text-xs text-gray-400">
                        Active since {new Date(subscription.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    subscription.status === 'active'
                      ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                      : subscription.status === 'past_due'
                      ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      : 'bg-red-500/20 text-red-300 border border-red-500/30'
                  }`}>
                    {subscription.status}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-gray-400">Billing Period</p>
                    <p className="text-sm text-white capitalize">{subscription.billingPeriod}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-gray-400">Next Renewal</p>
                    <p className="text-sm text-white">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-gray-400">Active Modules</p>
                    <p className="text-sm text-white">{activeModules.join(', ') || 'None'}</p>
                  </div>
                  <div className="rounded-lg bg-white/5 border border-white/10 p-3">
                    <p className="text-xs text-gray-400">Pay As You Go</p>
                    <p className="text-sm text-white">{subscription.payAsYouGo ? 'Enabled' : 'Disabled'}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-400 text-sm">No active subscription. Choose a plan below to get started.</p>
              </div>
            )}
          </GlassPanel>

          {subscription && usageData && (
            <GlassPanel>
              <h2 className="text-lg font-semibold text-white mb-4">Usage</h2>
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-400">Billing period</span>
                  <span className="text-xs text-gray-500">
                    {new Date(usageData.billingPeriodStart).toLocaleDateString()} - {new Date(usageData.billingPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-white">
                  Total interactions: {usageData.totalInteractions.toLocaleString()}
                </p>
              </div>
              <div className="space-y-4">
                {usageData.modules.map((usage) => (
                  <UsageProgressBar key={usage.module} usage={usage} />
                ))}
              </div>
              {usageData.modules.length === 0 && (
                <p className="text-gray-500 text-sm">No active modules to track usage for.</p>
              )}
            </GlassPanel>
          )}

          {!subscription && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Usage</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricsCard title="Total Interactions" value={String(interactionSummary?.total ?? 0)} change="" changeType="neutral" />
                <MetricsCard title="Web Interactions" value={String(interactionSummary?.web ?? 0)} change="" changeType="info" />
                <MetricsCard title="CCTV Interactions" value={String(interactionSummary?.cctv ?? 0)} change="" changeType="info" />
                <MetricsCard title="Social Interactions" value={String(interactionSummary?.social ?? 0)} change="" changeType="info" />
              </div>
            </div>
          )}

          {subscription && invoices.length > 0 && (
            <GlassPanel>
              <h2 className="text-lg font-semibold text-white mb-4">Invoice History</h2>
              <div className="rounded-lg border border-white/10 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-gray-400">Invoice</TableHead>
                      <TableHead className="text-gray-400">Date</TableHead>
                      <TableHead className="text-gray-400">Amount</TableHead>
                      <TableHead className="text-gray-400">Status</TableHead>
                      <TableHead className="text-gray-400 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invoices.map((invoice) => (
                      <TableRow key={invoice.id} className="border-white/10">
                        <TableCell className="text-white text-sm">
                          {invoice.number ?? invoice.id.slice(0, 12)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {new Date(invoice.created).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-white text-sm">
                          {formatCurrency(invoice.amountDue, invoice.currency)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {invoice.invoicePdf && (
                              <a
                                href={invoice.invoicePdf}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <Download className="h-4 w-4" />
                              </a>
                            )}
                            {invoice.hostedInvoiceUrl && (
                              <a
                                href={invoice.hostedInvoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-gray-400 hover:text-white transition-colors"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </GlassPanel>
          )}

          {subscription && (
            <GlassPanel>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Payment Method</h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => portalMutation.mutate()}
                  disabled={portalMutation.isPending}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Update Payment Method
                </Button>
              </div>
              {primaryCard?.card ? (
                <div className="flex items-center gap-4 rounded-lg bg-white/5 border border-white/10 p-4">
                  <CreditCard className="h-8 w-8 text-violet-400" />
                  <div>
                    <p className="text-white font-medium capitalize">
                      {primaryCard.card.brand} ending in {primaryCard.card.last4}
                    </p>
                    <p className="text-xs text-gray-400">
                      Expires {String(primaryCard.card.expMonth).padStart(2, '0')}/{primaryCard.card.expYear}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-400 text-sm">No payment method on file.</p>
                </div>
              )}
            </GlassPanel>
          )}

          {plans.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">Available Plans</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {plans.map((plan) => (
                  <PlanCard
                    key={plan.id}
                    header={{
                      title: plan.name,
                      description: `$${plan.price}/mo`,
                    }}
                    price={{
                      amount: String(plan.price),
                      period: 'month',
                      currency: '$',
                    }}
                    features={plan.features.map((feature) => ({
                      icon: <Check className="h-4 w-4 text-green-400" />,
                      text: feature,
                    }))}
                    footer={{
                      buttons: [
                        {
                          text: checkoutMutation.isPending ? 'Processing...' : 'Upgrade',
                          variant: 'primary',
                          onClick: () => checkoutMutation.mutate(plan.id),
                        },
                      ],
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {plans.length === 0 && !subscription && (
            <GlassPanel>
              <div className="text-center py-6">
                <CreditCard className="h-10 w-10 text-gray-500 mx-auto mb-3" />
                <h3 className="text-white font-medium mb-1">No Plans Available</h3>
                <p className="text-gray-400 text-sm">
                  Billing plans are being configured. Please check back later or contact support.
                </p>
              </div>
            </GlassPanel>
          )}
        </>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Cancel Subscription</DialogTitle>
            <DialogDescription className="text-gray-400">
              Your subscription will remain active until the end of the current billing period on{' '}
              {subscription ? new Date(subscription.currentPeriodEnd).toLocaleDateString() : ''}.
              You can resume your subscription at any time before then.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Keep Subscription
            </Button>
            <Button
              variant="destructive"
              onClick={() => cancelMutation.mutate()}
              disabled={cancelMutation.isPending}
            >
              {cancelMutation.isPending ? 'Cancelling...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
        </div>
      </main>
    </div>
  );
}
