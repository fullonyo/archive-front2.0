/**
 * Constants - Application-wide constants
 */

// Placeholder images (SVG Data URIs - sem dependência de internet)
export const PLACEHOLDER_IMAGES = {
  // Asset thumbnail placeholder (400x225 - aspect ratio 16:9)
  ASSET_THUMBNAIL: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='225'%3E%3Crect width='400' height='225' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='18' fill='%239CA3AF'%3ENo Image%3C/text%3E%3C/svg%3E",
  
  // Avatar placeholder (quadrado 200x200)
  AVATAR: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect width='200' height='200' fill='%23374151'/%3E%3Ccircle cx='100' cy='80' r='40' fill='%239CA3AF'/%3E%3Cpath d='M40,160 Q100,120 160,160' fill='%239CA3AF'/%3E%3C/svg%3E",
  
  // Banner placeholder (1200x300 - aspecto 4:1)
  BANNER: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='300'%3E%3Crect width='1200' height='300' fill='%23374151'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%239CA3AF'%3ENo Banner%3C/text%3E%3C/svg%3E"
};

// API Configuration
export const API_CONFIG = {
  // Timeout para requisições (30 segundos)
  REQUEST_TIMEOUT: 30000,
  
  // Retry attempts para requisições falhadas
  MAX_RETRIES: 3,
  
  // Intervalo entre retries (em ms)
  RETRY_DELAY: 1000
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  LOAD_MORE_THRESHOLD: 0.8 // Carregar mais quando 80% do scroll
};

// File Upload
export const UPLOAD = {
  MAX_FILE_SIZE: 1024 * 1024 * 1024, // 1GB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_ASSET_TYPES: [
    'application/zip',
    'application/x-zip-compressed',
    'application/x-unity-package',
    'application/x-rar-compressed',
    'application/x-7z-compressed'
  ]
};

// Cache
export const CACHE = {
  // TTL para cache de assets (5 minutos)
  ASSETS_TTL: 5 * 60 * 1000,
  
  // TTL para cache de categorias (30 minutos)
  CATEGORIES_TTL: 30 * 60 * 1000,
  
  // TTL para cache de perfis (10 minutos)
  PROFILES_TTL: 10 * 60 * 1000
};

// Routes
export const ROUTES = {
  HOME: '/',
  FOR_YOU: '/for-you',
  EXPLORE: '/explore',
  UPLOAD: '/upload',
  PROFILE: '/profile',
  ASSET_DETAIL: '/asset',
  LOGIN: '/login',
  REGISTER: '/register'
};

// Asset Categories (sync com backend)
export const ASSET_CATEGORIES = {
  AVATAR: 'avatar',
  WORLD: 'world',
  SHADER: 'shader',
  TOOL: 'tool',
  PREFAB: 'prefab',
  TEXTURE: 'texture',
  ANIMATION: 'animation',
  OTHER: 'other'
};

// Sort Options
export const SORT_OPTIONS = {
  NEWEST: 'newest',
  OLDEST: 'oldest',
  POPULAR: 'popular',
  TRENDING: 'trending',
  MOST_DOWNLOADED: 'downloads',
  HIGHEST_RATED: 'rating'
};

export default {
  PLACEHOLDER_IMAGES,
  API_CONFIG,
  PAGINATION,
  UPLOAD,
  CACHE,
  ROUTES,
  ASSET_CATEGORIES,
  SORT_OPTIONS
};
