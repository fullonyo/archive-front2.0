import { useState, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';

export const useForumProfile = () => {
  const { 
    forumProfile,
    userPosts,
    userReplies,
    createForumPost: contextCreatePost,
    loadForumProfile: contextLoadProfile
  } = useUser();
  
  const [forumLoading, setForumLoading] = useState(false);
  const [forumError, setForumError] = useState(null);

  const createPost = useCallback(async (postData) => {
    setForumLoading(true);
    setForumError(null);
    
    try {
      const result = await contextCreatePost(postData);
      
      if (result.success) {
        return { success: true, post: result.post };
      } else {
        setForumError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to create post';
      setForumError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setForumLoading(false);
    }
  }, [contextCreatePost]);

  const refreshProfile = useCallback(async () => {
    setForumLoading(true);
    setForumError(null);
    
    try {
      await contextLoadProfile();
      return { success: true };
    } catch (err) {
      const errorMessage = err.message || 'Failed to refresh forum profile';
      setForumError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setForumLoading(false);
    }
  }, [contextLoadProfile]);

  const getPostsByCategory = useCallback((category) => {
    return userPosts.filter(post => 
      post.category.toLowerCase() === category.toLowerCase()
    );
  }, [userPosts]);

  const getRecentPosts = useCallback((days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return userPosts.filter(post => 
      new Date(post.createdAt) > cutoff
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [userPosts]);

  const getPopularPosts = useCallback(() => {
    return [...userPosts].sort((a, b) => {
      const aScore = (a.likes || 0) + (a.replies || 0) + (a.views || 0) * 0.1;
      const bScore = (b.likes || 0) + (b.replies || 0) + (b.views || 0) * 0.1;
      return bScore - aScore;
    });
  }, [userPosts]);

  const getRecentReplies = useCallback((days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return userReplies.filter(reply => 
      new Date(reply.createdAt) > cutoff
    ).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [userReplies]);

  const getForumStats = useCallback(() => {
    const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes || 0), 0);
    const totalReplies = userPosts.reduce((sum, post) => sum + (post.repliesCount || 0), 0);
    const totalViews = userPosts.reduce((sum, post) => sum + (post.views || 0), 0);
    
    const categories = {};
    userPosts.forEach(post => {
      categories[post.category] = (categories[post.category] || 0) + 1;
    });
    
    const replyLikes = userReplies.reduce((sum, reply) => sum + (reply.likes || 0), 0);
    
    return {
      postsCount: userPosts.length,
      repliesCount: userReplies.length,
      totalLikes,
      totalReplies,
      totalViews,
      replyLikes,
      reputation: forumProfile?.reputation || 0,
      level: forumProfile?.level || 1,
      badges: forumProfile?.badges || [],
      categoriesDistribution: categories,
      averageLikesPerPost: userPosts.length > 0 ? (totalLikes / userPosts.length).toFixed(1) : 0,
      averageRepliesPerPost: userPosts.length > 0 ? (totalReplies / userPosts.length).toFixed(1) : 0
    };
  }, [userPosts, userReplies, forumProfile]);

  const searchUserContent = useCallback((query) => {
    const searchTerm = query.toLowerCase();
    
    const matchingPosts = userPosts.filter(post => 
      post.title.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.category.toLowerCase().includes(searchTerm) ||
      (post.tags && post.tags.some(tag => 
        tag.toLowerCase().includes(searchTerm)
      ))
    );
    
    const matchingReplies = userReplies.filter(reply => 
      reply.content.toLowerCase().includes(searchTerm)
    );
    
    return {
      posts: matchingPosts,
      replies: matchingReplies,
      total: matchingPosts.length + matchingReplies.length
    };
  }, [userPosts, userReplies]);

  const getActivityTimeline = useCallback((days = 30) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    const activities = [];
    
    // Add posts
    userPosts.forEach(post => {
      if (new Date(post.createdAt) > cutoff) {
        activities.push({
          type: 'post',
          id: post.id,
          title: post.title,
          date: post.createdAt,
          likes: post.likes,
          replies: post.repliesCount
        });
      }
    });
    
    // Add replies
    userReplies.forEach(reply => {
      if (new Date(reply.createdAt) > cutoff) {
        activities.push({
          type: 'reply',
          id: reply.id,
          postTitle: reply.postTitle,
          date: reply.createdAt,
          likes: reply.likes
        });
      }
    });
    
    // Sort by date (newest first)
    return activities.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [userPosts, userReplies]);

  const getLevelProgress = useCallback(() => {
    if (!forumProfile) return { level: 1, progress: 0, nextLevelAt: 100 };
    
    const currentLevel = forumProfile.level || 1;
    const currentReputation = forumProfile.reputation || 0;
    
    // Level thresholds (can be customized)
    const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000];
    
    const currentLevelThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextLevelThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
    
    const progress = Math.min(
      ((currentReputation - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100,
      100
    );
    
    return {
      level: currentLevel,
      progress: Math.round(progress),
      currentReputation,
      nextLevelAt: nextLevelThreshold,
      reputationToNext: Math.max(0, nextLevelThreshold - currentReputation)
    };
  }, [forumProfile]);

  const clearError = useCallback(() => {
    setForumError(null);
  }, []);

  return {
    // State
    forumProfile,
    userPosts,
    userReplies,
    loading: forumLoading,
    error: forumError,
    
    // Actions
    createPost,
    refreshProfile,
    
    // Filtering and search
    getPostsByCategory,
    getRecentPosts,
    getPopularPosts,
    getRecentReplies,
    searchUserContent,
    
    // Analytics
    getForumStats,
    getActivityTimeline,
    getLevelProgress,
    
    // Error handling
    clearError
  };
};