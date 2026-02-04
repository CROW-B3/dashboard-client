import type { User, Session, Preferences, FormData } from './types';

export const mockUser: User = {
  id: '1',
  name: 'Alex Johnson',
  email: 'alex.johnson@b3crow.com',
  role: 'Admin',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
  stats: {
    logins: 24,
    uptime: '99.8%',
  },
};

export const mockSessions: Session[] = [
  {
    id: '1',
    device: 'desktop',
    browser: 'Chrome 120.0',
    os: 'macOS 14.2',
    location: 'San Francisco, CA',
    lastActive: 'Current session',
    isCurrent: true,
  },
  {
    id: '2',
    device: 'laptop',
    browser: 'Safari 17.1',
    os: 'macOS 14.2',
    location: 'San Francisco, CA',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
  {
    id: '3',
    device: 'mobile',
    browser: 'Safari',
    os: 'iOS 17.2',
    location: 'San Francisco, CA',
    lastActive: '1 day ago',
    isCurrent: false,
  },
];

export const mockFormData: FormData = {
  name: 'Alex Johnson',
  email: 'alex.johnson@b3crow.com',
  timezone: 'America/Los_Angeles',
  language: 'English',
};

export const mockPreferences: Preferences = {
  theme: 'dark',
  emailNotifications: true,
  pushNotifications: true,
  weeklyDigest: false,
  aiResponseStyle: 'balanced',
};
