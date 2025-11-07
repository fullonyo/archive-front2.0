import api from '../config/api';

class ForumService {
  // User forum profile
  async getUserProfile(userId) {
    const response = await api.get(`/forum/users/${userId}/profile`);
    return response.data;
  }

  async updateUserProfile(userId, profileData) {
    const response = await api.put(`/forum/users/${userId}/profile`, profileData);
    return response.data;
  }

  // User posts and activity
  async getUserPosts(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest',
      status: options.status || 'published'
    });
    
    const response = await api.get(`/forum/users/${userId}/posts?${params}`);
    return response.data;
  }

  async getUserReplies(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/forum/users/${userId}/replies?${params}`);
    return response.data;
  }

  // Posts management
  async getPosts(options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest',
      category: options.category || '',
      tags: options.tags || '',
      search: options.search || '',
      featured: options.featured || false
    });
    
    const response = await api.get(`/forum/posts?${params}`);
    return response.data;
  }

  async getPostById(postId) {
    const response = await api.get(`/forum/posts/${postId}`);
    return response.data;
  }

  async createPost(userId, postData) {
    const response = await api.post('/forum/posts', {
      ...postData,
      authorId: userId
    });
    return response.data;
  }

  async updatePost(postId, postData) {
    const response = await api.put(`/forum/posts/${postId}`, postData);
    return response.data;
  }

  async deletePost(postId) {
    const response = await api.delete(`/forum/posts/${postId}`);
    return response.data;
  }

  // Post interactions
  async likePost(postId) {
    const response = await api.post(`/forum/posts/${postId}/like`);
    return response.data;
  }

  async unlikePost(postId) {
    const response = await api.delete(`/forum/posts/${postId}/like`);
    return response.data;
  }

  async bookmarkPost(postId) {
    const response = await api.post(`/forum/posts/${postId}/bookmark`);
    return response.data;
  }

  async unbookmarkPost(postId) {
    const response = await api.delete(`/forum/posts/${postId}/bookmark`);
    return response.data;
  }

  async sharePost(postId, shareData) {
    const response = await api.post(`/forum/posts/${postId}/share`, shareData);
    return response.data;
  }

  // Replies management
  async getPostReplies(postId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'oldest',
      nested: options.nested || true
    });
    
    const response = await api.get(`/forum/posts/${postId}/replies?${params}`);
    return response.data;
  }

  async createReply(postId, replyData) {
    const response = await api.post(`/forum/posts/${postId}/replies`, replyData);
    return response.data;
  }

  async updateReply(replyId, replyData) {
    const response = await api.put(`/forum/replies/${replyId}`, replyData);
    return response.data;
  }

  async deleteReply(replyId) {
    const response = await api.delete(`/forum/replies/${replyId}`);
    return response.data;
  }

  async likeReply(replyId) {
    const response = await api.post(`/forum/replies/${replyId}/like`);
    return response.data;
  }

  async unlikeReply(replyId) {
    const response = await api.delete(`/forum/replies/${replyId}/like`);
    return response.data;
  }

  // Categories and tags
  async getCategories() {
    const response = await api.get('/forum/categories');
    return response.data;
  }

  async getCategoryById(categoryId) {
    const response = await api.get(`/forum/categories/${categoryId}`);
    return response.data;
  }

  async getPopularTags() {
    const response = await api.get('/forum/tags/popular');
    return response.data;
  }

  async getTagSuggestions(query) {
    const response = await api.get(`/forum/tags/suggestions?q=${query}`);
    return response.data;
  }

  // Search and discovery
  async searchPosts(query, filters = {}) {
    const params = new URLSearchParams({
      q: query,
      category: filters.category || '',
      tags: filters.tags || '',
      dateRange: filters.dateRange || '',
      author: filters.author || '',
      sort: filters.sort || 'relevance'
    });
    
    const response = await api.get(`/forum/search?${params}`);
    return response.data;
  }

  async getTrendingPosts(timeRange = '7d') {
    const response = await api.get(`/forum/trending?range=${timeRange}`);
    return response.data;
  }

  async getFeaturedPosts() {
    const response = await api.get('/forum/featured');
    return response.data;
  }

  async getRecommendedPosts(userId) {
    const response = await api.get(`/forum/recommended?userId=${userId}`);
    return response.data;
  }

  // User interactions and social features
  async followUser(userId, targetUserId) {
    const response = await api.post(`/forum/users/${targetUserId}/follow`);
    return response.data;
  }

  async unfollowUser(userId, targetUserId) {
    const response = await api.delete(`/forum/users/${targetUserId}/follow`);
    return response.data;
  }

  async getUserFollowing(userId) {
    const response = await api.get(`/forum/users/${userId}/following`);
    return response.data;
  }

  async getUserFollowers(userId) {
    const response = await api.get(`/forum/users/${userId}/followers`);
    return response.data;
  }

  // User bookmarks and saved content
  async getUserBookmarks(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      sort: options.sort || 'newest'
    });
    
    const response = await api.get(`/forum/users/${userId}/bookmarks?${params}`);
    return response.data;
  }

  // Forum notifications
  async getForumNotifications(userId, options = {}) {
    const params = new URLSearchParams({
      page: options.page || 1,
      limit: options.limit || 20,
      type: options.type || 'all'
    });
    
    const response = await api.get(`/forum/users/${userId}/notifications?${params}`);
    return response.data;
  }

  async markForumNotificationAsRead(notificationId) {
    const response = await api.put(`/forum/notifications/${notificationId}/read`);
    return response.data;
  }

  // Moderation
  async reportPost(postId, reportData) {
    const response = await api.post(`/forum/posts/${postId}/report`, reportData);
    return response.data;
  }

  async reportReply(replyId, reportData) {
    const response = await api.post(`/forum/replies/${replyId}/report`, reportData);
    return response.data;
  }

  async moderatePost(postId, moderationData) {
    const response = await api.post(`/forum/posts/${postId}/moderate`, moderationData);
    return response.data;
  }

  async moderateReply(replyId, moderationData) {
    const response = await api.post(`/forum/replies/${replyId}/moderate`, moderationData);
    return response.data;
  }

  // Forum statistics and leaderboards
  async getForumStats() {
    const response = await api.get('/forum/stats');
    return response.data;
  }

  async getTopContributors(timeRange = '30d', limit = 20) {
    const response = await api.get(`/forum/leaderboard/contributors?range=${timeRange}&limit=${limit}`);
    return response.data;
  }

  async getUserForumRanking(userId) {
    const response = await api.get(`/forum/users/${userId}/ranking`);
    return response.data;
  }

  // Draft management
  async saveDraft(userId, draftData) {
    const response = await api.post(`/forum/users/${userId}/drafts`, draftData);
    return response.data;
  }

  async getUserDrafts(userId) {
    const response = await api.get(`/forum/users/${userId}/drafts`);
    return response.data;
  }

  async getDraft(userId, draftId) {
    const response = await api.get(`/forum/users/${userId}/drafts/${draftId}`);
    return response.data;
  }

  async deleteDraft(userId, draftId) {
    const response = await api.delete(`/forum/users/${userId}/drafts/${draftId}`);
    return response.data;
  }

  // Post versions and history
  async getPostHistory(postId) {
    const response = await api.get(`/forum/posts/${postId}/history`);
    return response.data;
  }

  async getPostVersion(postId, versionId) {
    const response = await api.get(`/forum/posts/${postId}/versions/${versionId}`);
    return response.data;
  }
}

export const forumService = new ForumService();