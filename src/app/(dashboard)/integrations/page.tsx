'use client';

import type { ConnectionOptionStatus } from '@b3-crow/ui-kit';
import { CodeBlock, ConnectionOption, GlassPanel } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { Camera, Globe, Share2 } from 'lucide-react';
import { useState } from 'react';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiKey } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

type IntegrationSection = 'web' | 'cctv' | 'social' | null;

interface ApiKeyRecord {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: Date | string;
}

export default function IntegrationsPage() {
  const { data: user } = useCurrentUser();
  const orgId = user?.orgUuid;
  const [expandedSection, setExpandedSection] = useState<IntegrationSection>(null);

  const { data: interactionSummary } = useQuery<{ web: number; cctv: number; social: number; total: number }>({
    queryKey: ['integration-summary', orgId],
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

  const { data: apiKeys } = useQuery({
    queryKey: ['api-keys-integrations'],
    queryFn: async () => {
      const res = await apiKey.list();
      return (res.data as ApiKeyRecord[]) || [];
    },
  });

  const firstApiKey = apiKeys?.[0];

  const webConnectionStatus: ConnectionOptionStatus =
    (interactionSummary?.web ?? 0) > 0 ? 'connected' : 'not_started';
  const cctvConnectionStatus: ConnectionOptionStatus =
    (interactionSummary?.cctv ?? 0) > 0 ? 'connected' : 'not_started';
  const socialConnectionStatus: ConnectionOptionStatus =
    (interactionSummary?.social ?? 0) > 0 ? 'connected' : 'not_started';

  const apiKeyPlaceholder = firstApiKey?.start
    ? `${firstApiKey.start}...`
    : 'YOUR_API_KEY';

  const webSdkInstallCode = `npm install @b3-crow/web-sdk`;

  const webSdkSetupCode = `import { CrowTracker } from '@b3-crow/web-sdk';

const tracker = new CrowTracker({
  apiKey: '${apiKeyPlaceholder}',
  organizationId: '${orgId || 'YOUR_ORG_ID'}',
  endpoint: '${API_GATEWAY_URL}',
});

tracker.init();`;

  const cctvCliSetupCode = `# Install the CROW CCTV CLI
pip install crow-cctv-cli

# Configure with your API key
crow-cctv configure \\
  --api-key "${apiKeyPlaceholder}" \\
  --org-id "${orgId || 'YOUR_ORG_ID'}" \\
  --endpoint "${API_GATEWAY_URL}"

# Start streaming from a camera source
crow-cctv stream --source rtsp://camera-ip:554/stream1

# Or analyze a video file
crow-cctv analyze --file /path/to/video.mp4`;

  const socialWebhookUrl = `${API_GATEWAY_URL}/api/v1/interactions/create-interaction`;

  const socialWebhookPayload = `{
  "organizationId": "${orgId || 'YOUR_ORG_ID'}",
  "sourceType": "social",
  "data": {
    "platform": "twitter",
    "content": "Customer mentioned your product",
    "author": "username",
    "url": "https://twitter.com/..."
  },
  "summary": "Social mention detected",
  "timestamp": ${Date.now()}
}`;

  const socialCurlExample = `curl -X POST ${socialWebhookUrl} \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${apiKeyPlaceholder}" \\
  -d '${socialWebhookPayload}'`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Integrations</h1>
        <p className="text-gray-400 text-sm mt-1">Connect your data sources to CROW</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <ConnectionOption
          icon={<Globe className="h-5 w-5" />}
          title="Web SDK"
          description="Track customer interactions on your website"
          status={webConnectionStatus}
          onClick={() => setExpandedSection(expandedSection === 'web' ? null : 'web')}
        />
        <ConnectionOption
          icon={<Camera className="h-5 w-5" />}
          title="CCTV CLI"
          description="Analyze in-store camera feeds with AI"
          status={cctvConnectionStatus}
          onClick={() => setExpandedSection(expandedSection === 'cctv' ? null : 'cctv')}
        />
        <ConnectionOption
          icon={<Share2 className="h-5 w-5" />}
          title="Social Webhook"
          description="Receive social media interactions via webhooks"
          status={socialConnectionStatus}
          onClick={() => setExpandedSection(expandedSection === 'social' ? null : 'social')}
        />
      </div>

      {expandedSection === 'web' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Web SDK Setup</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">1. Install the SDK</p>
              <CodeBlock code={webSdkInstallCode} language="bash" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">2. Initialize in your app</p>
              <CodeBlock code={webSdkSetupCode} language="typescript" showCopy />
            </div>
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <p className="text-xs text-violet-300">
                The Web SDK automatically captures page views, click events, and session data.
                You can also manually track custom events using tracker.track('event_name', data).
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {expandedSection === 'cctv' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">CCTV CLI Setup</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Install and configure</p>
              <CodeBlock code={cctvCliSetupCode} language="bash" showCopy />
            </div>
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <p className="text-xs text-violet-300">
                The CCTV CLI uses AI to detect customer interactions from camera feeds.
                It supports RTSP streams, USB cameras, and video file analysis.
                Results are automatically sent to your CROW dashboard.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {expandedSection === 'social' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Social Webhook Setup</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Webhook URL</p>
              <CodeBlock code={socialWebhookUrl} language="text" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Example payload</p>
              <CodeBlock code={socialWebhookPayload} language="json" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Example cURL</p>
              <CodeBlock code={socialCurlExample} language="bash" showCopy />
            </div>
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <p className="text-xs text-violet-300">
                Configure your social media monitoring tool to send webhook requests to the URL above.
                Include the Authorization header with your API key for authentication.
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {!firstApiKey && (
        <GlassPanel>
          <div className="text-center py-4">
            <p className="text-yellow-400 text-sm font-medium mb-1">API Key Required</p>
            <p className="text-gray-400 text-sm">
              Create an API key in{' '}
              <a href="/dashboard/settings" className="text-violet-400 hover:text-violet-300 underline">
                Settings
              </a>
              {' '}to use integrations.
            </p>
          </div>
        </GlassPanel>
      )}
    </div>
  );
}
