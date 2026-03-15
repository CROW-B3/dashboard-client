'use client';

import { GlassPanel, MetricsCard, PlanCard } from '@b3-crow/ui-kit';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Check, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
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

interface InteractionSummary {
  web: number;
  cctv: number;
  social: number;
  total: number;
}

export default function BillingPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;

  const { data: subscription, isLoading: subscriptionLoading } = useQuery<SubscriptionData | null>({
    queryKey: ['subscription', orgId],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/subscriptions/${orgId}`, {
        credentials: 'include',
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!orgId,
  });

  const { data: plansData } = useQuery<{ plans: Plan[] }>({
    queryKey: ['billing-plans'],
    queryFn: async () => {
      const res = await fetch(`${API_GATEWAY_URL}/api/v1/billing/plans`, {
        credentials: 'include',
      });
      if (!res.ok) return { plans: [] };
      return res.json();
    },
  });

  const { data: usageData } = useQuery<InteractionSummary>({
    queryKey: ['billing-usage', orgId],
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
      if (data?.url) {
        window.location.href = data.url;
      }
    },
    onError: () => toast.error('Failed to start checkout'),
  });

  const plans = plansData?.plans ?? [];
  const activeModules = subscription?.modules
    ? [
        subscription.modules.web && 'Web',
        subscription.modules.cctv && 'CCTV',
        subscription.modules.social && 'Social',
      ].filter(Boolean)
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your subscription and usage</p>
      </div>

      {subscriptionLoading ? (
        <div className="space-y-4">
          {['a', 'b', 'c'].map((k) => (
            <div key={k} className="h-24 animate-pulse rounded-xl bg-white/5" />
          ))}
        </div>
      ) : (
        <>
          <GlassPanel>
            <h2 className="text-lg font-semibold text-white mb-4">Current Plan</h2>
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

          <div>
            <h2 className="text-lg font-semibold text-white mb-4">Usage</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricsCard
                title="Total Interactions"
                value={String(usageData?.total ?? 0)}
                change=""
                changeType="neutral"
              />
              <MetricsCard
                title="Web Interactions"
                value={String(usageData?.web ?? 0)}
                change=""
                changeType="info"
              />
              <MetricsCard
                title="CCTV Interactions"
                value={String(usageData?.cctv ?? 0)}
                change=""
                changeType="info"
              />
              <MetricsCard
                title="Social Interactions"
                value={String(usageData?.social ?? 0)}
                change=""
                changeType="info"
              />
            </div>
          </div>

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
    </div>
  );
}
