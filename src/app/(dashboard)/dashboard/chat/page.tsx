'use client';

import { GlassPanel } from '@b3-crow/ui-kit';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Send, Trash2 } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { LatexBlock } from '@/components/latex-renderer';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/hooks/use-current-user';

const MermaidDiagram = dynamic(
  () => import('@/components/mermaid-diagram').then(m => ({ default: m.MermaidDiagram })),
  { ssr: false, loading: () => <div className="my-2 rounded-lg border border-white/10 bg-black/20 p-6 text-center text-xs text-gray-500">Loading diagram...</div> },
);

const API_GATEWAY_URL = process.env.NEXT_PUBLIC_API_GATEWAY_URL || 'http://localhost:8000';

interface SourceReference {
  index: number;
  type: string;
  label: string;
}

interface ChatMessage {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  references: SourceReference[] | null;
  createdAt: number;
}

interface ChatSession {
  id: string;
  organizationId: string;
  createdAt: number;
}

interface MessagesResponse {
  messages: ChatMessage[];
  total: number;
  page: number;
  limit: number;
}

async function fetchChatSessions(organizationId: string): Promise<ChatSession[]> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/organization/${organizationId}`,
    { credentials: 'include' },
  );
  if (!response.ok) return [];
  const data = await response.json() as { sessions: ChatSession[] };
  return data.sessions;
}

async function fetchChatMessages(sessionId: string): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/${sessionId}/messages?limit=50`,
    { credentials: 'include' },
  );
  if (!response.ok) return [];
  const data = await response.json() as MessagesResponse;
  return data.messages;
}

async function createChatSession(organizationId: string): Promise<string> {
  const response = await fetch(`${API_GATEWAY_URL}/api/v1/chat/sessions`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ organizationId }),
  });
  if (!response.ok) throw new Error('Failed to create session');
  const data = await response.json() as { sessionId: string };
  return data.sessionId;
}

async function sendChatMessage(
  sessionId: string,
  content: string,
  organizationId: string,
): Promise<ChatMessage> {
  const response = await fetch(
    `${API_GATEWAY_URL}/api/v1/chat/sessions/${sessionId}/messages`,
    {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, organizationId }),
    },
  );
  if (!response.ok) throw new Error('Failed to send message');
  const data = await response.json() as { message: ChatMessage };
  return data.message;
}

async function deleteChatSession(sessionId: string): Promise<void> {
  await fetch(`${API_GATEWAY_URL}/api/v1/chat/sessions/${sessionId}`, {
    method: 'DELETE',
    credentials: 'include',
  });
}

function formatSessionTimestamp(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function renderInlineMarkdown(text: string): React.ReactNode[] {
  const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*|\$[^$]+\$)/g);
  return segments.map((segment, segmentIndex) => {
    if (segment.startsWith('`') && segment.endsWith('`'))
      return <code key={segmentIndex} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs text-purple-300">{segment.slice(1, -1)}</code>;
    if (segment.startsWith('**') && segment.endsWith('**'))
      return <strong key={segmentIndex} className="font-semibold text-white">{segment.slice(2, -2)}</strong>;
    if (segment.startsWith('*') && segment.endsWith('*'))
      return <em key={segmentIndex} className="italic text-gray-300">{segment.slice(1, -1)}</em>;
    if (segment.startsWith('$') && segment.endsWith('$') && segment.length > 2)
      return <LatexBlock key={segmentIndex} expression={segment.slice(1, -1)} />;
    return <span key={segmentIndex}>{segment}</span>;
  });
}

function renderCodeBlock(codeContent: string, language: string): React.ReactNode {
  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10">
      {language && (
        <div className="border-b border-white/10 bg-white/5 px-3 py-1 text-xs text-gray-400">
          {language}
        </div>
      )}
      <pre className="overflow-x-auto bg-black/30 p-3 text-sm">
        <code className="font-mono text-gray-300">{codeContent}</code>
      </pre>
    </div>
  );
}

