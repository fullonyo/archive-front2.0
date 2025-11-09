import api from '../config/api';

/**
 * Collection Service - Frontend
 * Gerencia coleções de assets do usuário
 */

class CollectionService {
  /**
   * Criar nova coleção
   */
  async createCollection(data) {
    const response = await api.post('/collections', data);
    return response.data;
  }

  /**
   * Listar coleções do usuário
   */
  async getMyCollections(options = {}) {
    const { page = 1, limit = 20, sortBy = 'newest' } = options;
    const response = await api.get('/collections', {
      params: { page, limit, sortBy }
    });
    return response.data;
  }

  /**
   * Buscar coleções (para modal "Save to Collection")
   */
  async searchCollections(query = '', assetId = null) {
    const params = { q: query };
    if (assetId) params.assetId = assetId;
    
    const response = await api.get('/collections/search', { params });
    return response.data;
  }

  /**
   * Obter detalhes de uma coleção
   */
  async getCollectionById(id) {
    const response = await api.get(`/collections/${id}`);
    return response.data;
  }

  /**
   * Atualizar coleção
   */
  async updateCollection(id, data) {
    const response = await api.put(`/collections/${id}`, data);
    return response.data;
  }

  /**
   * Deletar coleção
   */
  async deleteCollection(id) {
    const response = await api.delete(`/collections/${id}`);
    return response.data;
  }

  /**
   * Adicionar asset à coleção
   */
  async addAssetToCollection(collectionId, assetId) {
    const response = await api.post(`/collections/${collectionId}/items`, {
      assetId
    });
    return response.data;
  }

  /**
   * Remover asset da coleção
   */
  async removeAssetFromCollection(collectionId, assetId) {
    const response = await api.delete(`/collections/${collectionId}/items/${assetId}`);
    return response.data;
  }

  /**
   * Reordenar items da coleção
   */
  async reorderCollectionItems(collectionId, items) {
    const response = await api.put(`/collections/${collectionId}/items/reorder`, {
      items
    });
    return response.data;
  }

  /**
   * Verificar em quais coleções o asset está
   */
  async getAssetCollections(assetId) {
    const response = await api.get(`/collections/asset/${assetId}`);
    return response.data;
  }

  /**
   * Adicionar asset a múltiplas coleções de uma vez
   */
  async addAssetToMultipleCollections(assetId, collectionIds) {
    const promises = collectionIds.map(collectionId =>
      this.addAssetToCollection(collectionId, assetId)
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }

  /**
   * Remover asset de múltiplas coleções
   */
  async removeAssetFromMultipleCollections(assetId, collectionIds) {
    const promises = collectionIds.map(collectionId =>
      this.removeAssetFromCollection(collectionId, assetId)
    );
    
    const results = await Promise.allSettled(promises);
    
    return {
      success: results.filter(r => r.status === 'fulfilled').length,
      failed: results.filter(r => r.status === 'rejected').length,
      results
    };
  }
}

export default new CollectionService();
