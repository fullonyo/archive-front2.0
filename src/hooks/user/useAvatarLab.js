import { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';

export const useAvatarLab = () => {
  const { 
    userAvatars,
    favoriteAvatars,
    downloadedAssets,
    uploadAvatar: contextUploadAvatar,
    toggleFavoriteAvatar: contextToggleFavorite,
    loadUserAvatars: contextLoadAvatars
  } = useUser();
  
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadAvatar = useCallback(async (avatarData) => {
    setAvatarLoading(true);
    setAvatarError(null);
    setUploadProgress(0);
    
    try {
      const avatarWithProgress = {
        ...avatarData,
        onProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        }
      };
      
      const result = await contextUploadAvatar(avatarWithProgress);
      
      if (result.success) {
        setUploadProgress(100);
        return { success: true, avatar: result.avatar };
      } else {
        setAvatarError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to upload avatar';
      setAvatarError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAvatarLoading(false);
      setTimeout(() => setUploadProgress(0), 2000); // Reset progress after delay
    }
  }, [contextUploadAvatar]);

  const toggleFavorite = useCallback(async (avatarId) => {
    setAvatarError(null);
    
    try {
      const result = await contextToggleFavorite(avatarId);
      
      if (result.success) {
        return { 
          success: true, 
          isFavorite: result.isFavorite,
          message: result.isFavorite ? 'Added to favorites' : 'Removed from favorites'
        };
      } else {
        setAvatarError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to update favorite';
      setAvatarError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, [contextToggleFavorite]);

  const refreshAvatars = useCallback(async () => {
    setAvatarLoading(true);
    setAvatarError(null);
    
    try {
      await contextLoadAvatars();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh avatars';
      setAvatarError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setAvatarLoading(false);
    }
  }, [contextLoadAvatars]);

  const getAvatarsByCategory = useCallback((category) => {
    return userAvatars.filter(avatar => 
      avatar.category.toLowerCase() === category.toLowerCase()
    );
  }, [userAvatars]);

  const getAvatarsByTag = useCallback((tag) => {
    return userAvatars.filter(avatar => 
      avatar.tags && avatar.tags.some(t => 
        t.toLowerCase().includes(tag.toLowerCase())
      )
    );
  }, [userAvatars]);

  const getRecentAvatars = useCallback((days = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return userAvatars.filter(avatar => 
      new Date(avatar.createdAt) > cutoff
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [userAvatars]);

  const getPopularAvatars = useCallback(() => {
    return [...userAvatars].sort((a, b) => {
      const aScore = (a.likes || 0) + (a.downloads || 0);
      const bScore = (b.likes || 0) + (b.downloads || 0);
      return bScore - aScore;
    });
  }, [userAvatars]);

  const isFavorite = useCallback((avatarId) => {
    return favoriteAvatars.some(fav => fav.id === avatarId);
  }, [favoriteAvatars]);

  const isDownloaded = useCallback((avatarId) => {
    return downloadedAssets.some(asset => asset.id === avatarId);
  }, [downloadedAssets]);

  const getAvatarStats = useCallback(() => {
    const totalLikes = userAvatars.reduce((sum, avatar) => sum + (avatar.likes || 0), 0);
    const totalDownloads = userAvatars.reduce((sum, avatar) => sum + (avatar.downloads || 0), 0);
    const totalViews = userAvatars.reduce((sum, avatar) => sum + (avatar.views || 0), 0);
    
    const categories = {};
    userAvatars.forEach(avatar => {
      categories[avatar.category] = (categories[avatar.category] || 0) + 1;
    });
    
    return {
      totalAvatars: userAvatars.length,
      totalLikes,
      totalDownloads,
      totalViews,
      favoriteCount: favoriteAvatars.length,
      downloadedCount: downloadedAssets.length,
      categoriesDistribution: categories,
      averageLikes: userAvatars.length > 0 ? (totalLikes / userAvatars.length).toFixed(1) : 0,
      averageDownloads: userAvatars.length > 0 ? (totalDownloads / userAvatars.length).toFixed(1) : 0
    };
  }, [userAvatars, favoriteAvatars, downloadedAssets]);

  const searchAvatars = useCallback((query) => {
    const searchTerm = query.toLowerCase();
    
    return userAvatars.filter(avatar => 
      avatar.name.toLowerCase().includes(searchTerm) ||
      avatar.description.toLowerCase().includes(searchTerm) ||
      avatar.category.toLowerCase().includes(searchTerm) ||
      (avatar.tags && avatar.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      ))
    );
  }, [userAvatars]);

  const clearError = useCallback(() => {
    setAvatarError(null);
  }, []);

  return {
    // State
    userAvatars,
    favoriteAvatars,
    downloadedAssets,
    loading: avatarLoading,
    error: avatarError,
    uploadProgress,
    
    // Actions
    uploadAvatar,
    toggleFavorite,
    refreshAvatars,
    
    // Filtering and search
    getAvatarsByCategory,
    getAvatarsByTag,
    getRecentAvatars,
    getPopularAvatars,
    searchAvatars,
    
    // Utils
    isFavorite,
    isDownloaded,
    getAvatarStats,
    
    // Error handling
    clearError
  };
};