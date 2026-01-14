'use client';

import type { TeamMember } from './types';
import { cn } from '@b3-crow/ui-kit';
import { User } from 'lucide-react';

export interface TeamTableProps {
  members: TeamMember[];
  onRowClick?: (member: TeamMember) => void;
  className?: string;
}

type AvatarColorKey = 'purple' | 'indigo' | 'blue' | 'default';

function getAvatarColorStyle(colorKey: string): { bg: string; text: string } {
  const colorMapping: Record<string, { bg: string; text: string }> = {
    purple: { bg: 'rgba(76, 29, 149, 0.40)', text: '#FFFFFF' },
    indigo: { bg: 'rgba(49, 46, 129, 0.40)', text: '#C7D2FE' },
    blue: { bg: 'rgba(30, 58, 138, 0.40)', text: '#BFDBFE' },
    default: { bg: 'rgba(76, 29, 149, 0.40)', text: '#FFFFFF' },
  };
  return colorMapping[colorKey] || colorMapping.default;
}

function renderInvitedMemberAvatar(): JSX.Element {
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{ outline: '1px #4B5563 solid', outlineOffset: '-1px' }}
    >
      <User size={16} color="#6B7280" />
    </div>
  );
}

function renderActiveMemberAvatar(colorKey: string, initials: string): JSX.Element {
  const avatarStyle = getAvatarColorStyle(colorKey);
  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
      style={{
        background: avatarStyle.bg,
        boxShadow: '0px 0px 0px 1px rgba(255, 255, 255, 0.10)',
      }}
    >
      <span className="text-xs font-semibold" style={{ color: avatarStyle.text }}>
        {initials}
      </span>
    </div>
  );
}

export function TeamTable({
  members,
  onRowClick,
  className,
}: TeamTableProps) {
  return (
    <>
      <div
        className={cn('hidden md:block relative z-10 w-full rounded-xl overflow-hidden', className)}
        style={{
          background: 'rgba(10, 5, 20, 0.60)',
          boxShadow: '0px 4px 6px -4px rgba(0, 0, 0, 0.10)',
          outline: '1px rgba(255, 255, 255, 0.08) solid',
          outlineOffset: '-1px',
          backdropFilter: 'blur(8px)',
        }}
      >
        <TableHeader />
        <div>
          {members.map((member, index) => (
            <MemberRow
              key={member.id}
              member={member}
              onClick={() => onRowClick?.(member)}
              showBorder={index > 0}
            />
          ))}
        </div>
      </div>

      <div className="md:hidden space-y-3">
        {members.map((member) => (
          <button
            key={member.id}
            type="button"
            onClick={() => onRowClick?.(member)}
            className="w-full p-4 rounded-lg text-left transition-colors hover:bg-white/[0.05]"
            style={{
              background: 'rgba(10, 5, 20, 0.60)',
              outline: '1px rgba(255, 255, 255, 0.08) solid',
              outlineOffset: '-1px',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <TeamMemberAvatar member={member} />
                <div className="min-w-0 flex-1">
                  <p
                    className="text-sm font-medium break-words"
                    style={{ color: member.status === 'invited' ? '#9CA3AF' : '#FFFFFF' }}
                  >
                    {member.name}
                  </p>
                  <p
                    className="text-xs break-words"
                    style={{ color: member.status === 'invited' ? '#6B7280' : '#9CA3AF' }}
                  >
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <StatusBadge status={member.status} />
              </div>
            </div>

            {member.lastActive && (
              <div className="text-xs" style={{ color: '#6B7280' }}>
                <span className="text-gray-500">Last active: </span>
                {member.lastActive}
              </div>
            )}
          </button>
        ))}
      </div>
    </>
  );
}

function TeamMemberAvatar({ member }: { member: TeamMember }) {
  if (member.status === 'invited') {
    return renderInvitedMemberAvatar();
  }
  const colorKey = member.avatarColor || 'default';
  return renderActiveMemberAvatar(colorKey, member.initials);
}

function TableHeader() {
  return (
    <div
      className="h-[40px] flex items-center px-6 border-b"
      style={{
        background: 'rgba(255, 255, 255, 0.02)',
        borderColor: 'rgba(255, 255, 255, 0.05)',
      }}
    >
      <div className="flex-1 min-w-0 text-xs font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
        Member
      </div>
      <div className="flex-1 min-w-0 text-xs font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
        Email
      </div>
      <div className="flex-1 min-w-0 text-xs font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
        Status
      </div>
      <div className="flex-1 min-w-0 text-xs font-semibold uppercase tracking-[0.6px]" style={{ color: '#9CA3AF' }}>
        Last Active
      </div>
    </div>
  );
}

interface MemberRowProps {
  member: TeamMember;
  onClick: () => void;
  showBorder: boolean;
}

function MemberRow({ member, onClick, showBorder }: MemberRowProps) {
  const isInvited = member.status === 'invited';
  const colorKey = member.avatarColor || 'default';
  const memberAvatarElement = isInvited
    ? renderInvitedMemberAvatar()
    : renderActiveMemberAvatar(colorKey, member.initials);

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full h-[57px] flex items-center px-6 text-left transition-colors hover:bg-white/[0.02]',
        showBorder && 'border-t',
      )}
      style={{
        borderColor: showBorder ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0 flex items-center gap-3">
        {memberAvatarElement}
        <span
          className={cn('text-sm font-medium truncate', isInvited && 'italic')}
          style={{ color: isInvited ? '#9CA3AF' : '#FFFFFF' }}
        >
          {member.name}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <span
          className={cn('text-sm truncate', isInvited && 'italic')}
          style={{ color: isInvited ? '#6B7280' : '#9CA3AF' }}
        >
          {member.email}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <StatusBadge status={member.status} />
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm" style={{ color: member.lastActive ? '#9CA3AF' : '#4B5563' }}>
          {member.lastActive || '—'}
        </span>
      </div>
    </button>
  );
}

function StatusBadge({ status }: { status: 'active' | 'invited' }) {
  const isActive = status === 'active';

  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
      style={{
        background: isActive ? 'rgba(16, 185, 129, 0.10)' : 'rgba(107, 114, 128, 0.10)',
        outline: isActive ? '1px rgba(16, 185, 129, 0.20) solid' : '1px rgba(107, 114, 128, 0.20) solid',
        outlineOffset: '-1px',
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: isActive ? '#34D399' : '#6B7280' }}
      />
      <span style={{ color: isActive ? '#34D399' : '#9CA3AF' }}>
        {isActive ? 'Active' : 'Invited'}
      </span>
    </span>
  );
}
