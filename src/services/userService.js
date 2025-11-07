import api from '../config/api';

class UserService {
  // Authentication
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
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
  async getProfile(userId) {
    const response = await api.get(`/users/${userId}`);
    return response.data;
  }

  async updateProfile(userId, profileData) {
    const response = await api.put(`/users/${userId}`, profileData);
    return response.data;
  }

  async uploadAvatar(userId, file) {
    const formData = new FormData();
    formData.append('avatar', file);
    
    const response = await api.post(`/users/${userId}/avatar`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  }

  async changePassword(userId, passwordData) {
    const response = await api.put(`/users/${userId}/password`, passwordData);
    return response.data;
  }

  // User search and discovery
  async searchUsers(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      ...filters
    });
    
    const response = await api.get(`/users/search?${params}`);
    return response.data;
  }

  async getTopUsers(criteria = 'reputation', limit = 20) {
    const response = await api.get(`/users/leaderboard?criteria=${criteria}&limit=${limit}`);
    return response.data;
  }

  async getUsersByRole(role) {
    const response = await api.get(`/users/role/${role}`);
    return response.data;
  }

  // User statistics and activity
  async getUserStats(userId) {
    const response = await api.get(`/users/${userId}/stats`);
    return response.data;
  }

  async getUserActivity(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type || 'all'
    });
    
    const response = await api.get(`/users/${userId}/activity?${params}`);
    return response.data;
  }

  // Social features
  async followUser(userId) {
    const response = await api.post(`/users/${userId}/follow`);
    return response.data;
  }

  async unfollowUser(userId) {
    const response = await api.delete(`/users/${userId}/follow`);
    return response.data;
  }

  async getFollowers(userId) {
    const response = await api.get(`/users/${userId}/followers`);
    return response.data;
  }

  async getFollowing(userId) {
    const response = await api.get(`/users/${userId}/following`);
    return response.data;
  }

  // Notifications
  async getNotifications(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 50,
      unread: options.unreadOnly || false
    });
    
    const response = await api.get(`/users/${userId}/notifications?${params}`);
    return response.data;
  }

  async markNotificationAsRead(notificationId) {
    const response = await api.put(`/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllNotificationsAsRead(userId) {
    const response = await api.put(`/users/${userId}/notifications/read-all`);
    return response.data;
  }

  async clearAllNotifications(userId) {
    const response = await api.delete(`/users/${userId}/notifications`);
    return response.data;
  }

  async updateNotificationSettings(userId, settings) {
    const response = await api.put(`/users/${userId}/notification-settings`, settings);
    return response.data;
  }

  // VRChat Integration
  async linkVRChatAccount(userId, vrchatData) {
    const response = await api.post(`/users/${userId}/vrchat/link`, vrchatData);
    return response.data;
  }

  async unlinkVRChatAccount(userId) {
    const response = await api.delete(`/users/${userId}/vrchat/link`);
    return response.data;
  }

  async getVRChatProfile(vrchatId) {
    const response = await api.get(`/vrchat/users/${vrchatId}`);
    return response.data;
  }

  async getVRChatFriends(vrchatId) {
    const response = await api.get(`/vrchat/users/${vrchatId}/friends`);
    return response.data;
  }

  async syncVRChatData(userId) {
    const response = await api.post(`/users/${userId}/vrchat/sync`);
    return response.data;
  }

  // User preferences
  async getUserPreferences(userId) {
    const response = await api.get(`/users/${userId}/preferences`);
    return response.data;
  }

  async updateUserPreferences(userId, preferences) {
    const response = await api.put(`/users/${userId}/preferences`, preferences);
    return response.data;
  }

  // User roles and permissions
  async updateUserRole(userId, role) {
    const response = await api.put(`/users/${userId}/role`, { role });
    return response.data;
  }

  async getUserPermissions(userId) {
    const response = await api.get(`/users/${userId}/permissions`);
    return response.data;
  }

  // User reports and moderation
  async reportUser(userId, reportData) {
    const response = await api.post(`/users/${userId}/report`, reportData);
    return response.data;
  }

  async getUserReports(userId) {
    const response = await api.get(`/users/${userId}/reports`);
    return response.data;
  }

  async banUser(userId, banData) {
    const response = await api.post(`/users/${userId}/ban`, banData);
    return response.data;
  }

  async unbanUser(userId) {
    const response = await api.delete(`/users/${userId}/ban`);
    return response.data;
  }

  // User deletion and privacy
  async deactivateAccount(userId, reason) {
    const response = await api.put(`/users/${userId}/deactivate`, { reason });
    return response.data;
  }

  async deleteAccount(userId, confirmationData) {
    const response = await api.delete(`/users/${userId}`, { data: confirmationData });
    return response.data;
  }

  async exportUserData(userId) {
    const response = await api.get(`/users/${userId}/export`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const userService = new UserService();