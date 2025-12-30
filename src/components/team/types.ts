export type MemberStatus = 'active' | 'invited';

export interface TeamMember {
  id: string;
  name: string;
  initials: string;
  email: string;
  status: MemberStatus;
  lastActive: string | null;
  avatarColor?: string;
}
