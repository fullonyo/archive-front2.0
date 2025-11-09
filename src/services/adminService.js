import api from '../config/api';

/**
 * Admin Service - Gerenciamento de funcionalidades administrativas
 * Endpoints protegidos por role ADMIN/MODERATOR
 */
const adminService = {
  /**
   * Get pending assets waiting for approval
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @returns {Promise} API response with pending assets
   */
  getPendingAssets: async ({ page = 1, limit = 20 } = {}) => {
    try {
      const response = await api.get('/assets/admin/pending', {
        params: { 
          page, 
          limit,
          _t: Date.now() // Cache busting - garante dados frescos
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get pending assets error:', error);
      throw error;
    }
  },

  /**
   * Get all assets with filters (admin)
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.category - Filter by category
   * @param {string} params.status - Filter by status (approved/pending/rejected)
   * @param {string} params.sortBy - Sort field
   * @returns {Promise} API response with assets
   */
  getAssets: async ({ page = 1, limit = 20, search, category, status, sortBy } = {}) => {
    try {
      const response = await api.get('/assets', {
        params: { 
          page, 
          limit, 
          search, 
          category, 
          isApproved: status === 'approved' ? true : status === 'pending' ? null : false,
          sortBy,
          _t: Date.now()
        }
      });
      return response.data;
    } catch (error) {
      console.error('Get assets error:', error);
      throw error;
    }
  },

  /**
   * Approve an asset
   * @param {number} assetId - Asset ID to approve
   * @returns {Promise} API response
   */
  approveAsset: async (assetId) => {
    try {
      const response = await api.put(`/assets/${assetId}/approval`, {
        is_approved: true
      });
      return response.data;
    } catch (error) {
      console.error('Approve asset error:', error);
      throw error;
    }
  },

  /**
   * Reject an asset
   * @param {number} assetId - Asset ID to reject
   * @returns {Promise} API response
   */
  rejectAsset: async (assetId) => {
    try {
      const response = await api.put(`/assets/${assetId}/approval`, {
        is_approved: false
      });
      return response.data;
    } catch (error) {
      console.error('Reject asset error:', error);
      throw error;
    }
  },

  /**
   * Batch approve multiple assets
   * @param {number[]} assetIds - Array of asset IDs
   * @returns {Promise} Results array
   */
  batchApproveAssets: async (assetIds) => {
    try {
      const promises = assetIds.map(id => adminService.approveAsset(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: true,
        data: {
          total: assetIds.length,
          successful,
          failed,
          results
        }
      };
    } catch (error) {
      console.error('Batch approve error:', error);
      throw error;
    }
  },

  /**
   * Batch reject multiple assets
   * @param {number[]} assetIds - Array of asset IDs
   * @returns {Promise} Results array
   */
  batchRejectAssets: async (assetIds) => {
    try {
      const promises = assetIds.map(id => adminService.rejectAsset(id));
      const results = await Promise.allSettled(promises);
      
      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      return {
        success: true,
        data: {
          total: assetIds.length,
          successful,
          failed,
          results
        }
      };
    } catch (error) {
      console.error('Batch reject error:', error);
      throw error;
    }
  },

  /**
   * Get user permissions
   * @returns {Promise} User permissions and role
   */
  getMyPermissions: async () => {
    try {
      const response = await api.get('/admin/permissions/me');
      return response.data;
    } catch (error) {
      console.error('Get permissions error:', error);
      throw error;
    }
  },

  // ============================================
  // USER MANAGEMENT
  // ============================================

  /**
   * Get all users with filters
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} params.search - Search query
   * @param {string} params.role - Filter by role
   * @param {string} params.accountType - Filter by account type
   * @param {string} params.status - Filter by status (active/inactive/banned)
   * @param {string} params.sortBy - Sort field
   * @returns {Promise} API response with users
   */
  getUsers: async ({ page = 1, limit = 20, search, role, accountType, status, sortBy } = {}) => {
    try {
      const response = await api.get('/admin/users', {
        params: { page, limit, search, role, accountType, status, sortBy }
      });
      return response.data;
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },

  /**
   * Get user details
   * @param {number} userId - User ID
   * @returns {Promise} User data
   */
  getUserDetails: async (userId) => {
    try {
      const response = await api.get(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user details error:', error);
      throw error;
    }
  },

  /**
   * Update user
   * @param {number} userId - User ID
   * @param {Object} data - User data to update
   * @returns {Promise} Updated user
   */
  updateUser: async (userId, data) => {
    try {
      const response = await api.put(`/admin/users/${userId}`, data);
      return response.data;
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },

  /**
   * Change user role
   * @param {number} userId - User ID
   * @param {string} role - New role (USER, CREATOR, MODERATOR, ADMIN)
   * @returns {Promise} Updated user
   */
  changeUserRole: async (userId, role) => {
    try {
      const response = await api.put(`/admin/users/${userId}/role`, { role });
      return response.data;
    } catch (error) {
      console.error('Change user role error:', error);
      throw error;
    }
  },

  /**
   * Ban user
   * @param {number} userId - User ID
   * @param {string} reason - Ban reason
   * @param {Date} expiresAt - Ban expiration (null for permanent)
   * @returns {Promise} API response
   */
  banUser: async (userId, reason, expiresAt = null) => {
    try {
      const response = await api.post(`/admin/users/${userId}/ban`, {
        reason,
        expiresAt
      });
      return response.data;
    } catch (error) {
      console.error('Ban user error:', error);
      throw error;
    }
  },

  /**
   * Unban user
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  unbanUser: async (userId) => {
    try {
      const response = await api.post(`/admin/users/${userId}/unban`);
      return response.data;
    } catch (error) {
      console.error('Unban user error:', error);
      throw error;
    }
  },

  /**
   * Delete user
   * @param {number} userId - User ID
   * @returns {Promise} API response
   */
  deleteUser: async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Delete user error:', error);
      throw error;
    }
  },

  /**
   * Get user activity log
   * @param {number} userId - User ID
   * @param {number} limit - Number of activities
   * @returns {Promise} Activity log
   */
  getUserActivity: async (userId, limit = 50) => {
    try {
      const response = await api.get(`/admin/users/${userId}/activity`, {
        params: { limit }
      });
      return response.data;
    } catch (error) {
      console.error('Get user activity error:', error);
      throw error;
    }
  },

  // ============================================
  // ACCESS REQUESTS MANAGEMENT
  // ============================================

  /**
   * Get pending access requests
   * @param {Object} params - Query parameters
   * @returns {Promise} Access requests
   */
  getAccessRequests: async ({ page = 1, limit = 20, status = 'PENDING' } = {}) => {
    try {
      const response = await api.get('/admin/access-requests', {
        params: { page, limit, status }
      });
      return response.data;
    } catch (error) {
      console.error('Get access requests error:', error);
      throw error;
    }
  },

  /**
   * Approve access request
   * @param {number} requestId - Request ID
   * @returns {Promise} API response
   */
  approveAccessRequest: async (requestId) => {
    try {
      const response = await api.post(`/admin/access-requests/${requestId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Approve access request error:', error);
      throw error;
    }
  },

  /**
   * Reject access request
   * @param {number} requestId - Request ID
   * @param {string} reason - Rejection reason
   * @returns {Promise} API response
   */
  rejectAccessRequest: async (requestId, reason) => {
    try {
      const response = await api.post(`/admin/access-requests/${requestId}/reject`, {
        reason
      });
      return response.data;
    } catch (error) {
      console.error('Reject access request error:', error);
      throw error;
    }
  },

  // ============================================
  // STATISTICS & ANALYTICS
  // ============================================

  /**
   * Get admin dashboard stats
   * @returns {Promise} Dashboard statistics
   */
  getDashboardStats: async () => {
    try {
      const response = await api.get('/admin/stats/dashboard');
      return response.data;
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      throw error;
    }
  },

  /**
   * Get user stats
   * @param {string} period - Time period (day, week, month, year)
   * @returns {Promise} User statistics
   */
  getUserStats: async (period = 'month') => {
    try {
      const response = await api.get('/admin/stats/users', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get user stats error:', error);
      throw error;
    }
  },

  /**
   * Get asset statistics
   * @param {string} period - Time period
   * @returns {Promise} Asset statistics
   */
  getAssetStats: async (period = 'month') => {
    try {
      const response = await api.get('/admin/assets/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      console.error('Get asset stats error:', error);
      throw error;
    }
  },

  /**
   * Get analytics overview
   * @param {Object} params - Parameters (startDate, endDate)
   * @returns {Promise} Analytics overview data
   */
  getAnalyticsOverview: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics/overview', { params });
      return response.data;
    } catch (error) {
      console.error('Get analytics overview error:', error);
      throw error;
    }
  },

  /**
   * Get user analytics
   * @param {Object} params - Parameters (startDate, endDate, metric)
   * @returns {Promise} User analytics data
   */
  getUserAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics/users', { params });
      return response.data;
    } catch (error) {
      console.error('Get user analytics error:', error);
      throw error;
    }
  },

  /**
   * Get asset analytics
   * @param {Object} params - Parameters (startDate, endDate, metric)
   * @returns {Promise} Asset analytics data
   */
  getAssetAnalytics: async (params = {}) => {
    try {
      const response = await api.get('/admin/analytics/assets', { params });
      return response.data;
    } catch (error) {
      console.error('Get asset analytics error:', error);
      throw error;
    }
  },

  /**
   * Get top lists
   * @param {string} type - Type (creators, assets, categories)
   * @param {Object} params - Parameters (limit, startDate, endDate)
   * @returns {Promise} Top list data
   */
  getTopLists: async (type, params = {}) => {
    try {
      const response = await api.get(`/admin/analytics/top/${type}`, { params });
      return response.data;
    } catch (error) {
      console.error(`Get top ${type} error:`, error);
      throw error;
    }
  },

  /**
   * Export analytics data
   * @param {string} format - Export format (csv, pdf)
   * @param {Object} params - Export parameters
   * @returns {Promise} Blob data
   */
  exportAnalytics: async (format, params = {}) => {
    try {
      const response = await api.get(`/admin/analytics/export/${format}`, {
        params,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.error('Export analytics error:', error);
      throw error;
    }
  },

  // ============================================
  // CATEGORIES MANAGEMENT
  // ============================================

  /**
   * Get all categories (admin)
   * @param {Object} params - Query parameters
   * @returns {Promise} Categories with asset counts
   */
  getCategories: async (params = {}) => {
    try {
      const response = await api.get('/admin/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Get categories error:', error);
      throw error;
    }
  },

  /**
   * Get category by ID
   * @param {number} id - Category ID
   * @returns {Promise} Category details
   */
  getCategory: async (id) => {
    try {
      const response = await api.get(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Get category error:', error);
      throw error;
    }
  },

  /**
   * Create new category
   * @param {Object} data - Category data (name, description, icon, isActive)
   * @returns {Promise} Created category
   */
  createCategory: async (data) => {
    try {
      const response = await api.post('/admin/categories', data);
      return response.data;
    } catch (error) {
      console.error('Create category error:', error);
      throw error;
    }
  },

  /**
   * Update category
   * @param {number} id - Category ID
   * @param {Object} data - Updated data
   * @returns {Promise} Updated category
   */
  updateCategory: async (id, data) => {
    try {
      const response = await api.put(`/admin/categories/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Update category error:', error);
      throw error;
    }
  },

  /**
   * Delete category
   * @param {number} id - Category ID
   * @returns {Promise} Deletion confirmation
   */
  deleteCategory: async (id) => {
    try {
      const response = await api.delete(`/admin/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('Delete category error:', error);
      throw error;
    }
  }
};

export default adminService;
