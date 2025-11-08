import { useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAvatar } from '../contexts/AvatarContext';
import { useForum } from '../contexts/ForumContext';
import { useNotification } from '../contexts/NotificationContext';
import { useVRChat } from '../contexts/VRChatContext';

/**
 * Hook composto que combina dados de múltiplos contextos
 * 
 * Retorna um objeto com:
 * - user: Dados do usuário autenticado
 * - stats: Estatísticas agregadas de todos os contextos
 * - isAuthenticated: Status de autenticação
 * - loading: Loading de qualquer contexto
 * 
 * Performance:
 * - useMemo para evitar recalcular stats desnecessariamente
 * - Apenas re-renderiza quando os contextos usados mudam
 * 
 * Uso:
 * ```jsx
 * const { user, stats, isAuthenticated } = useCurrentUser();
 * ```
 * 
 * Migração do UserContext antigo:
 * - Antes: const { user, userStats } = useUser();
 * - Agora: const { user, stats } = useCurrentUser();
 * 
 * Quando NÃO usar:
 * - Se você só precisa de auth: use useAuth()
 * - Se você só precisa de notificações: use useNotification()
 * - Este hook causa re-render quando QUALQUER contexto muda
 */
export const useCurrentUser = () => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const { avatarStats, loading: avatarLoading } = useAvatar();
  const { forumStats, loading: forumLoading } = useForum();
  const { unreadCount, loading: notificationLoading } = useNotification();
  const { isVRChatConnected, friendsCount, loading: vrchatLoading } = useVRChat();

  // Agregar loading de todos os contextos
  const loading = authLoading || avatarLoading || forumLoading || notificationLoading || vrchatLoading;

  // Combinar stats de todos os contextos
  const stats = useMemo(() => ({
    // Avatar stats
    avatarsCount: user?.stats?.totalUploads || avatarStats.avatarsCount,
    favoritesCount: user?.stats?.totalFavorites || avatarStats.favoritesCount,
    downloadsCount: user?.stats?.totalDownloads || avatarStats.downloadsCount,
    
    // Forum stats
    postsCount: user?.stats?.postsCount || forumStats.postsCount,
    repliesCount: user?.stats?.repliesCount || forumStats.repliesCount,
    reputation: user?.stats?.reputation || forumStats.reputation,
    level: forumStats.level,
    badges: user?.stats?.badges || forumStats.badges,
    
    // Notification stats
    unreadNotificationsCount: unreadCount,
    
    // VRChat stats
    isVRChatConnected,
    vrchatFriendsCount: friendsCount,
    
    // User flags
    isVerified: user?.isVerified || false,
    isModerator: user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.role === 'SISTEMA',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SISTEMA',
    
    // Dates
    joinedDate: user?.createdAt,
  }), [
    user,
    avatarStats,
    forumStats,
    unreadCount,
    isVRChatConnected,
    friendsCount
  ]);

  return {
    user,
    stats,
    isAuthenticated,
    loading,
  };
};
