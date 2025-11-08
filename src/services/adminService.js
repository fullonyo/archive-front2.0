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
  }
};

export default adminService;
