export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  stats: {
    logins: number;
    uptime: string;
  };
}

export interface Session {
  id: string;
  device: 'desktop' | 'laptop' | 'mobile';
  browser: string;
  os: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export type TabType = 'account' | 'security' | 'preferences';
export type ThemeOption = 'system' | 'dark' | 'light';
export type AIStyleOption = 'concise' | 'balanced' | 'detailed';

export interface Preferences {
  theme: ThemeOption;
  emailNotifications: boolean;
  pushNotifications: boolean;
  weeklyDigest: boolean;
  aiResponseStyle: AIStyleOption;
}

export interface FormData {
  name: string;
  email: string;
  timezone: string;
  language: string;
}

export interface ModalState {
  editProfile: boolean;
  enable2FA: boolean;
  signOutAll: boolean;
}
