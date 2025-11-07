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
          const userData = await userService.verifyToken(token);
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
            
            // Load related data in parallel
            await Promise.allSettled([
              loadUserAvatars(userData.id),
              loadForumProfile(userData.id),
              loadVRChatProfile(userData.vrchatId),
              loadNotifications(userData.id)
            ]);
          }
        }
      } catch (err) {
        console.error('Failed to initialize user:', err);
        setError(err.message);
        // Clear invalid token
        localStorage.removeItem('auth_token');
      } finally {
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
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: userData, token } = await userService.login(credentials);
      
      localStorage.setItem('auth_token', token);
      setUser(userData);
      setIsAuthenticated(true);
      
      // Load user data after login
      await Promise.allSettled([
        loadUserAvatars(userData.id),
        loadForumProfile(userData.id),
        loadVRChatProfile(userData.vrchatId),
        loadNotifications(userData.id)
      ]);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [loadUserAvatars, loadForumProfile, loadVRChatProfile, loadNotifications]);

  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
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
    avatarsCount: userAvatars.length,
    favoritesCount: favoriteAvatars.length,
    downloadsCount: downloadedAssets.length,
    postsCount: userPosts.length,
    repliesCount: userReplies.length,
    reputation: forumProfile?.reputation || 0,
    joinedDate: user?.createdAt,
    level: forumProfile?.level || 1,
    badges: forumProfile?.badges || [],
    isVerified: user?.isVerified || false,
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isAdmin: user?.role === 'admin'
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