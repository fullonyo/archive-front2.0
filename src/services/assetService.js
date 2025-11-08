import api from '../config/api';
import { apiConfig } from '../config/apiConfig';

/**
 * Asset Service
 * Serviço para gerenciar assets (avatares, mundos, shaders, etc.)
 * Conectado com backend /api/assets
 */
class AssetService {
  /**
   * Normaliza os dados de asset vindos do backend
   * Garante que URLs de imagens funcionem em qualquer ambiente
   */
  normalizeAsset(asset) {
    if (!asset) return null;

    return {
      ...asset,
      // Normalizar thumbnail URL (produção → localhost em dev)
      thumbnailUrl: apiConfig.normalizeImageUrl(asset.thumbnailUrl),
      // Normalizar array de imagens
      imageUrls: Array.isArray(asset.imageUrls) 
        ? asset.imageUrls.map(url => apiConfig.normalizeAssetUrl(url))
        : [],
      // Normalizar avatar do usuário
      user: asset.user ? {
        ...asset.user,
        avatarUrl: apiConfig.normalizeAssetUrl(asset.user.avatarUrl)
      } : null
    };
  }

  /**
   * Normaliza lista de assets
   */
  normalizeAssets(assets) {
    if (!Array.isArray(assets)) return [];
    return assets.map(asset => this.normalizeAsset(asset));
  }

  // ============================================
  // DISCOVERY & LISTING
  // ============================================

