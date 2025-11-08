import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';
import { avatarService } from '../services/avatarService';
import { forumService } from '../services/forumService';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  // User State
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Avatar Lab specific state
  const [userAvatars, setUserAvatars] = useState([]);
  const [favoriteAvatars, setFavoriteAvatars] = useState([]);
  const [downloadedAssets, setDownloadedAssets] = useState([]);

  // Forum specific state  
  const [forumProfile, setForumProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // VRChat Integration
  const [vrchatProfile, setVrchatProfile] = useState(null);
  const [vrchatFriends, setVrchatFriends] = useState([]);

  // Initialize user session
  useEffect(() => {
    const initializeUser = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Verify token and load user data
          const userData = await userService.getCurrentProfile();
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            
            // Load related data in parallel
            await Promise.allSettled([
              loadUserAvatars(userData.id),
              loadNotifications(userData.id)
            ]);
          } else {
            // Token inválido, remover
            localStorage.removeItem('auth_token');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize user:', err);
        setError(err.message);
        // Clear invalid token
        localStorage.removeItem('auth_token');
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  // Load user's avatars and assets
  const loadUserAvatars = useCallback(async (userId) => {
    try {
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
    }
  }, []);

  // Load forum profile and activity
  const loadForumProfile = useCallback(async (userId) => {
    try {
      const [profile, posts, replies] = await Promise.all([
        forumService.getUserProfile(userId),
        forumService.getUserPosts(userId),
        forumService.getUserReplies(userId)
      ]);
      
      setForumProfile(profile);
      setUserPosts(posts);
      setUserReplies(replies);
    } catch (err) {
      console.error('Failed to load forum profile:', err);
    }
  }, []);

  // Load VRChat integration data
  const loadVRChatProfile = useCallback(async (vrchatId) => {
    if (!vrchatId) return;
    
    try {
      const [profile, friends] = await Promise.all([
        userService.getVRChatProfile(vrchatId),
        userService.getVRChatFriends(vrchatId)
      ]);
      
      setVrchatProfile(profile);
      setVrchatFriends(friends);
    } catch (err) {
      console.error('Failed to load VRChat profile:', err);
    }
  }, []);

  // Load user notifications
  const loadNotifications = useCallback(async (userId) => {
    try {
      const notifications = await userService.getNotifications(userId);
      setNotifications(notifications);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  }, []);

  // Authentication methods
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.login({ username, password });
      
      // Backend retorna: { success: true, data: { user, token, tokens: { accessToken, refreshToken } } }
      const { data } = response;
      
      if (data && data.token) {
        // Salvar access token (retrocompatibilidade)
        localStorage.setItem('auth_token', data.token);
        
        // Salvar refresh token se disponível
        if (data.tokens?.refreshToken) {
          localStorage.setItem('refresh_token', data.tokens.refreshToken);
        }
        
        setUser(data.user);
        setIsAuthenticated(true);
        
        // Load user data after login
        await Promise.allSettled([
          loadUserAvatars(data.user.id),
          loadNotifications(data.user.id)
        ]);
        
        setLoading(false);
        return { success: true };
      }
      
      throw new Error('Login failed - no token received');
    } catch (err) {
      console.error('Login error in UserContext:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  }, [loadUserAvatars, loadNotifications]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setUserAvatars([]);
    setFavoriteAvatars([]);
    setDownloadedAssets([]);
    setForumProfile(null);
    setUserPosts([]);
    setUserReplies([]);
    setVrchatProfile(null);
    setVrchatFriends([]);
    setNotifications([]);
    setError(null);
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: newUser, token } = await userService.register(userData);
      
      localStorage.setItem('auth_token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Profile update methods
  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await userService.updateProfile(user.id, profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  // Avatar Lab methods
  const uploadAvatar = useCallback(async (avatarData) => {
    try {
      const newAvatar = await avatarService.uploadAvatar(user.id, avatarData);
      setUserAvatars(prev => [newAvatar, ...prev]);
      return { success: true, avatar: newAvatar };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  const toggleFavoriteAvatar = useCallback(async (avatarId) => {
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

  // Forum methods
  const createForumPost = useCallback(async (postData) => {
    try {
      const newPost = await forumService.createPost(user.id, postData);
      setUserPosts(prev => [newPost, ...prev]);
      
      // Update forum profile stats
      if (forumProfile) {
        setForumProfile(prev => ({
          ...prev,
          postsCount: prev.postsCount + 1,
          reputation: prev.reputation + 5 // Base points for new post
        }));
      }
      
      return { success: true, post: newPost };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id, forumProfile]);

  // Notification methods
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
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    try {
      await userService.clearAllNotifications(user.id);
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, [user?.id]);

  // Computed values
  const userStats = {
    avatarsCount: user?.stats?.totalUploads || userAvatars.length,
    favoritesCount: user?.stats?.totalFavorites || favoriteAvatars.length,
    downloadsCount: user?.stats?.totalDownloads || downloadedAssets.length,
    postsCount: user?.stats?.postsCount || userPosts.length,
    repliesCount: userReplies.length,
    reputation: user?.stats?.reputation || forumProfile?.reputation || 0,
    joinedDate: user?.createdAt,
    level: forumProfile?.level || 1,
    badges: user?.stats?.badges || forumProfile?.badges || [],
    isVerified: user?.isVerified || false,
    isModerator: user?.role === 'MODERATOR' || user?.role === 'ADMIN' || user?.role === 'SISTEMA',
    isAdmin: user?.role === 'ADMIN' || user?.role === 'SISTEMA',
    unreadNotificationsCount: notifications.filter(n => !n.read).length
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  const contextValue = {
    // User state
    user,
    isAuthenticated,
    loading,
    error,
    userStats,
    
    // Avatar Lab state
    userAvatars,
    favoriteAvatars,
    downloadedAssets,
    
    // Forum state
    forumProfile,
    userPosts,
    userReplies,
    
    // VRChat state
    vrchatProfile,
    vrchatFriends,
    
    // Notifications
    notifications,
    unreadNotificationsCount,
    
    // Auth methods
    login,
    logout,
    register,
    updateProfile,
    
    // Avatar Lab methods
    uploadAvatar,
    toggleFavoriteAvatar,
    loadUserAvatars,
    
    // Forum methods
    createForumPost,
    loadForumProfile,
    
    // Notification methods
    markNotificationAsRead,
    clearAllNotifications,
    loadNotifications,
    
    // VRChat methods
    loadVRChatProfile
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};