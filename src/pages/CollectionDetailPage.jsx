import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit2, Trash2, Lock, Globe, MoreVertical } from 'lucide-react';
import AssetCard from '../components/assets/AssetCard';
import collectionService from '../services/collectionService';

const CollectionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [collection, setCollection] = useState(null);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  // Carregar coleção e assets
  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      const response = await collectionService.getCollectionById(id);
      
      if (response.success) {
        const collectionData = response.data;
        setCollection(collectionData);
        setAssets(collectionData.items || []);
      }
    } catch (error) {
      console.error('Erro ao carregar coleção:', error);
      // Redirecionar se não encontrar
      navigate('/collections');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handleEdit = useCallback(() => {
    setShowMenu(false);
    // TODO: Abrir modal de edição
    console.log('Edit collection:', collection);
  }, [collection]);

  const handleDelete = useCallback(async () => {
    setShowMenu(false);
    
    if (!confirm(`Tem certeza que deseja deletar "${collection?.name}"?`)) {
      return;
    }

    try {
      await collectionService.deleteCollection(id);
      navigate('/collections');
    } catch (error) {
      console.error('Erro ao deletar coleção:', error);
      alert('Erro ao deletar coleção');
    }
  }, [id, collection, navigate]);

  const handleRemoveAsset = useCallback(async (assetId) => {
    try {
      await collectionService.removeAssetFromCollection(id, assetId);
      // Recarregar
      loadCollection();
    } catch (error) {
      console.error('Erro ao remover asset:', error);
      alert('Erro ao remover item');
    }
  }, [id, loadCollection]);

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-6 py-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-float rounded w-1/3" />
          <div className="h-32 bg-surface-float rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 bg-surface-float rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!collection) {
    return null;
  }

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="px-3 sm:px-4 lg:px-6 py-6 border-b border-white/5">
        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/collections')}
          className="flex items-center gap-2 text-sm text-text-tertiary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Coleções</span>
        </button>

        {/* Collection Info */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <span className="text-5xl flex-shrink-0">{collection.emoji || '📌'}</span>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold">{collection.name}</h1>
                {collection.visibility === 'PRIVATE' ? (
                  <span className="flex items-center gap-1 px-2 py-1 bg-surface-float rounded-full text-xs border border-white/5">
                    <Lock size={12} />
                    <span>Privada</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-1 bg-surface-float rounded-full text-xs border border-white/5">
                    <Globe size={12} />
                    <span>Pública</span>
                  </span>
                )}
              </div>

              {collection.description && (
                <p className="text-text-secondary mb-3">{collection.description}</p>
              )}

              <div className="text-sm text-text-tertiary">
                {collection.assetCount} {collection.assetCount === 1 ? 'item' : 'itens'}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowMenu(prev => !prev)}
              className="p-2 hover:bg-surface-float rounded-lg transition-colors"
            >
              <MoreVertical size={20} />
            </button>

            {showMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-float border border-white/10 rounded-lg shadow-xl overflow-hidden z-10">
                <button
                  onClick={handleEdit}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface-float2 text-sm text-left transition-colors"
                >
                  <Edit2 size={16} />
                  <span>Editar Coleção</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-red-500/10 text-red-400 text-sm text-left transition-colors"
                >
                  <Trash2 size={16} />
                  <span>Deletar Coleção</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="px-3 sm:px-4 lg:px-6 py-6">
        {assets.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {assets.map((item) => (
              <div key={item.asset.id} className="relative">
                <AssetCard asset={item.asset} />
                
                {/* Remove button overlay */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveAsset(item.asset.id);
                  }}
                  className="absolute top-2 right-2 z-20 p-1.5 bg-red-500/90 hover:bg-red-500 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Remover da coleção"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface-float rounded-full flex items-center justify-center mb-4">
              <span className="text-4xl">{collection.emoji || '📌'}</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Coleção vazia</h3>
            <p className="text-text-tertiary mb-6 max-w-md">
              Adicione assets à esta coleção clicando no botão "Salvar" em qualquer asset
            </p>
            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Explorar Assets
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectionDetailPage;
