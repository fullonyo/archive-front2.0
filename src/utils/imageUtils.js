/**
 * Image Utilities - Centralized image handling and fallback management
 * 
 * Provides consistent fallback behavior across the application for:
 * - Avatar images (user profile pictures)
 * - Banner images (profile/page headers)
 * - Asset thumbnails (asset preview images)
 * 
 * Usage:
 * <img 
 *   src={url} 
 *   onError={handleImageError('avatar')} 
 *   alt="..." 
 * />
 */

import { PLACEHOLDER_IMAGES } from '../constants';

/**
 * Image type to placeholder mapping
 */
const FALLBACK_MAP = {
  avatar: PLACEHOLDER_IMAGES.AVATAR,
  banner: PLACEHOLDER_IMAGES.BANNER,
  thumbnail: PLACEHOLDER_IMAGES.ASSET_THUMBNAIL,
  asset: PLACEHOLDER_IMAGES.ASSET_THUMBNAIL
};

/**
 * Creates an image error handler that sets a fallback placeholder
 * 
 * @param {string} type - Image type: 'avatar', 'banner', 'thumbnail', or 'asset'
 * @returns {Function} Event handler for onError
 * 
 * @example
 * // Avatar fallback
 * <img src={user.avatarUrl} onError={handleImageError('avatar')} />
 * 
 * @example
 * // Banner fallback
 * <img src={user.bannerUrl} onError={handleImageError('banner')} />
 * 
 * @example
 * // Thumbnail fallback
 * <img src={asset.thumbnail} onError={handleImageError('thumbnail')} />
 */
export const handleImageError = (type = 'avatar') => {
  return (e) => {
    const fallbackSrc = FALLBACK_MAP[type] || PLACEHOLDER_IMAGES.AVATAR;
    
    // Prevent infinite error loops
    if (e.target.src !== fallbackSrc) {
      e.target.src = fallbackSrc;
      
      // Optional: Log errors in development
      if (import.meta.env.DEV) {
        console.warn(`Image load failed (${type}):`, e.target.dataset.originalSrc || 'unknown');
      }
    }
  };
};

/**
 * Gets the appropriate fallback image for a given type
 * 
 * @param {string} type - Image type: 'avatar', 'banner', 'thumbnail', or 'asset'
 * @returns {string} Data URI for the placeholder image
 * 
 * @example
 * const src = imageUrl || getFallbackImage('avatar');
 */
export const getFallbackImage = (type = 'avatar') => {
  return FALLBACK_MAP[type] || PLACEHOLDER_IMAGES.AVATAR;
};

/**
 * Validates if an image URL exists and is valid
 * 
 * @param {string} url - Image URL to validate
 * @returns {boolean} True if URL is valid and not empty
 * 
 * @example
 * const shouldShowImage = isValidImageUrl(user.avatarUrl);
 */
export const isValidImageUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  
  // Check if URL is not just whitespace
  if (url.trim().length === 0) return false;
  
  // Basic URL validation
  try {
    // Data URIs and HTTP(S) URLs are valid
    return url.startsWith('data:') || url.startsWith('http://') || url.startsWith('https://');
  } catch {
    return false;
  }
};

/**
 * Creates a complete image props object with fallback handling
 * 
 * @param {string} src - Image source URL
 * @param {string} type - Image type for fallback
 * @param {string} alt - Alt text for the image
 * @returns {Object} Props object with src, onError, and alt
 * 
 * @example
 * <img {...getImageProps(user.avatarUrl, 'avatar', user.username)} />
 */
export const getImageProps = (src, type = 'avatar', alt = '') => {
  return {
    src: src || getFallbackImage(type),
    onError: handleImageError(type),
    alt: alt || `${type} image`,
    loading: 'lazy'
  };
};

/**
 * Performance: Preload critical images
 * 
 * @param {string[]} urls - Array of image URLs to preload
 * 
 * @example
 * preloadImages([user.avatarUrl, user.bannerUrl]);
 */
export const preloadImages = (urls) => {
  urls.forEach(url => {
    if (isValidImageUrl(url)) {
      const img = new Image();
      img.src = url;
    }
  });
};

export default {
  handleImageError,
  getFallbackImage,
  isValidImageUrl,
  getImageProps,
  preloadImages
};
