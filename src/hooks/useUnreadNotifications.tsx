import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { useNotificationsQuery } from './useDmrcQueries';

// Setup notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const NOTIFIED_IDS_KEY = '@dmrc_notified_ids';
const UNREAD_IDS_KEY = '@dmrc_unread_ids';

interface UnreadNotificationsContextType {
  unreadIds: number[];
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}

const UnreadNotificationsContext = createContext<UnreadNotificationsContextType | null>(null);

export function UnreadNotificationsProvider({ children }: { children: ReactNode }) {
  const [notifiedIds, setNotifiedIds] = useState<number[]>([]);
  const [unreadIds, setUnreadIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const { data: notificationsData } = useNotificationsQuery();

  // Load persisted state
  useEffect(() => {
    const loadState = async () => {
      try {
        const storedNotified = await AsyncStorage.getItem(NOTIFIED_IDS_KEY);
        const storedUnread = await AsyncStorage.getItem(UNREAD_IDS_KEY);
        
        if (storedNotified) setNotifiedIds(JSON.parse(storedNotified));
        if (storedUnread) setUnreadIds(JSON.parse(storedUnread));
      } catch (e) {
        console.error('Failed to load notification state', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadState();
    
    // Request permissions
    Notifications.requestPermissionsAsync();
  }, []);

  // Process new notifications
  useEffect(() => {
    if (!isLoaded || !notificationsData) return;

    const newNotifications = notificationsData.filter(n => !notifiedIds.includes(n.id));
    
    if (newNotifications.length > 0) {
      const newIds = newNotifications.map(n => n.id);
      
      const updateState = async () => {
        const updatedNotified = [...notifiedIds, ...newIds];
        const updatedUnread = [...unreadIds, ...newIds];
        
        setNotifiedIds(updatedNotified);
        setUnreadIds(updatedUnread);
        
        await AsyncStorage.setItem(NOTIFIED_IDS_KEY, JSON.stringify(updatedNotified));
        await AsyncStorage.setItem(UNREAD_IDS_KEY, JSON.stringify(updatedUnread));

        // Trigger local notifications
        newNotifications.forEach(n => {
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'New Metro Notice',
              body: n.title,
            },
            trigger: null, // trigger immediately
          });
        });
      };

      updateState();
    }
  }, [notificationsData, isLoaded, notifiedIds, unreadIds]);

  const markAsRead = async (id: number) => {
    if (!unreadIds.includes(id)) return;
    
    const updatedUnread = unreadIds.filter(unreadId => unreadId !== id);
    setUnreadIds(updatedUnread);
    await AsyncStorage.setItem(UNREAD_IDS_KEY, JSON.stringify(updatedUnread));
  };

  const markAllAsRead = async () => {
    setUnreadIds([]);
    await AsyncStorage.setItem(UNREAD_IDS_KEY, JSON.stringify([]));
  };

  return (
    <UnreadNotificationsContext.Provider value={{ unreadIds, markAsRead, markAllAsRead }}>
      {children}
    </UnreadNotificationsContext.Provider>
  );
}

export function useUnreadNotifications() {
  const context = useContext(UnreadNotificationsContext);
  if (!context) {
    throw new Error('useUnreadNotifications must be used within an UnreadNotificationsProvider');
  }
  return context;
}
