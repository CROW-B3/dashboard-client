'use client';

import type { ConnectionOptionStatus } from '@b3-crow/ui-kit';

import { CodeBlock, ConnectionOption, GlassPanel, Header } from '@b3-crow/ui-kit';
import { useQuery } from '@tanstack/react-query';
import { Bot, Camera, Globe, Share2, Workflow } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useMobileSidebar } from '@/contexts/MobileSidebarContext';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiKey } from '@/lib/auth-client';

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

type IntegrationSection = 'web' | 'cctv' | 'social' | 'mcp' | 'a2a' | null;

interface ApiKeyRecord {
  id: string;
  name: string | null;
  start: string | null;
  createdAt: Date | string;
}

export default function IntegrationsPage() {
  const router = useRouter();

  const { data: user } = useCurrentUser();
  const { toggle } = useMobileSidebar();
  const orgId = user?.organizationId;
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

  const mcpConnectionStatus: ConnectionOptionStatus = firstApiKey ? 'connected' : 'not_started';
  const a2aConnectionStatus: ConnectionOptionStatus = firstApiKey ? 'connected' : 'not_started';

  const mcpConfigCode = `{
  "mcpServers": {
    "crow-analytics": {
      "url": "https://mcp.crowai.dev/mcp",
      "headers": {
        "Authorization": "Bearer ${apiKeyPlaceholder}",
        "X-Organization-Id": "${orgId || 'YOUR_ORG_ID'}"
      }
    }
  }
}`;

  const a2aExampleCode = `from a2a_client import A2AClient

client = A2AClient(
    url="https://a2a.crowai.dev/a2a",
    api_key="${apiKeyPlaceholder}"
)

response = client.send_task({
    "message": "What are our top performing products?",
    "organization_id": "${orgId || 'YOUR_ORG_ID'}"
})`;

  return (
    <div className="flex flex-col min-h-screen">
      <Header userInitials={user ? (user.name || user.email || '').slice(0, 2).toUpperCase() : ''} showNotification={false} minimal onMenuClick={toggle} logoSrc="/favicon.webp"
        onAvatarClick={() => router.push('/dashboard/settings')} />
      <main className="flex-1 px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8">
        <div className="max-w-[1400px] mx-auto space-y-6">
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
          onClick={() => setExpandedSection(prev => prev === 'web' ? null : 'web')}
        />
        <ConnectionOption
          icon={<Camera className="h-5 w-5" />}
          title="CCTV CLI"
          description="Analyze in-store camera feeds with AI"
          status={cctvConnectionStatus}
          onClick={() => setExpandedSection(prev => prev === 'cctv' ? null : 'cctv')}
        />
        <ConnectionOption
          icon={<Share2 className="h-5 w-5" />}
          title="Social Webhook"
          description="Receive social media interactions via webhooks"
          status={socialConnectionStatus}
          onClick={() => setExpandedSection(prev => prev === 'social' ? null : 'social')}
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

      <div>
        <h2 className="text-xl font-bold text-white">AI & Protocol Integrations</h2>
        <p className="text-gray-400 text-sm mt-1">Connect AI assistants and agents to CROW</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ConnectionOption
          icon={<Bot className="h-5 w-5" />}
          title="MCP Server"
          description="Connect AI assistants like Claude Desktop to your CROW data"
          status={mcpConnectionStatus}
          onClick={() => setExpandedSection(prev => prev === 'mcp' ? null : 'mcp')}
        />
        <ConnectionOption
          icon={<Workflow className="h-5 w-5" />}
          title="Agent-to-Agent"
          description="Connect external AI agents via the A2A protocol"
          status={a2aConnectionStatus}
          onClick={() => setExpandedSection(prev => prev === 'a2a' ? null : 'a2a')}
        />
      </div>

      {expandedSection === 'mcp' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">MCP Server Setup</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Claude Desktop Configuration</p>
              <CodeBlock code={mcpConfigCode} language="json" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Available Tools</p>
              <ul className="space-y-2 text-sm text-gray-300">
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_search_products</code> — Search product catalog</li>
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_search_interactions</code> — Search customer interactions</li>
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_get_interaction_summary</code> — Get channel breakdown</li>
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_search_patterns</code> — Search behavioral patterns</li>
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_get_product_ai_descriptions</code> — Get AI product descriptions</li>
                <li><code className="text-violet-400 bg-white/5 px-1.5 py-0.5 rounded text-xs">crow_search_org_context</code> — Search organization knowledge base</li>
              </ul>
            </div>
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <p className="text-xs text-violet-300">
                Add this to your Claude Desktop config file at <code className="bg-white/5 px-1 py-0.5 rounded">~/Library/Application Support/Claude/claude_desktop_config.json</code>
              </p>
            </div>
          </div>
        </GlassPanel>
      )}

      {expandedSection === 'a2a' && (
        <GlassPanel>
          <h2 className="text-lg font-semibold text-white mb-4">Agent-to-Agent Setup</h2>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">A2A Endpoint URL</p>
              <CodeBlock code="https://a2a.crowai.dev/a2a/jsonrpc" language="text" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Agent Card URL (Discovery)</p>
              <CodeBlock code="https://a2a.crowai.dev/.well-known/agent-card.json" language="text" showCopy />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider">Example Python Client</p>
              <CodeBlock code={a2aExampleCode} language="python" showCopy />
            </div>
            <div className="rounded-lg bg-violet-500/10 border border-violet-500/20 p-3">
              <p className="text-xs text-violet-300">
                The A2A protocol allows any AI agent to interact with CROW{"'"}s analytics engine. Use the Agent Card URL for automatic discovery.
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
      </main>
    </div>
  );
}