function renderMarkdownContent(content: string): React.ReactNode {
  const blockPattern = /(\$\$[\s\S]*?\$\$|```(\w*)\n([\s\S]*?)```)/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match = blockPattern.exec(content);

  while (match !== null) {
    if (match.index > lastIndex)
      parts.push(...renderPlainTextBlocks(content.slice(lastIndex, match.index), parts.length));
    if (match[0].startsWith('$$')) {
      const expression = match[0].slice(2, -2);
      parts.push(<div key={`latex-${match.index}`}><LatexBlock expression={expression} displayMode /></div>);
    } else {
      const language = match[2] ?? '';
      const codeContent = match[3] ?? '';
      if (language === 'mermaid') {
        parts.push(<div key={`mermaid-${match.index}`}><MermaidDiagram chart={codeContent} /></div>);
      } else {
        parts.push(<div key={`code-${match.index}`}>{renderCodeBlock(codeContent, language)}</div>);
      }
    }
    lastIndex = match.index + match[0].length;
    match = blockPattern.exec(content);
  }

  if (lastIndex < content.length)
    parts.push(...renderPlainTextBlocks(content.slice(lastIndex), parts.length));

  return <div className="space-y-1">{parts}</div>;
}

function renderPlainTextBlocks(text: string, keyOffset: number): React.ReactNode[] {
  return text.split('\n').map((line, lineIndex) => {
    const key = `line-${keyOffset}-${lineIndex}`;
    if (line.startsWith('### '))
      return <h3 key={key} className="mt-2 text-sm font-semibold text-white">{line.slice(4)}</h3>;
    if (line.startsWith('## '))
      return <h2 key={key} className="mt-2 text-base font-semibold text-white">{line.slice(3)}</h2>;
    if (line.startsWith('# '))
      return <h1 key={key} className="mt-2 text-lg font-bold text-white">{line.slice(2)}</h1>;
    if (line.startsWith('- ') || line.startsWith('* '))
      return <li key={key} className="ml-4 list-disc text-gray-300">{renderInlineMarkdown(line.slice(2))}</li>;
    if (/^\d+\.\s/.test(line))
      return <li key={key} className="ml-4 list-decimal text-gray-300">{renderInlineMarkdown(line.replace(/^\d+\.\s/, ''))}</li>;
    if (line.trim() === '')
      return <div key={key} className="h-1" />;
    return <p key={key} className="text-gray-300">{renderInlineMarkdown(line)}</p>;
  });
}

const referenceTypeStyleMap: Record<string, string> = {
  product: 'border border-blue-500/30 bg-blue-500/20 text-blue-300',
  interaction: 'border border-green-500/30 bg-green-500/20 text-green-300',
  pattern: 'border border-purple-500/30 bg-purple-500/20 text-purple-300',
};

function ReferenceBadgeList({ references }: { references: SourceReference[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {references.map(ref => (
        <span
          key={ref.index}
          className={cn(
            'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
            referenceTypeStyleMap[ref.type] ?? 'border border-gray-500/30 bg-gray-500/20 text-gray-300',
          )}
        >
          [{ref.index}] {ref.label}
        </span>
      ))}
    </div>
  );
}

function cn(...classes: (string | false | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  const isAssistant = message.role === 'assistant';
  return (
    <div className={cn('flex w-full', isAssistant ? 'justify-start' : 'justify-end')}>
      <div className={cn(
        'max-w-[80%] rounded-xl px-4 py-3 text-sm',
        isAssistant
          ? 'bg-white/[0.04] border border-white/[0.08] text-gray-200'
          : 'bg-purple-600/30 border border-purple-500/30 text-white',
      )}>
        {isAssistant ? renderMarkdownContent(message.content) : <p>{message.content}</p>}
        {isAssistant && message.references && message.references.length > 0 && (
          <ReferenceBadgeList references={message.references} />
        )}
      </div>
    </div>
  );
}

function SessionListItem({
  session,
  isActive,
  onSelect,
  onDelete,
}: {
  session: ChatSession;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        'group flex cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
        isActive ? 'bg-purple-600/20 border border-purple-500/30 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200',
      )}
    >
      <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-2 text-left">
        <MessageSquare className="size-3.5 shrink-0" />
        <span className="truncate">{formatSessionTimestamp(session.createdAt)}</span>
      </button>
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDelete(); }}
        className="ml-2 hidden rounded p-1 text-gray-500 hover:bg-white/10 hover:text-red-400 group-hover:block"
      >
        <Trash2 className="size-3" />
      </button>
    </div>
  );
}

function EmptyChatState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="rounded-full border border-white/10 bg-white/5 p-4">
        <MessageSquare className="size-8 text-purple-400" />
      </div>
      <h3 className="mt-4 text-lg font-medium text-white">Start a conversation</h3>
      <p className="mt-1 max-w-sm text-sm text-gray-400">
        Ask about your products, customer interactions, or behavioral patterns.
      </p>
    </div>
  );
}

