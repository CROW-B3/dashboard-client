'use client';

import type { Message } from './types';
import { GeneratingState, MessageBubble, SearchInput } from '@b3-crow/ui-kit';
import { useEffect, useRef } from 'react';
import { AttachmentButton } from './AttachmentButton';
import { AttachmentMenu } from './AttachmentMenu';
import { TEXT } from './constants';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatViewProps {
  isVisible: boolean;
  messages: Message[];
  isGenerating: boolean;
  copiedMessageId: string | null;
  showAttachMenu: boolean;
  onQuerySubmit: (query: string) => void;
  onCopyMessage: (messageId: string, content: string) => void;
  onAttachMenuToggle: () => void;
  onAttachOption: (type: string) => void;
}

function AssistantMessage({ content, isCopied, onCopy }: { content: string; isCopied: boolean; onCopy: () => void }) {
  return (
    <div className="flex justify-start animate-fadeIn">
      <div className="group relative max-w-[85%] rounded-2xl px-4 py-3 bg-white/[0.05] border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <img src="/favicon.webp" alt="CROW" className="w-5 h-5 rounded-full" />
          <span className="text-xs font-medium text-violet-400">CROW</span>
        </div>
        <MarkdownRenderer content={content} />
        <button
          type="button"
          onClick={onCopy}
          className="absolute -bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 hover:bg-white/10"
          aria-label="Copy message"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isCopied ? '#22c55e' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isCopied
              ? <path d="M20 6L9 17l-5-5" />
              : <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></>}
          </svg>
        </button>
      </div>
    </div>
  );
}

function MessagesContainer({
  messages,
  isGenerating,
  copiedMessageId,
  onCopyMessage,
  messagesEndRef,
}: {
  messages: Message[];
  isGenerating: boolean;
  copiedMessageId: string | null;
  onCopyMessage: (messageId: string, content: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="flex-1 overflow-y-auto py-6 space-y-6">
      {messages.map((message) =>
        message.role === 'assistant' ? (
          <AssistantMessage
            key={message.id}
            content={message.content}
            isCopied={copiedMessageId === message.id}
            onCopy={() => onCopyMessage(message.id, message.content)}
          />
        ) : (
          <MessageBubble
            key={message.id}
            content={message.content}
            role={message.role}
            isCopied={copiedMessageId === message.id}
            onCopy={() => onCopyMessage(message.id, message.content)}
          />
        )
      )}

      {isGenerating && <GeneratingState label="Processing your request" subtitle="CROW is thinking" avatarSrc="/favicon.webp" avatarAlt="CROW" />}

      <div ref={messagesEndRef} />
    </div>
  );
}

function ChatInput({
  onSubmit,
  showAttachMenu,
  onAttachMenuToggle,
  onAttachOption,
}: {
  onSubmit: (query: string) => void;
  showAttachMenu: boolean;
  onAttachMenuToggle: () => void;
  onAttachOption: (type: string) => void;
}) {
  return (
    <div className="sticky bottom-0 pb-4 pt-6">
      <div className="w-full relative [&_button[aria-label='Submit']_svg]:rotate-[-90deg] [&_.absolute.left-4]:hidden">
        <div className="absolute top-0 h-[48px] sm:h-[54px] z-20 flex items-center justify-center" style={{ left: '1rem' }}>
          <AttachmentButton onClick={onAttachMenuToggle} />
          <AttachmentMenu isOpen={showAttachMenu} onOptionSelect={onAttachOption} onClose={onAttachMenuToggle} />
        </div>
        <SearchInput
          className="w-full"
          placeholder={TEXT.SEARCH_PLACEHOLDER_CHAT}
          onSubmit={onSubmit}
          showMicButton={false}
          variant="transparent"
        />
      </div>
    </div>
  );
}

export function ChatView({
  isVisible,
  messages,
  isGenerating,
  copiedMessageId,
  showAttachMenu,
  onQuerySubmit,
  onCopyMessage,
  onAttachMenuToggle,
  onAttachOption,
}: ChatViewProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  if (!isVisible) return null;

  return (
    <div className="flex-1 flex flex-col w-full max-w-[800px] mx-auto transition-all duration-500 ease-out opacity-100 translate-y-0">
      <MessagesContainer
        messages={messages}
        isGenerating={isGenerating}
        copiedMessageId={copiedMessageId}
        onCopyMessage={onCopyMessage}
        messagesEndRef={messagesEndRef}
      />

      <ChatInput
        onSubmit={onQuerySubmit}
        showAttachMenu={showAttachMenu}
        onAttachMenuToggle={onAttachMenuToggle}
        onAttachOption={onAttachOption}
      />
    </div>
  );
}
