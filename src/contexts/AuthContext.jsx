import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { userService } from '../services/userService';

const AuthContext = createContext();

/**
 * Hook para acessar o contexto de autenticação
 * @throws {Error} Se usado fora do AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Provider de autenticação
 * Responsabilidades:
 * - Gerenciar sessão do usuário (login/logout/register)
 * - Armazenar dados básicos do usuário
 * - Gerenciar tokens (access + refresh)
 * - Verificar autenticação na inicialização
 */
export const AuthProvider = ({ children }) => {
  // ✅ FIX: Inicialização otimista - previne flash de "não autenticado"
  // Se há token no localStorage, assume autenticado até validar
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('auth_token') // Optimistic initialization
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Inicializa sessão do usuário ao carregar a aplicação
   * Verifica se há token válido e carrega dados do usuário
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('auth_token');
        
        if (token) {
          // Verificar token e carregar dados do usuário
          const userData = await userService.getCurrentProfile();
          
          if (userData) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // Token inválido, limpar
            localStorage.removeItem('auth_token');
            localStorage.removeItem('refresh_token');
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err.message);
        
        // Limpar tokens inválidos
        localStorage.removeItem('auth_token');
        localStorage.removeItem('refresh_token');
        
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Realiza login do usuário
   * @param {string} username - Nome de usuário ou email
   * @param {string} password - Senha
   * @returns {Promise<{success: boolean}>}
   */
  const login = useCallback(async (username, password) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userService.login({ username, password });
      const { data } = response;
      
      if (data && data.token) {
        // Salvar access token (retrocompatibilidade)
        localStorage.setItem('auth_token', data.token);
        
        // Salvar refresh token se disponível
        if (data.tokens?.refreshToken) {
          localStorage.setItem('refresh_token', data.tokens.refreshToken);
        }
        
        setUser(data.user);
        setIsAuthenticated(true);
        setLoading(false);
        
        return { success: true };
      }
      
      throw new Error('Login failed - no token received');
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || err.message || 'Login failed');
      setLoading(false);
      throw err;
    }
  }, []);

  /**
   * Realiza logout do usuário
   * Limpa tokens e estado de autenticação
   */
  const logout = useCallback(() => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  }, []);

  /**
   * Registra novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const register = useCallback(async (userData) => {
    try {
      setLoading(true);
      setError(null);
      
      const { user: newUser, token } = await userService.register(userData);
      
      localStorage.setItem('auth_token', token);
      setUser(newUser);
      setIsAuthenticated(true);
      
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Atualiza perfil do usuário
   * @param {Object} profileData - Dados a serem atualizados
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  const updateProfile = useCallback(async (profileData) => {
    try {
      const updatedUser = await userService.updateProfile(user.id, profileData);
      setUser(updatedUser);
      return { success: true };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user?.id]);

  /**
   * Atualiza dados do usuário (para uso interno de outros contextos)
   * @param {Object|Function} userDataOrUpdater - Novo objeto user ou função updater
   */
  const updateUser = useCallback((userDataOrUpdater) => {
    if (typeof userDataOrUpdater === 'function') {
      setUser(prev => userDataOrUpdater(prev));
    } else {
      setUser(userDataOrUpdater);
    }
  }, []);

  const contextValue = {
    // State
    user,
    isAuthenticated,
    loading,
    error,
    
    // Methods
    login,
    logout,
    register,
    updateProfile,
    updateUser, // Para outros contextos atualizarem dados do user
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
