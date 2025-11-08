import api from '../config/api';

/**
 * Register Service - Gerenciamento de cadastro de novos usuários
 * Sistema com confirmação por email (token de 24h)
 */
const registerService = {
  /**
   * Check if email is available for registration
   * @param {string} email - Email to check
   * @returns {Promise} API response with availability status
   */
  checkEmailAvailability: async (email) => {
    try {
      const response = await api.get(`/register/check-email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Check email error:', error);
      throw error;
    }
  },

  /**
   * Create pending registration (sends confirmation email)
   * @param {Object} data - Registration data
   * @param {string} data.nickname - User nickname (will be username)
   * @param {string} data.email - User email
   * @param {string} data.discord - Discord username (optional)
   * @param {string} data.password - User password
   * @returns {Promise} API response
   */
  register: async (data) => {
    try {
      const response = await api.post('/register', {
        nickname: data.username, // Mapear username para nickname
        email: data.email,
        discord: data.discord || null,
        password: data.password
      });
      return response.data;
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  },

  /**
   * Confirm email with token (creates final user account)
   * @param {string} token - Confirmation token from email link
   * @returns {Promise} API response with created user
   */
  confirmEmail: async (token) => {
    try {
      const response = await api.get(`/register/confirm/${token}`);
      return response.data;
    } catch (error) {
      console.error('Confirm email error:', error);
      throw error;
    }
  },

  /**
   * Resend confirmation email
   * @param {string} email - Email to resend confirmation
   * @returns {Promise} API response
   */
  resendConfirmation: async (email) => {
    try {
      const response = await api.post('/register/resend', { email });
      return response.data;
    } catch (error) {
      console.error('Resend confirmation error:', error);
      throw error;
    }
  },

  /**
   * Check registration status
   * @param {string} email - Email to check status
   * @returns {Promise} API response with registration status
   */
  checkStatus: async (email) => {
    try {
      const response = await api.get(`/register/status/${email}`);
      return response.data;
    } catch (error) {
      console.error('Check status error:', error);
      throw error;
    }
  }
};

export default registerService;
