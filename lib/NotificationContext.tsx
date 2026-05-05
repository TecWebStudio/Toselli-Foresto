'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { getNotifications, markNotificationsRead } from './api';
import type { Notification } from './types';

interface NotificationContextType {
  unreadCount: number;
  notifications: Notification[];
  loading: boolean;
  isSheetOpen: boolean;
  openSheet: () => void;
  closeSheet: () => void;
  markAllRead: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id ?? 1;
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Poll unread count every 30s
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const data = await getNotifications(userId);
        setUnreadCount(data.unread_count);
      } catch {}
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getNotifications(userId);
      setNotifications(data.notifications);
      setUnreadCount(data.unread_count);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const openSheet = useCallback(async () => {
    setIsSheetOpen(true);
    await fetchNotifications();
  }, [fetchNotifications]);

  const closeSheet = useCallback(() => setIsSheetOpen(false), []);

  const markAllRead = useCallback(async () => {
    try {
      await markNotificationsRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
      setUnreadCount(0);
    } catch {}
  }, [userId]);

  const markRead = useCallback(async (id: number) => {
    try {
      await markNotificationsRead(userId, id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, [userId]);

  return (
    <NotificationContext.Provider value={{
      unreadCount, notifications, loading, isSheetOpen,
      openSheet, closeSheet, markAllRead, markRead, fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