  /**
   * Get all assets with filters (For You, Explore, etc.)
   * @param {Object} options - Filtros de busca
   * @returns {Promise} Lista de assets com paginação
   */
  async getAssets(options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest',
      ...(options.q && { q: options.q }),
      ...(options.category && { category: options.category }),
      ...(options.tags && { tags: Array.isArray(options.tags) ? options.tags.join(',') : options.tags })
    });
    
    const response = await api.get(`/assets?${params}`);
    
    // Normalizar assets na resposta
    if (response.data && response.data.data && response.data.data.assets) {
      response.data.data.assets = this.normalizeAssets(response.data.data.assets);
    }
    
    return response.data;
  }

  /**
   * Get asset by ID
   * @param {number} assetId 
   * @returns {Promise} Asset completo com reviews, stats, etc.
   */
  async getAssetById(assetId) {
    const response = await api.get(`/assets/${assetId}`);
    
    // Normalizar asset individual
    if (response.data && response.data.data) {
      response.data.data = this.normalizeAsset(response.data.data);
    }
    
    return response.data;
  }

  /**
   * Get recent assets
   * @param {number} limit 
   * @returns {Promise} Assets mais recentes
   */
  async getRecentAssets(limit = 10) {
    const response = await api.get(`/assets/recent?limit=${limit}`);
    
    // Normalizar assets
    if (response.data && response.data.data) {
      response.data.data = this.normalizeAssets(response.data.data);
    }
    
    return response.data;
  }

  /**
   * Get trending assets
   * @param {number} limit 
   * @returns {Promise} Assets em alta
   */
  async getTrendingAssets(limit = 10) {
    const response = await api.get(`/assets/trending?limit=${limit}`);
    return response.data;
  }

  /**
   * Get recommended assets (personalized)
   * @param {number} limit 
   * @returns {Promise} Recomendações personalizadas
   */
  async getRecommendations(limit = 10) {
    const response = await api.get(`/assets/recommendations?limit=${limit}`);
    return response.data;
  }

  /**
   * Search assets
   * @param {string} query 
   * @param {Object} filters 
   * @returns {Promise} Resultados da busca
   */
  async searchAssets(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      page: filters.page || 1,
      limit: filters.limit || 20,
      sort: filters.sort || 'relevance',
      ...(filters.category && { category: filters.category }),
      ...(filters.tags && { tags: Array.isArray(filters.tags) ? filters.tags.join(',') : filters.tags })
    });
    
    const response = await api.get(`/assets?${params}`);
    return response.data;
  }

  // ============================================
  // ASSET MANAGEMENT (CREATOR)
  // ============================================

  /**
   * Upload new asset
   * @param {Object} assetData 
   * @returns {Promise} Asset criado
   */
  async uploadAsset(assetData) {
    const formData = new FormData();
    
    // Main file
    if (assetData.file) {
      formData.append('file', assetData.file);
    }
    
    // Thumbnail
    if (assetData.thumbnail) {
      formData.append('thumbnail', assetData.thumbnail);
    }
    
    // Additional images
    if (assetData.images && assetData.images.length > 0) {
      assetData.images.forEach((image, index) => {
        formData.append(`image_${index}`, image);
      });
    }
    
    // Metadata
    formData.append('title', assetData.title);
    formData.append('description', assetData.description || '');
    formData.append('categoryId', assetData.categoryId);
    
    if (assetData.tags && assetData.tags.length > 0) {
      formData.append('tags', JSON.stringify(assetData.tags));
    }
    
    if (assetData.externalUrl) {
      formData.append('externalUrl', assetData.externalUrl);
    }
    
    const response = await api.post('/assets', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: assetData.onProgress
    });
    
    return response.data;
  }

  /**
   * Update asset
   * @param {number} assetId 
   * @param {Object} updateData 
   * @returns {Promise} Asset atualizado
   */
  async updateAsset(assetId, updateData) {
    const response = await api.put(`/assets/${assetId}`, updateData);
    return response.data;
  }

  /**
   * Delete asset
   * @param {number} assetId 
   * @returns {Promise} Confirmação
   */
  async deleteAsset(assetId) {
    const response = await api.delete(`/assets/${assetId}`);
    return response.data;
  }

  /**
   * Get user's uploaded assets
   * @param {number} userId 
   * @param {Object} options 
   * @returns {Promise} Assets do usuário
   */
  async getUserAssets(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/users/${userId}/assets?${params}`);
    return response.data;
  }

  // ============================================
  // INTERACTIONS
  // ============================================

  /**
   * Toggle favorite (like)
   * @param {number} assetId 
   * @returns {Promise} Status atualizado
   */
  async toggleFavorite(assetId) {
    const response = await api.post(`/assets/${assetId}/favorite`);
    return response.data;
  }

  /**
   * Check if asset is favorited
   * @param {number} assetId 
   * @returns {Promise<boolean>} 
   */
  async isFavorite(assetId) {
    const response = await api.get(`/assets/${assetId}/favorite/status`);
    return response.data.isFavorited;
  }

  /**
   * Get user's favorite assets
   * @param {number} userId 
   * @param {Object} options 
   * @returns {Promise} Assets favoritados
   */
  async getUserFavorites(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/users/${userId}/favorites?${params}`);
    return response.data;
  }

  /**
   * Download asset
   * @param {number} assetId 
   * @returns {Promise} Download iniciado
   */
  async downloadAsset(assetId) {
    const response = await api.post(`/assets/${assetId}/download`);
    return response.data;
  }

  /**
   * Get asset download URL
   * @param {number} assetId 
   * @returns {Promise<string>} URL de download
   */
  async getDownloadUrl(assetId) {
    const response = await api.get(`/assets/${assetId}/download-url`);
    return response.data.url;
  }

  /**
   * Get download history
   * @param {number} userId 
   * @param {Object} options 
   * @returns {Promise} Histórico de downloads
   */
  async getDownloadHistory(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20
    });
    
    const response = await api.get(`/users/${userId}/downloads?${params}`);
    return response.data;
  }

  // ============================================
  // REVIEWS & RATINGS
  // ============================================

  /**
   * Get asset reviews
   * @param {number} assetId 
   * @param {Object} options 
   * @returns {Promise} Reviews do asset
   */
  async getAssetReviews(assetId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 10,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/assets/${assetId}/reviews?${params}`);
    return response.data;
  }

  /**
   * Add review
   * @param {number} assetId 
   * @param {Object} reviewData 
   * @returns {Promise} Review criada
   */
  async addReview(assetId, reviewData) {
    const response = await api.post(`/assets/${assetId}/reviews`, reviewData);
    return response.data;
  }

  /**
   * Update review
   * @param {number} assetId 
   * @param {number} reviewId 
   * @param {Object} reviewData 
   * @returns {Promise} Review atualizada
   */
  async updateReview(assetId, reviewId, reviewData) {
    const response = await api.put(`/assets/${assetId}/reviews/${reviewId}`, reviewData);
    return response.data;
  }

  /**
   * Delete review
   * @param {number} assetId 
   * @param {number} reviewId 
   * @returns {Promise} Confirmação
   */
  async deleteReview(assetId, reviewId) {
    const response = await api.delete(`/assets/${assetId}/reviews/${reviewId}`);
    return response.data;
  }

  // ============================================
  // CATEGORIES & TAGS
  // ============================================

  /**
   * Get all categories
   * @returns {Promise} Lista de categorias
   */
  async getCategories() {
    const response = await api.get('/categories');
    return response.data;
  }

  /**
   * Get assets by category
   * @param {number} categoryId 
   * @param {Object} options 
   * @returns {Promise} Assets da categoria
   */
  async getAssetsByCategory(categoryId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/categories/${categoryId}/assets?${params}`);
    return response.data;
  }

  /**
   * Get popular tags
   * @param {number} limit 
   * @returns {Promise} Tags populares
   */
  async getPopularTags(limit = 20) {
    const response = await api.get(`/tags/popular?limit=${limit}`);
    return response.data;
  }

  /**
   * Get assets by tag
   * @param {string} tag 
   * @param {Object} options 
   * @returns {Promise} Assets com a tag
   */
  async getAssetsByTag(tag, options = {}) {
    const params = new URLSearchParams({
      tags: tag,
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/assets?${params}`);
    return response.data;
  }

  // ============================================
  // STATS & ANALYTICS
  // ============================================

  /**
   * Get global stats
   * @returns {Promise} Estatísticas globais
   */
  async getStats() {
    const response = await api.get('/assets/stats');
    return response.data;
  }

  /**
   * Get asset analytics (for creators)
   * @param {number} assetId 
   * @param {string} timeRange 
   * @returns {Promise} Analytics do asset
   */
  async getAssetAnalytics(assetId, timeRange = '30d') {
    const response = await api.get(`/assets/${assetId}/analytics?range=${timeRange}`);
    return response.data;
  }

  // ============================================
  // MODERATION
  // ============================================

  /**
   * Report asset
   * @param {number} assetId 
   * @param {Object} reportData 
   * @returns {Promise} Report criado
   */
  async reportAsset(assetId, reportData) {
    const response = await api.post(`/assets/${assetId}/report`, reportData);
    return response.data;
  }

  /**
   * Moderate asset (admin only)
   * @param {number} assetId 
   * @param {Object} moderationData 
   * @returns {Promise} Asset moderado
   */
  async moderateAsset(assetId, moderationData) {
    const response = await api.post(`/assets/${assetId}/moderate`, moderationData);
    return response.data;
  }
}

export const assetService = new AssetService();
