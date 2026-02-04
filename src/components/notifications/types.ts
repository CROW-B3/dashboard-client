export interface Notification {
  id: string;
  title: string;
  description: string;
  timestamp: string;
  source: 'web' | 'cctv' | 'social';
  icon: 'info' | 'warning' | 'error';
  read: boolean;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

export interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}
