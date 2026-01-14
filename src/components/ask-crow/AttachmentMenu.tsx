'use client';

import { FileText, ImageIcon, Link2 } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ATTACH_MENU_OPTIONS, COLORS } from './constants';
import type { AttachmentMenuProps } from './types';

const ICON_COMPONENTS = {
  FileText,
  ImageIcon,
  Link2,
} as const;

function AttachmentOption({
  type,
  label,
  color,
  iconName,
  onSelect,
}: {
  type: string;
  label: string;
  color: string;
  iconName: keyof typeof ICON_COMPONENTS;
  onSelect: (type: string) => void;
}) {
  const IconComponent = ICON_COMPONENTS[iconName];

  return (
    <button
      type="button"
      onClick={() => onSelect(type)}
      className="flex items-center gap-3 w-full px-4 py-3 text-left hover:bg-white/10 transition-colors"
    >
      <IconComponent size={16} className={color} />
      <span className="text-[13px] text-gray-200">{label}</span>
    </button>
  );
}

export function AttachmentMenu({ isOpen, onOptionSelect, onClose }: AttachmentMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute left-0 top-full mt-2 min-w-[180px] rounded-xl overflow-hidden"
      style={{
        background: COLORS.BLACK_95,
        border: `1px solid ${COLORS.WHITE_10}`,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(12px)',
      }}
    >
      {ATTACH_MENU_OPTIONS.map((option) => (
        <AttachmentOption
          key={option.type}
          type={option.type}
          label={option.label}
          color={option.color}
          iconName={option.icon as keyof typeof ICON_COMPONENTS}
          onSelect={onOptionSelect}
        />
      ))}
    </div>
  );
}
