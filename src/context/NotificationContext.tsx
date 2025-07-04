
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { requestNotificationPermission, onMessageListener } from "@/config/firebase";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'donation' | 'status_update' | 'expiry_alert';
  read: boolean;
  createdAt: Date;
  donationId?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  registerForNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  unreadCount: 0,
  markAsRead: () => {},
  markAllAsRead: () => {},
  registerForNotifications: async () => {},
});

export const useNotifications = () => useContext(NotificationContext);

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { user, token } = useAuth();
  const { toast } = useToast();

  const fetchNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          data.map((n: any) => ({
            ...n,
            id: n._id || n.id,
            createdAt: new Date(n.createdAt),
          }))
        );
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const registerForNotifications = async () => {
    if (!user || !token) return;
    
    try {
      const fcmToken = await requestNotificationPermission();
      if (fcmToken) {
        await fetch(`${API_BASE}/api/notifications/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ fcmToken }),
        });
        console.log('FCM token registered successfully');
      } else {
        console.log('FCM token not available - notifications will work via polling');
      }
    } catch (error) {
      console.error('Error registering for notifications:', error);
    }
  };

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      registerForNotifications();
      
      // Set up polling for notifications every 30 seconds
      const pollInterval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(pollInterval);
    }
  }, [user, token]);

  // Listen for real-time notifications only if Firebase is properly configured
  useEffect(() => {
    if (user) {
      onMessageListener()
        .then((payload: any) => {
          if (payload && payload.notification) {
            toast({
              title: payload.notification.title || "New Notification",
              description: payload.notification.body || "You have a new notification",
            });
            fetchNotifications();
          }
        })
        .catch((err) => {
          // Silently handle the error since we have polling as fallback
          console.log('Push notifications not available, using polling instead');
        });
    }
  }, [user, toast]);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        registerForNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
