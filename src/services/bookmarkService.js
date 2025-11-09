import api from '../config/api';

/**
 * BookmarkService
 * Handles bookmark (save for later) operations
 * Separate from favorites (likes/hearts)
 */
export const bookmarkService = {
  /**
   * Toggle bookmark status for an asset
   * @param {number} assetId - Asset ID
   * @returns {Promise<{success: boolean, bookmarked: boolean, message: string}>}
   */
  async toggleBookmark(assetId) {
    try {
      const response = await api.post(`/bookmarks/${assetId}`);
      return response.data;
    } catch (error) {
      console.error('Toggle bookmark error:', error);
      throw error;
    }
  },

  /**
   * Get user's bookmarks
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {Promise<{success: boolean, data: {bookmarks: Array, total: number, page: number, limit: number, hasMore: boolean}}>}
   */
  async getUserBookmarks(page = 1, limit = 20) {
    try {
      const response = await api.get('/bookmarks', {
        params: { page, limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get bookmarks error:', error);
      throw error;
    }
  },

  /**
   * Remove specific bookmark by ID
   * @param {number} bookmarkId - Bookmark ID
   * @returns {Promise<{success: boolean, message: string}>}
   */
  async removeBookmark(bookmarkId) {
    try {
      const response = await api.delete(`/bookmarks/${bookmarkId}`);
      return response.data;
    } catch (error) {
      console.error('Remove bookmark error:', error);
      throw error;
    }
  },

  /**
   * Get user's bookmark count
   * @returns {Promise<{success: boolean, count: number}>}
   */
  async getBookmarkCount() {
    try {
      const response = await api.get('/bookmarks/count');
      return response.data;
    } catch (error) {
      console.error('Get bookmark count error:', error);
      throw error;
    }
  }
};
