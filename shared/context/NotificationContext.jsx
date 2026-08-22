/**
 * NotificationContext.jsx — Real API-backed notification context.
 *
 * Replaces the localStorage/mockNotifications implementation.
 * All data comes from /api/notifications endpoints.
 *
 * Polling: fetches every 30 seconds while the user is logged in.
 * markAsRead / markAllAsRead / deleteNotification all call the real API
 * and update local state immediately (optimistic update) for responsiveness.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { AuthContext } from "./AuthContext";
import {
  apiListNotifications,
  apiMarkNotificationRead,
  apiMarkAllNotificationsRead,
  apiDeleteNotification,
} from "../services/api";

export const NotificationContext = createContext();

const POLL_INTERVAL_MS = 30_000; // 30 seconds

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  // ── Fetch from API ───────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const data = await apiListNotifications({ limit: 50 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount     || 0);
    } catch {
      // Non-fatal — keep existing state on error
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  // Fetch on login and then poll
  useEffect(() => {
    if (!currentUser) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }
    fetchNotifications();
    const interval = setInterval(fetchNotifications, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [currentUser, fetchNotifications]);

  // ── Mark one as read ─────────────────────────────────────────────────────
  const markAsRead = useCallback(async (notifId) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, is_read: 1 } : n))
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiMarkNotificationRead(notifId);
    } catch {
      // Revert on failure
      setNotifications(prev =>
        prev.map(n => (n.id === notifId ? { ...n, is_read: 0 } : n))
      );
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // ── Mark all as read ─────────────────────────────────────────────────────
  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
    setUnreadCount(0);
    try {
      await apiMarkAllNotificationsRead();
    } catch {
      fetchNotifications(); // Revert by re-fetching
    }
  }, [fetchNotifications]);

  // ── Delete one ───────────────────────────────────────────────────────────
  const deleteNotification = useCallback(async (notifId) => {
    const removed = notifications.find(n => n.id === notifId);
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    if (removed && !removed.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await apiDeleteNotification(notifId);
    } catch {
      if (removed) setNotifications(prev => [removed, ...prev]);
    }
  }, [notifications]);

  // ── userNotifications — all notifications for the current user ───────────
  // (server already filters by user; expose as-is)
  const userNotifications = notifications;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        userNotifications,
        unreadCount,
        loading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        // Expose reload so pages can trigger a manual refresh
        reload: fetchNotifications,
        // addNotification is no longer used locally (server creates them);
        // keep a no-op shim so any remaining call-sites don't crash
        addNotification: () => {},
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
