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
  // MOCKUP DATA - Remove when backend is ready
  const MOCKUP_USER = {
    id: 1,
    username: 'lhama_dev',
    displayName: 'Lhama Developer',
    email: 'lhama@example.com',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lhama',
    bannerImage: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=1200&h=400&fit=crop', // Banner VRChat temático
    bio: 'VRChat enthusiast and avatar creator. Always looking for the next amazing creation! 🦙',
    isVerified: true,
    role: 'user', // 'user', 'moderator', 'admin'
    createdAt: '2024-01-15T10:00:00Z',
    location: 'São Paulo, Brazil',
    vrchatId: 'usr_1234567890',
    socialLinks: {
      twitter: '@lhama_dev',
      discord: 'lhama#1234',
      vrchat: 'usr_1234567890',
      website: 'https://lhama.dev'
    }
  };

  const MOCKUP_STATS = {
    avatarsCount: 42,
    favoritesCount: 156,
    downloadsCount: 2834,
    postsCount: 28,
    repliesCount: 143,
    reputation: 3250,
    level: 12,
    badges: [
      { id: 1, name: 'Early Adopter', icon: '🌟', description: 'Joined in the first month' },
      { id: 2, name: 'Creator', icon: '🎨', description: 'Uploaded 25+ avatars' },
      { id: 3, name: 'Helpful', icon: '💡', description: 'Received 1000+ upvotes' },
      { id: 4, name: 'Verified', icon: '✓', description: 'Verified creator' }
    ],
    unreadNotificationsCount: 5
  };

  const MOCKUP_NOTIFICATIONS = [
    {
      id: 1,
      type: 'like',
      message: 'CoolUser liked your avatar "Cyber Punk Fox"',
      time: '5m ago',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=cool'
    },
    {
      id: 2,
      type: 'comment',
      message: 'AvatarFan commented on your post',
      time: '1h ago',
      read: false,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fan'
    },
    {
      id: 3,
      type: 'follow',
      message: 'JohnDoe started following you',
      time: '2h ago',
      read: true,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john'
    },
    {
      id: 4,
      type: 'achievement',
      message: 'You earned the "Creator" badge!',
      time: '1d ago',
      read: false,
      avatar: null
    },
    {
      id: 5,
      type: 'download',
      message: 'Your avatar was downloaded 100 times!',
      time: '2d ago',
      read: true,
      avatar: null
    }
  ];

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
        
        // MOCKUP: Auto-login com usuário de teste
        // TODO: Remover quando backend estiver pronto
        setTimeout(() => {
          setUser(MOCKUP_USER);
          setIsAuthenticated(true);
          setNotifications(MOCKUP_NOTIFICATIONS);
          setLoading(false);
        }, 500); // Simula delay de rede
        
        /* Código original - descomentar quando backend estiver pronto
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
        */
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
  const login = useCallback(async (credentials) => {
    try {
      setLoading(true);
      setError(null);
      
      // MOCKUP: Simular login
      setTimeout(() => {
        setUser(MOCKUP_USER);
        setIsAuthenticated(true);
        setNotifications(MOCKUP_NOTIFICATIONS);
        setLoading(false);
      }, 1000); // Simula delay de rede
      
      return { success: true };
      
      /* Código original - descomentar quando backend estiver pronto
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
      */
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    // MOCKUP: Apenas limpar estado
    setUser(null);
    setIsAuthenticated(false);
    setNotifications([]);
    
    /* Código original - descomentar quando backend estiver pronto
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
    */
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
    // MOCKUP: Usar dados mockup quando disponíveis
    avatarsCount: isAuthenticated ? MOCKUP_STATS.avatarsCount : userAvatars.length,
    favoritesCount: isAuthenticated ? MOCKUP_STATS.favoritesCount : favoriteAvatars.length,
    downloadsCount: isAuthenticated ? MOCKUP_STATS.downloadsCount : downloadedAssets.length,
    postsCount: isAuthenticated ? MOCKUP_STATS.postsCount : userPosts.length,
    repliesCount: isAuthenticated ? MOCKUP_STATS.repliesCount : userReplies.length,
    reputation: isAuthenticated ? MOCKUP_STATS.reputation : (forumProfile?.reputation || 0),
    joinedDate: user?.createdAt,
    level: isAuthenticated ? MOCKUP_STATS.level : (forumProfile?.level || 1),
    badges: isAuthenticated ? MOCKUP_STATS.badges : (forumProfile?.badges || []),
    isVerified: user?.isVerified || false,
    isModerator: user?.role === 'moderator' || user?.role === 'admin',
    isAdmin: user?.role === 'admin',
    unreadNotificationsCount: isAuthenticated ? MOCKUP_STATS.unreadNotificationsCount : notifications.filter(n => !n.read).length
  };

  const unreadNotificationsCount = isAuthenticated ? MOCKUP_STATS.unreadNotificationsCount : notifications.filter(n => !n.read).length;

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