export default function ChatPage() {
  const { data: user } = useCurrentUser();
  const organizationId = user?.orgUuid;
  const queryClient = useQueryClient();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [pendingUserMessage, setPendingUserMessage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: sessions } = useQuery({
    queryKey: ['chat-sessions', organizationId],
    queryFn: () => fetchChatSessions(organizationId!),
    enabled: !!organizationId,
  });

  const { data: messages } = useQuery({
    queryKey: ['chat-messages', activeSessionId],
    queryFn: () => fetchChatMessages(activeSessionId!),
    enabled: !!activeSessionId,
  });

  const scrollToBottomOfMessageList = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottomOfMessageList(); }, [messages, pendingUserMessage, scrollToBottomOfMessageList]);

  const createSessionMutation = useMutation({
    mutationFn: () => createChatSession(organizationId!),
    onSuccess: (newSessionId) => {
      setActiveSessionId(newSessionId);
      void queryClient.invalidateQueries({ queryKey: ['chat-sessions', organizationId] });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => sendChatMessage(activeSessionId!, content, organizationId!),
    onSuccess: () => {
      setPendingUserMessage(null);
      void queryClient.invalidateQueries({ queryKey: ['chat-messages', activeSessionId] });
    },
    onError: () => {
      setPendingUserMessage(null);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteChatSession,
    onSuccess: (_, deletedSessionId) => {
      if (activeSessionId === deletedSessionId) setActiveSessionId(null);
      void queryClient.invalidateQueries({ queryKey: ['chat-sessions', organizationId] });
    },
  });

  const handleSendMessage = useCallback(() => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || !activeSessionId || sendMessageMutation.isPending) return;
    setPendingUserMessage(trimmedInput);
    setInputValue('');
    sendMessageMutation.mutate(trimmedInput);
  }, [inputValue, activeSessionId, sendMessageMutation]);

  const handleKeyDownOnInput = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4">
      <GlassPanel className="flex w-64 shrink-0 flex-col p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white">Sessions</h2>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={() => createSessionMutation.mutate()}
            disabled={!organizationId || createSessionMutation.isPending}
          >
            <Plus className="size-3.5 text-gray-400" />
          </Button>
        </div>
        <div className="flex-1 space-y-1 overflow-y-auto">
          {(sessions ?? []).map(session => (
            <SessionListItem
              key={session.id}
              session={session}
              isActive={session.id === activeSessionId}
              onSelect={() => setActiveSessionId(session.id)}
              onDelete={() => deleteSessionMutation.mutate(session.id)}
            />
          ))}
          {(!sessions || sessions.length === 0) && (
            <p className="px-2 py-4 text-center text-xs text-gray-500">No sessions yet</p>
          )}
        </div>
      </GlassPanel>

      <GlassPanel className="flex flex-1 flex-col">
        {!activeSessionId ? (
          <EmptyChatState />
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {(messages ?? []).map(message => (
                <ChatMessageBubble key={message.id} message={message} />
              ))}
              {pendingUserMessage && (
                <div className="flex w-full justify-end">
                  <div className="max-w-[80%] rounded-xl border border-purple-500/30 bg-purple-600/30 px-4 py-3 text-sm text-white">
                    <p>{pendingUserMessage}</p>
                  </div>
                </div>
              )}
              {sendMessageMutation.isPending && (
                <div className="flex w-full justify-start">
                  <div className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <div className="flex gap-1">
                        <span className="size-1.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '0ms' }} />
                        <span className="size-1.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '150ms' }} />
                        <span className="size-1.5 animate-bounce rounded-full bg-purple-400" style={{ animationDelay: '300ms' }} />
                      </div>
                      Thinking...
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="border-t border-white/[0.08] p-4">
              <div className="flex items-end gap-2">
                <textarea
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDownOnInput}
                  placeholder="Ask about products, interactions, or patterns..."
                  rows={1}
                  className="flex-1 resize-none rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-purple-500/50 focus:outline-none focus:ring-1 focus:ring-purple-500/30"
                  disabled={sendMessageMutation.isPending}
                />
                <Button
                  variant="default"
                  size="default"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || sendMessageMutation.isPending}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </GlassPanel>
    </div>
  );
}
