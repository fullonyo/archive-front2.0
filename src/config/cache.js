/**
 * Configuração de TTL (Time To Live) para cache
 * 
 * TTL = tempo em milissegundos que os dados permanecem válidos no cache
 * 
 * Estratégia:
 * - Dados que mudam frequentemente = TTL curto
 * - Dados que raramente mudam = TTL longo
 * - Dados críticos para UX = TTL médio
 */

export const CACHE_TTL = {
  // Assets (2 minutos - mudam com frequência)
  ASSETS_LIST: 2 * 60 * 1000,
  ASSET_DETAIL: 5 * 60 * 1000,
  ASSET_SEARCH: 1 * 60 * 1000,
  
  // User & Profile (3 minutos)
  USER_PROFILE: 3 * 60 * 1000,
  USER_STATS: 3 * 60 * 1000,
  USER_AVATARS: 3 * 60 * 1000,
  USER_ASSETS: 3 * 60 * 1000, // My Assets page
  USER_FAVORITES: 3 * 60 * 1000, // Bookmarks page
  
  // Categories (30 minutos - raramente mudam)
  CATEGORIES: 30 * 60 * 1000,
  CATEGORY_ASSETS: 2 * 60 * 1000, // Assets de uma categoria (mesmo TTL que ASSETS_LIST)
  TAGS: 30 * 60 * 1000,
  
  // Forum (5 minutos)
  FORUM_POSTS: 5 * 60 * 1000,
  FORUM_POST_DETAIL: 5 * 60 * 1000,
  
  // Notifications (1 minuto - tempo real)
  NOTIFICATIONS: 1 * 60 * 1000,
  
  // VRChat (10 minutos - API externa)
  VRCHAT_PROFILE: 10 * 60 * 1000,
  VRCHAT_FRIENDS: 10 * 60 * 1000,
  
  // Default
  DEFAULT: 5 * 60 * 1000
};

/**
 * Helpers para gerar cache keys consistentes
 */
export const CACHE_KEYS = {
  // Assets
  assetsList: (page = 1, filters = {}) => {
    const filterStr = JSON.stringify(filters);
    return `assets_list_p${page}_${filterStr}`;
  },
  
  assetDetail: (id) => `asset_detail_${id}`,
  
  assetSearch: (query, page = 1) => `asset_search_${query}_p${page}`,
  
  // User
  userProfile: (username) => `user_profile_${username}`,
  
  userStats: (username) => `user_stats_${username}`,
  
  userAvatars: (userId) => `user_avatars_${userId}`,
  
  userAssets: (userId, page = 1, filters = {}) => {
    const filterStr = JSON.stringify(filters);
    return `user_assets_${userId}_p${page}_${filterStr}`;
  },
  
  userFavorites: (userId, page = 1, filters = {}) => {
    const filterStr = JSON.stringify(filters);
    return `user_favorites_${userId}_p${page}_${filterStr}`;
  },
  
  // Categories
  categories: () => 'categories_all',
  
  categoryDetail: (id) => `category_detail_${id}`,
  
  categoryAssets: (id, page = 1, filters = {}) => {
    const filterStr = JSON.stringify(filters);
    return `category_${id}_assets_p${page}_${filterStr}`;
  },
  
  tags: () => 'tags_all',
  
  // Forum
  forumPosts: (category = 'all', page = 1) => `forum_posts_${category}_p${page}`,
  
  forumPostDetail: (id) => `forum_post_detail_${id}`,
  
  // Notifications
  notifications: (userId) => `notifications_${userId}`,
  
  // VRChat
  vrchatProfile: (vrchatId) => `vrchat_profile_${vrchatId}`,
  
  vrchatFriends: (vrchatId) => `vrchat_friends_${vrchatId}`
};

/**
 * Padrões regex para invalidação de cache
 */
export const CACHE_PATTERNS = {
  // Invalidar todas queries de assets
  ALL_ASSETS: /^assets_/,
  
  // Invalidar assets de uma categoria específica
  ASSETS_BY_CATEGORY: (categoryId) => new RegExp(`^assets_list_.*categoryId.*${categoryId}`),
  
  // Invalidar perfil de um usuário
  USER_PROFILE: (username) => new RegExp(`^user_(profile|stats|avatars)_${username}`),
  
  // Invalidar todas queries de forum
  ALL_FORUM: /^forum_/,
  
  // Invalidar notificações
  NOTIFICATIONS: /^notifications_/,
  
  // Invalidar VRChat de um usuário
  VRCHAT: (vrchatId) => new RegExp(`^vrchat_.*_${vrchatId}`)
};
