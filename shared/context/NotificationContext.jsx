import React, { createContext, useState, useEffect, useContext } from "react";
import { mockNotifications } from "../data/mockNotifications";
import { AuthContext } from "./AuthContext";

export const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const { currentUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("roomiematch_notifications");
    return saved ? JSON.parse(saved) : mockNotifications;
  });

  useEffect(() => {
    localStorage.setItem("roomiematch_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const userNotifications = currentUser
    ? notifications.filter(n => n.userId === currentUser.id)
    : [];

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const addNotification = (userId, title, message, type = "general", referenceId = null) => {
    const newNotif = {
      id: "n_" + Date.now(),
      userId,
      title,
      message,
      type,
      referenceId,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markAsRead = (notifId) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.userId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (notifId) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        userNotifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
