import api from '../config/api';

class AvatarService {
  // Avatar management
  async getUserAvatars(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest',
      category: options.category || '',
      tags: options.tags || ''
    });
    
    const response = await api.get(`/users/${userId}/avatars?${params}`);
    return response.data;
  }

  async uploadAvatar(userId, avatarData) {
    const formData = new FormData();
    
    // Add avatar files
    if (avatarData.vrm) formData.append('vrm', avatarData.vrm);
    if (avatarData.fbx) formData.append('fbx', avatarData.fbx);
    if (avatarData.unitypackage) formData.append('unitypackage', avatarData.unitypackage);
    
    // Add preview images
    if (avatarData.previewImages) {
      avatarData.previewImages.forEach((image, index) => {
        formData.append(`preview_${index}`, image);
      });
    }
    
    // Add metadata
    formData.append('metadata', JSON.stringify({
      name: avatarData.name,
      description: avatarData.description,
      category: avatarData.category,
      tags: avatarData.tags,
      isPublic: avatarData.isPublic,
      price: avatarData.price || 0,
      license: avatarData.license,
      technicalSpecs: avatarData.technicalSpecs
    }));
    
    const response = await api.post(`/users/${userId}/avatars`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: avatarData.onProgress
    });
    
    return response.data;
  }

  async updateAvatar(userId, avatarId, updateData) {
    const response = await api.put(`/users/${userId}/avatars/${avatarId}`, updateData);
    return response.data;
  }

  async deleteAvatar(userId, avatarId) {
    const response = await api.delete(`/users/${userId}/avatars/${avatarId}`);
    return response.data;
  }

  // Avatar discovery
  async getPublicAvatars(options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'popular',
      category: options.category || '',
      tags: options.tags || '',
      priceRange: options.priceRange || '',
      search: options.search || ''
    });
    
    const response = await api.get(`/avatars/public?${params}`);
    return response.data;
  }

  async getAvatarById(avatarId) {
    const response = await api.get(`/avatars/${avatarId}`);
    return response.data;
  }

  async searchAvatars(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await api.get(`/avatars/search?${params}`);
    return response.data;
  }

  async getFeaturedAvatars() {
    const response = await api.get('/avatars/featured');
    return response.data;
  }

  async getTrendingAvatars() {
    const response = await api.get('/avatars/trending');
    return response.data;
  }

  // Favorites system
  async getUserFavorites(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/users/${userId}/favorites?${params}`);
    return response.data;
  }

  async addFavorite(userId, avatarId) {
    const response = await api.post(`/users/${userId}/favorites/${avatarId}`);
    return response.data;
  }

  async removeFavorite(userId, avatarId) {
    const response = await api.delete(`/users/${userId}/favorites/${avatarId}`);
    return response.data;
  }

  async isFavorite(userId, avatarId) {
    const response = await api.get(`/users/${userId}/favorites/${avatarId}/status`);
    return response.data.isFavorite;
  }

  // Downloads and purchases
  async getUserDownloads(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/users/${userId}/downloads?${params}`);
    return response.data;
  }

  async downloadAvatar(avatarId, format = 'vrm') {
    const response = await api.get(`/avatars/${avatarId}/download/${format}`, {
      responseType: 'blob'
    });
    return response.data;
  }

  async purchaseAvatar(avatarId, paymentMethod) {
    const response = await api.post(`/avatars/${avatarId}/purchase`, { paymentMethod });
    return response.data;
  }

  async getDownloadHistory(userId, avatarId) {
    const response = await api.get(`/users/${userId}/downloads/${avatarId}/history`);
    return response.data;
  }

  // Avatar interactions
  async likeAvatar(avatarId) {
    const response = await api.post(`/avatars/${avatarId}/like`);
    return response.data;
  }

  async unlikeAvatar(avatarId) {
    const response = await api.delete(`/avatars/${avatarId}/like`);
    return response.data;
  }

  async getAvatarLikes(avatarId) {
    const response = await api.get(`/avatars/${avatarId}/likes`);
    return response.data;
  }

  async viewAvatar(avatarId) {
    const response = await api.post(`/avatars/${avatarId}/view`);
    return response.data;
  }

  // Avatar reviews and ratings
  async getAvatarReviews(avatarId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 10,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/avatars/${avatarId}/reviews?${params}`);
    return response.data;
  }

  async addAvatarReview(avatarId, reviewData) {
    const response = await api.post(`/avatars/${avatarId}/reviews`, reviewData);
    return response.data;
  }

  async updateAvatarReview(avatarId, reviewId, reviewData) {
    const response = await api.put(`/avatars/${avatarId}/reviews/${reviewId}`, reviewData);
    return response.data;
  }

  async deleteAvatarReview(avatarId, reviewId) {
    const response = await api.delete(`/avatars/${avatarId}/reviews/${reviewId}`);
    return response.data;
  }

  // Avatar collections/playlists
  async getUserCollections(userId) {
    const response = await api.get(`/users/${userId}/collections`);
    return response.data;
  }

  async createCollection(userId, collectionData) {
    const response = await api.post(`/users/${userId}/collections`, collectionData);
    return response.data;
  }

  async addToCollection(userId, collectionId, avatarId) {
    const response = await api.post(`/users/${userId}/collections/${collectionId}/avatars/${avatarId}`);
    return response.data;
  }

  async removeFromCollection(userId, collectionId, avatarId) {
    const response = await api.delete(`/users/${userId}/collections/${collectionId}/avatars/${avatarId}`);
    return response.data;
  }

  // Avatar categories and tags
  async getCategories() {
    const response = await api.get('/avatars/categories');
    return response.data;
  }

  async getPopularTags() {
    const response = await api.get('/avatars/tags/popular');
    return response.data;
  }

  async getTagSuggestions(query) {
    const response = await api.get(`/avatars/tags/suggestions?q=${query}`);
    return response.data;
  }

  // Avatar analytics (for creators)
  async getAvatarAnalytics(userId, avatarId, timeRange = '30d') {
    const response = await api.get(`/users/${userId}/avatars/${avatarId}/analytics?range=${timeRange}`);
    return response.data;
  }

  async getUserAvatarStats(userId) {
    const response = await api.get(`/users/${userId}/avatar-stats`);
    return response.data;
  }

  // Avatar moderation
  async reportAvatar(avatarId, reportData) {
    const response = await api.post(`/avatars/${avatarId}/report`, reportData);
    return response.data;
  }

  async moderateAvatar(avatarId, moderationData) {
    const response = await api.post(`/avatars/${avatarId}/moderate`, moderationData);
    return response.data;
  }

  // Avatar import/export
  async importFromVRChat(vrchatAvatarId) {
    const response = await api.post('/avatars/import/vrchat', { vrchatAvatarId });
    return response.data;
  }

  async exportToVRChat(avatarId, vrchatData) {
    const response = await api.post(`/avatars/${avatarId}/export/vrchat`, vrchatData);
    return response.data;
  }

  // Avatar backup and versioning
  async getAvatarVersions(avatarId) {
    const response = await api.get(`/avatars/${avatarId}/versions`);
    return response.data;
  }

  async createAvatarVersion(avatarId, versionData) {
    const response = await api.post(`/avatars/${avatarId}/versions`, versionData);
    return response.data;
  }

  async restoreAvatarVersion(avatarId, versionId) {
    const response = await api.post(`/avatars/${avatarId}/versions/${versionId}/restore`);
    return response.data;
  }
}

export const avatarService = new AvatarService();