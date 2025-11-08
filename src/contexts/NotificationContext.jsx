import { createContext, useContext, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

/**
 * Hook para acessar o contexto de notificações
 * @throws {Error} Se usado fora do NotificationProvider
 */
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

/**
 * Provider de Notificações
 * Responsabilidades:
 * - Gerenciar notificações do usuário
 * - Marcar como lidas
 * - Limpar notificações
 */
export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Notification state
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega notificações do usuário
   * @param {string} userId - ID do usuário (opcional, usa user atual se não fornecido)
   */
  const loadNotifications = useCallback(async (userId = user?.id) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const notifications = await userService.getNotifications(userId);
      setNotifications(notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Marca notificação como lida
   * @param {string} notificationId - ID da notificação
   */
  const markNotificationAsRead = useCallback(async (notificationId) => {
    try {
      await userService.markNotificationAsRead(notificationId);
      
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, read: true }
            : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Marca todas notificações como lidas
   */
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await userService.markAllNotificationsAsRead(user.id);
      
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
      setError(err.message);
    }
  }, [user?.id]);

  /**
   * Limpa todas notificações
   */
  const clearAllNotifications = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      await userService.clearAllNotifications(user.id);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
      setError(err.message);
    }
  }, [user?.id]);

  /**
   * Adiciona nova notificação (para uso em tempo real)
   * @param {Object} notification - Dados da notificação
   */
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev]);
  }, []);

  /**
   * Remove notificação específica
   * @param {string} notificationId - ID da notificação
   */
  const removeNotification = useCallback(async (notificationId) => {
    try {
      await userService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to remove notification:', err);
      setError(err.message);
    }
  }, []);

  /**
   * Limpa todos os dados de notificações (útil no logout)
   */
  const clearNotificationData = useCallback(() => {
    setNotifications([]);
    setError(null);
  }, []);

  // Computed values
  const unreadCount = notifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  const contextValue = {
    // State
    notifications,
    loading,
    error,
    unreadCount,
    hasUnread,
    
    // Methods
    loadNotifications,
    markNotificationAsRead,
    markAllAsRead,
    clearAllNotifications,
    addNotification,
    removeNotification,
    clearNotificationData,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};
