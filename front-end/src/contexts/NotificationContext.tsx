import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import { useAuth } from './AuthContext';
import axiosInstance from '../utils/axiosInstances';

export interface NotificationItem {
    id: string;
    message: string;
    relatedUrl: string;
    isRead: boolean;
    createdAt: string;
}

interface NotificationContextType {
    unreadCount: number;
    notifications: NotificationItem[];
    markAsRead: (notificationId: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const { user } = useAuth();

    const fetchNotifications = async () => {
    try {
        const response = await axiosInstance.get('/api/v1/notifications/unread');
        setNotifications(response.data);
        setUnreadCount(response.data.length);
    } catch (error) {
        console.error("알림 목록 불러오기 실패:", error);
    }
    };

    useEffect(() => {
    const token = localStorage.getItem('accessToken');
    
    console.log("알림 디버깅 -> User:", user, "accessToken:", token);

    if (!user || !token) {
        setUnreadCount(0);
        setNotifications([]);
        return;
    }

    fetchNotifications();

    const controller = new AbortController();

    const connectSSE = async () => {
        const baseURL = axiosInstance.defaults.baseURL || '';

        await fetchEventSource(`${baseURL}/api/v1/notifications/subscribe`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'text/event-stream',
            },
            signal: controller.signal,
            onmessage(event) {
                if (event.event === 'connect') return;
                if (event.event === 'CHAT_REQUEST' || event.event === 'CONTRACT_STATUS') {
                    const data = JSON.parse(event.data);
                    alert(`[알림] ${data.message}`);
                    fetchNotifications();
                }
            },
            onerror(err) {
                console.error("SSE 통신 끊김, 재연결을 시도합니다:", err);
                return 3000;
            }
        });
    };

    connectSSE();

    return () => {
        controller.abort();
    };
    }, [user]);

    const markAsRead = async (notificationId: string) => {
    try {
      await axiosInstance.patch(`/api/v1/notifications/${notificationId}/read`);
      setNotifications((prev) => prev.filter((noti) => noti.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("알림 읽음 처리 실패:", error);
    }
  };

    return (
    <NotificationContext.Provider value={{ unreadCount, notifications, markAsRead }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};