import { createContext, useContext, useState, useCallback } from 'react';
import { forumService } from '../services/forumService';
import { useAuth } from './AuthContext';

const ForumContext = createContext();

/**
 * Hook para acessar o contexto do fórum
 * @throws {Error} Se usado fora do ForumProvider
 */
export const useForum = () => {
  const context = useContext(ForumContext);
  if (!context) {
    throw new Error('useForum must be used within a ForumProvider');
  }
  return context;
};

/**
 * Provider de Forum
 * Responsabilidades:
 * - Gerenciar perfil do fórum do usuário
 * - Gerenciar posts e respostas
 * - Calcular reputação e badges
 */
export const ForumProvider = ({ children }) => {
  const { user } = useAuth();
  
  // Forum state
  const [forumProfile, setForumProfile] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [userReplies, setUserReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega perfil do fórum do usuário
   * @param {string} userId - ID do usuário (opcional, usa user atual se não fornecido)
   */
  const loadForumProfile = useCallback(async (userId = user?.id) => {
    if (!userId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [profile, posts, replies] = await Promise.all([
        forumService.getUserProfile(userId),
        forumService.getUserPosts(userId),
        forumService.getUserReplies(userId)
      ]);
      
      setForumProfile(profile);
      setUserPosts(posts);
      setUserReplies(replies);
    } catch (err) {
      console.error('Failed to load forum profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Cria novo post no fórum
   * @param {Object} postData - Dados do post
   * @returns {Promise<{success: boolean, post?: Object, error?: string}>}
   */
  const createForumPost = useCallback(async (postData) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const newPost = await forumService.createPost(user.id, postData);
      setUserPosts(prev => [newPost, ...prev]);
      
      // Atualizar stats do perfil do fórum
      if (forumProfile) {
        setForumProfile(prev => ({
          ...prev,
          postsCount: prev.postsCount + 1,
          reputation: prev.reputation + 5 // Pontos base por novo post
        }));
      }
      
      return { success: true, post: newPost };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id, forumProfile]);

  /**
   * Cria resposta a um post
   * @param {string} postId - ID do post
   * @param {Object} replyData - Dados da resposta
   * @returns {Promise<{success: boolean, reply?: Object, error?: string}>}
   */
  const createReply = useCallback(async (postId, replyData) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      const newReply = await forumService.createReply(postId, user.id, replyData);
      setUserReplies(prev => [newReply, ...prev]);
      
      // Atualizar stats do perfil do fórum
      if (forumProfile) {
        setForumProfile(prev => ({
          ...prev,
          repliesCount: prev.repliesCount + 1,
          reputation: prev.reputation + 2 // Pontos por resposta
        }));
      }
      
      return { success: true, reply: newReply };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id, forumProfile]);

  /**
   * Atualiza reputação do usuário
   * @param {number} points - Pontos a adicionar/remover
   */
  const updateReputation = useCallback((points) => {
    if (forumProfile) {
      setForumProfile(prev => ({
        ...prev,
        reputation: Math.max(0, prev.reputation + points)
      }));
    }
  }, [forumProfile]);

  /**
   * Limpa todos os dados do fórum (útil no logout)
   */
  const clearForumData = useCallback(() => {
    setForumProfile(null);
    setUserPosts([]);
    setUserReplies([]);
    setError(null);
  }, []);

  // Computed stats
  const forumStats = {
    postsCount: userPosts.length,
    repliesCount: userReplies.length,
    reputation: forumProfile?.reputation || 0,
    level: forumProfile?.level || 1,
    badges: forumProfile?.badges || [],
  };

  const contextValue = {
    // State
    forumProfile,
    userPosts,
    userReplies,
    loading,
    error,
    forumStats,
    
    // Methods
    loadForumProfile,
    createForumPost,
    createReply,
    updateReputation,
    clearForumData,
  };

  return (
    <ForumContext.Provider value={contextValue}>
      {children}
    </ForumContext.Provider>
  );
};
