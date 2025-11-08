import { createContext, useContext, useState, useCallback } from 'react';
import { avatarService } from '../services/avatarService';
import { useAuth } from './AuthContext';

const AvatarContext = createContext();

/**
 * Hook para acessar o contexto de avatares
 * @throws {Error} Se usado fora do AvatarProvider
 */
export const useAvatar = () => {
  const context = useContext(AvatarContext);
  if (!context) {
    throw new Error('useAvatar must be used within an AvatarProvider');
  }
  return context;
};

/**
 * Provider de Avatar Lab
 * Responsabilidades:
 * - Gerenciar avatares do usuário
 * - Gerenciar favoritos
 * - Gerenciar downloads
 */
export const AvatarProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Avatar Lab state
  const [userAvatars, setUserAvatars] = useState([]);
  const [favoriteAvatars, setFavoriteAvatars] = useState([]);
  const [downloadedAssets, setDownloadedAssets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega avatares do usuário
   * @param {string} userId - ID do usuário (opcional, usa user atual se não fornecido)
   */
  const loadUserAvatars = useCallback(async (userId = user?.id) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [avatars, favorites, downloads] = await Promise.all([
        avatarService.getUserAvatars(userId),
        avatarService.getUserFavorites(userId),
        avatarService.getUserDownloads(userId)
      ]);
      
      setUserAvatars(avatars);
      setFavoriteAvatars(favorites);
      setDownloadedAssets(downloads);
    } catch (err) {
      console.error('Failed to load user avatars:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Faz upload de novo avatar
   * @param {Object} avatarData - Dados do avatar
   * @returns {Promise<{success: boolean, avatar?: Object, error?: string}>}
   */
  const uploadAvatar = useCallback(async (avatarData) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newAvatar = await avatarService.uploadAvatar(user.id, avatarData);
      setUserAvatars(prev => [newAvatar, ...prev]);
      
      return { success: true, avatar: newAvatar };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Adiciona ou remove avatar dos favoritos
   * @param {string} avatarId - ID do avatar
   * @returns {Promise<{success: boolean, isFavorite: boolean, error?: string}>}
   */
  const toggleFavoriteAvatar = useCallback(async (avatarId) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const isFavorite = favoriteAvatars.some(fav => fav.id === avatarId);
      
      if (isFavorite) {
        await avatarService.removeFavorite(user.id, avatarId);
        setFavoriteAvatars(prev => prev.filter(fav => fav.id !== avatarId));
      } else {
        const avatar = await avatarService.addFavorite(user.id, avatarId);
        setFavoriteAvatars(prev => [avatar, ...prev]);
      }
      
      return { success: true, isFavorite: !isFavorite };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id, favoriteAvatars]);

  /**
   * Registra download de asset
   * @param {string} assetId - ID do asset
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const recordDownload = useCallback(async (assetId) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const download = await avatarService.recordDownload(user.id, assetId);
      setDownloadedAssets(prev => [download, ...prev]);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  /**
   * Limpa todos os dados de avatares (útil no logout)
   */
  const clearAvatarData = useCallback(() => {
    setUserAvatars([]);
    setFavoriteAvatars([]);
    setDownloadedAssets([]);
    setError(null);
  }, []);

  // Computed stats
  const avatarStats = {
    avatarsCount: userAvatars.length,
    favoritesCount: favoriteAvatars.length,
    downloadsCount: downloadedAssets.length,
  };

  const contextValue = {
    // State
    userAvatars,
    favoriteAvatars,
    downloadedAssets,
    loading,
    error,
    avatarStats,
    
    // Methods
    loadUserAvatars,
    uploadAvatar,
    toggleFavoriteAvatar,
    recordDownload,
    clearAvatarData,
  };

  return (
    <AvatarContext.Provider value={contextValue}>
      {children}
    </AvatarContext.Provider>
  );
};
