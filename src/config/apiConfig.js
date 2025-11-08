/**
 * API Configuration Service
 * Centraliza configuração de URLs de API baseado no ambiente
 */

class ApiConfig {
  constructor() {
    // Detectar ambiente automaticamente
    this.isProduction = import.meta.env.PROD;
    this.isDevelopment = import.meta.env.DEV;
    
    // URLs base
    this.productionApiUrl = 'https://api.arcllama.space';
    this.developmentApiUrl = 'http://localhost:3001';
    
    // Permitir override via env var (útil para staging)
    this.apiUrl = import.meta.env.VITE_API_URL || 
                  (this.isProduction ? this.productionApiUrl : this.developmentApiUrl);
  }

  /**
   * Normaliza URLs de assets vindas do backend
   * Substitui URL de produção por URL local se estiver em desenvolvimento
   */
  normalizeAssetUrl(url) {
    if (!url) return null;
    
    // Se estamos em desenvolvimento e a URL aponta para produção, redirecionar para localhost
    if (this.isDevelopment && url.includes(this.productionApiUrl)) {
      return url.replace(this.productionApiUrl, this.developmentApiUrl);
    }
    
    return url;
  }

  /**
   * Normaliza uma imagem (thumbnail) de asset
   * Adiciona fallback para placeholder se necessário
   */
  normalizeImageUrl(imageUrl, placeholderUrl = null) {
    const normalized = this.normalizeAssetUrl(imageUrl);
    return normalized || placeholderUrl;
  }

  /**
   * Constrói URL completa para endpoint da API
   */
  buildApiUrl(endpoint) {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return `${this.apiUrl}${cleanEndpoint}`;
  }

  /**
   * Retorna headers comuns para requisições
   */
  getCommonHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }
}

// Export singleton instance
export const apiConfig = new ApiConfig();

// Export class for testing
export default ApiConfig;
