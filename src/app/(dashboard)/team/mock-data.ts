import type { TeamMember } from '@/components/team';

export const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'S. Jay',
    initials: 'SJ',
    email: 'sj@company.com',
    status: 'active',
    lastActive: '3m ago',
    avatarColor: 'purple',
  },
  {
    id: '2',
    name: 'R. Vance',
    initials: 'RV',
    email: 'rv@company.com',
    status: 'active',
    lastActive: '1h ago',
    avatarColor: 'indigo',
  },
  {
    id: '3',
    name: 'N. Perera',
    initials: 'NP',
    email: 'np@company.com',
    status: 'active',
    lastActive: 'Yesterday',
    avatarColor: 'blue',
  },
  {
    id: '4',
    name: 'Invited User',
    initials: '',
    email: 'invited@company.com',
    status: 'invited',
    lastActive: null,
  },
];
