import api from '../config/api';
import { apiConfig } from '../config/apiConfig';
import { PLACEHOLDER_IMAGES } from '../constants';

class UserService {
  /**
   * Normaliza dados do usuário
   * - Normaliza avatarUrl e bannerUrl via apiConfig
   * - Adiciona placeholder para avatares ausentes
   * - Parse de socialLinks se necessário
   */
  normalizeUser(user) {
    if (!user) return null;

    return {
      ...user,
      avatarUrl: apiConfig.normalizeImageUrl(user.avatarUrl, PLACEHOLDER_IMAGES.AVATAR),
      bannerUrl: apiConfig.normalizeImageUrl(user.bannerUrl, PLACEHOLDER_IMAGES.BANNER),
      socialLinks: typeof user.socialLinks === 'string' 
        ? JSON.parse(user.socialLinks) 
        : user.socialLinks
    };
  }

  /**
   * Normaliza array de usuários
   */
  normalizeUsers(users) {
    if (!Array.isArray(users)) return [];
    return users.map(user => this.normalizeUser(user));
  }

  // Authentication
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    // Backend retorna: { success: true, data: { user, token, ... } }
    return response.data;
  }

  async register(userData) {
    const response = await api.post('/auth/register', userData);
    return response.data;
  }

  async logout() {
    const response = await api.post('/auth/logout');
    return response.data;
  }

  async verifyToken(token) {
    const response = await api.get('/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.user;
  }

  async refreshToken() {
    const response = await api.post('/auth/refresh');
    return response.data;
  }

  // Profile management
  async getCurrentProfile() {
    const response = await api.get('/users/profile');
    return this.normalizeUser(response.data.data.user);
  }

  async getProfileById(userId) {
    const response = await api.get(`/users/${userId}`);
    return this.normalizeUser(response.data.data);
  }

  async getProfileByUsername(username) {
    const response = await api.get(`/users/username/${username}`);
    return this.normalizeUser(response.data.data);
  }

  async updateProfile(profileData) {
    const response = await api.put('/users/profile', profileData);
    return this.normalizeUser(response.data.data.user);
  }

  async uploadAvatar(file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async uploadBanner(file) {
    const formData = new FormData();
    formData.append('banner', file);
    
    const response = await api.post('/users/banner', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data.data;
  }

  async changePassword(passwordData) {
    const response = await api.put('/users/password', passwordData);
    return response.data;
  }

  // User assets and favorites
  async getUserAssets(userId, options = {}) {
    const params = new URLSearchParams({
      userId: userId || '',
      page: options.page || 1,
      limit: options.limit || 20,
      includeUnapproved: options.includeUnapproved || false,
      includeInactive: options.includeInactive || false
    });
    
    const response = await api.get(`/users/assets?${params}`);
    return response.data.data;
  }

  async getUserFavorites(userId, options = {}) {
    const params = new URLSearchParams({
      userId: userId,
      page: options.page || 1,
      limit: options.limit || 20
    });
    
    const response = await api.get(`/users/favorites?${params}`);
    return response.data.data;
  }

  async getMyFavorites(options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20
    });
    
    const response = await api.get(`/users/my-favorites?${params}`);
    return response.data.data;
  }

  // Rankings
  async getTopUploaders(limit = 10) {
    const response = await api.get(`/users/top-uploaders?limit=${limit}`);
    return this.normalizeUsers(response.data.data);
  }

  async getTopByDownloads(limit = 10) {
    const response = await api.get(`/users/top-downloads?limit=${limit}`);
    return this.normalizeUsers(response.data.data);
  }

  async getTopByLikes(limit = 10) {
    const response = await api.get(`/users/top-likes?limit=${limit}`);
    return this.normalizeUsers(response.data.data);
  }

  async getTopByRating(limit = 10) {
    const response = await api.get(`/users/top-rating?limit=${limit}`);
    return this.normalizeUsers(response.data.data);
  }

  // Profile comments
  async getProfileComments(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20
    });
    
    const response = await api.get(`/users/${userId}/comments?${params}`);
    return response.data.data;
  }

  async createProfileComment(userId, commentData) {
    const response = await api.post(`/users/${userId}/comments`, commentData);
    return response.data.data;
  }
}

export const userService = new UserService();