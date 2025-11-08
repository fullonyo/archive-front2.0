import { createContext, useContext, useState, useCallback } from 'react';
import { userService } from '../services/userService';
import { useAuth } from './AuthContext';

const VRChatContext = createContext();

/**
 * Hook para acessar o contexto de VRChat
 * @throws {Error} Se usado fora do VRChatProvider
 */
export const useVRChat = () => {
  const context = useContext(VRChatContext);
  if (!context) {
    throw new Error('useVRChat must be used within a VRChatProvider');
  }
  return context;
};

/**
 * Provider de VRChat Integration
 * Responsabilidades:
 * - Gerenciar perfil VRChat do usuário
 * - Sincronizar dados VRChat
 * - Gerenciar lista de amigos VRChat
 */
export const VRChatProvider = ({ children }) => {
  const { user } = useAuth();
  
  // VRChat state
  const [vrchatProfile, setVrchatProfile] = useState(null);
  const [vrchatFriends, setVrchatFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Carrega perfil VRChat do usuário
   * @param {string} vrchatId - ID VRChat (opcional, usa do user atual se não fornecido)
   */
  const loadVRChatProfile = useCallback(async (vrchatId = user?.vrchatId) => {
    if (!vrchatId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const [profile, friends] = await Promise.all([
        userService.getVRChatProfile(vrchatId),
        userService.getVRChatFriends(vrchatId)
      ]);
      
      setVrchatProfile(profile);
      setVrchatFriends(friends);
    } catch (err) {
      console.error('Failed to load VRChat profile:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.vrchatId]);

  /**
   * Conecta conta VRChat
   * @param {string} vrchatUsername - Username VRChat
   * @param {string} vrchatPassword - Password VRChat
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const connectVRChat = useCallback(async (vrchatUsername, vrchatPassword) => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const profile = await userService.connectVRChat(user.id, {
        username: vrchatUsername,
        password: vrchatPassword
      });
      
      setVrchatProfile(profile);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  /**
   * Desconecta conta VRChat
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const disconnectVRChat = useCallback(async () => {
    if (!user?.id) {
      return { success: false, error: 'User not authenticated' };
    }
    
    try {
      await userService.disconnectVRChat(user.id);
      
      setVrchatProfile(null);
      setVrchatFriends([]);
      
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  /**
   * Sincroniza dados VRChat (atualiza perfil e amigos)
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const syncVRChatData = useCallback(async () => {
    if (!vrchatProfile?.id) {
      return { success: false, error: 'VRChat not connected' };
    }
    
    try {
      setLoading(true);
      
      const [profile, friends] = await Promise.all([
        userService.syncVRChatProfile(vrchatProfile.id),
        userService.getVRChatFriends(vrchatProfile.id)
      ]);
      
      setVrchatProfile(profile);
      setVrchatFriends(friends);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [vrchatProfile?.id]);

  /**
   * Limpa todos os dados VRChat (útil no logout)
   */
  const clearVRChatData = useCallback(() => {
    setVrchatProfile(null);
    setVrchatFriends([]);
    setError(null);
  }, []);

  // Computed values
  const isVRChatConnected = !!vrchatProfile;
  const friendsCount = vrchatFriends.length;

  const contextValue = {
    // State
    vrchatProfile,
    vrchatFriends,
    loading,
    error,
    isVRChatConnected,
    friendsCount,
    
    // Methods
    loadVRChatProfile,
    connectVRChat,
    disconnectVRChat,
    syncVRChatData,
    clearVRChatData,
  };

  return (
    <VRChatContext.Provider value={contextValue}>
      {children}
    </VRChatContext.Provider>
  );
};
