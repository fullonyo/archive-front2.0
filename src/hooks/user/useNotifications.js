import { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';

export const useNotifications = () => {
  const { 
    notifications, 
    unreadNotificationsCount,
    markNotificationAsRead: contextMarkAsRead,
    clearAllNotifications: contextClearAll,
    loadNotifications: contextLoadNotifications
  } = useUser();
  
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [notificationError, setNotificationError] = useState(null);

  const markAsRead = useCallback(async (notificationId) => {
    setNotificationError(null);
    
    try {
      await contextMarkAsRead(notificationId);
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark notification as read';
      setNotificationError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [contextMarkAsRead]);

  const markAllAsRead = useCallback(async () => {
    setNotificationLoading(true);
    setNotificationError(null);
    
    try {
      // Mark all unread notifications as read
      const unreadNotifications = notifications.filter(n => !n.read);
      await Promise.all(
        unreadNotifications.map(notification => 
          contextMarkAsRead(notification.id)
        )
      );
      
      return { success: true, message: `Marked ${unreadNotifications.length} notifications as read` };
    } catch (err) {
      const errorMessage = err.message || 'Failed to mark all notifications as read';
      setNotificationError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setNotificationLoading(false);
    }
  }, [notifications, contextMarkAsRead]);

  const clearAll = useCallback(async () => {
    setNotificationLoading(true);
    setNotificationError(null);
    
    try {
      await contextClearAll();
      return { success: true, message: 'All notifications cleared' };
    } catch (err) {
      const errorMessage = err.message || 'Failed to clear notifications';
      setNotificationError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setNotificationLoading(false);
    }
  }, [contextClearAll]);

  const refresh = useCallback(async () => {
    setNotificationLoading(true);
    setNotificationError(null);
    
    try {
      await contextLoadNotifications();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh notifications';
      setNotificationError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setNotificationLoading(false);
    }
  }, [contextLoadNotifications]);

  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(notification => notification.type === type);
  }, [notifications]);

  const getUnreadNotifications = useCallback(() => {
    return notifications.filter(notification => !notification.read);
  }, [notifications]);

  const getRecentNotifications = useCallback((hours = 24) => {
    const cutoff = new Date();
    cutoff.setHours(cutoff.getHours() - hours);
    
    return notifications.filter(notification => 
      new Date(notification.createdAt) > cutoff
    );
  }, [notifications]);

  const groupNotificationsByDate = useCallback(() => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    notifications.forEach(notification => {
      const date = new Date(notification.createdAt);
      let groupKey;
      
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Today';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Yesterday';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });
    
    return groups;
  }, [notifications]);

  const clearError = useCallback(() => {
    setNotificationError(null);
  }, []);

  return {
    // State
    notifications,
    unreadNotificationsCount,
    loading: notificationLoading,
    error: notificationError,
    
    // Actions
    markAsRead,
    markAllAsRead,
    clearAll,
    refresh,
    
    // Filtering and grouping
    getNotificationsByType,
    getUnreadNotifications,
    getRecentNotifications,
    groupNotificationsByDate,
    
    // Utils
    clearError
  };
};