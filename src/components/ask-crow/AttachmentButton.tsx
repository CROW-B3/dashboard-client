'use client';

import { Plus } from 'lucide-react';

interface AttachmentButtonProps {
  onClick: () => void;
}

export function AttachmentButton({ onClick }: AttachmentButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      aria-label="Attach file or link"
    >
      <Plus size={24} className="text-gray-500 hover:text-gray-300 transition-colors" strokeWidth={2} />
    </button>
  );
}
