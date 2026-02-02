'use client';

import type { Message } from './types';
import { GeneratingState, MessageBubble, SearchInput } from '@b3-crow/ui-kit';
import { useEffect, useRef } from 'react';
import { AttachmentButton } from './AttachmentButton';
import { AttachmentMenu } from './AttachmentMenu';
import { TEXT } from './constants';

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
      {messages.map((message) => (
        <MessageBubble
          key={message.id}
          content={message.content}
          role={message.role}
          isCopied={copiedMessageId === message.id}
          onCopy={() => onCopyMessage(message.id, message.content)}
          avatarSrc="/favicon.webp"
          avatarAlt="CROW"
          assistantLabel={message.role === 'assistant' ? 'CROW' : ''}
        />
      ))}

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
