import { useState, useEffect, useCallback } from 'react';
import { Plus, FolderOpen } from 'lucide-react';
import CollectionCard from '../components/collections/CollectionCard';
import CreateCollectionModal from '../components/collections/CreateCollectionModal';
import collectionService from '../services/collectionService';

const CollectionsPage = () => {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, public, private
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest, name, assets
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Carregar coleções
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await collectionService.getMyCollections({
        sortBy,
        limit: 100
      });

      if (response.success) {
        let data = response.data.collections || [];
        
        // Aplicar filtro de visibilidade
        if (filter === 'public') {
          data = data.filter(c => c.visibility === 'PUBLIC');
        } else if (filter === 'private') {
          data = data.filter(c => c.visibility === 'PRIVATE');
        }
        
        setCollections(data);
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
    } finally {
      setLoading(false);
    }
  }, [sortBy, filter]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const handleCreateSuccess = useCallback((newCollection) => {
    setShowCreateModal(false);
    loadCollections();
  }, [loadCollections]);

  const handleEdit = useCallback((collection) => {
    // TODO: Abrir modal de edição
    console.log('Edit collection:', collection);
  }, []);

  const handleDelete = useCallback(async (collection) => {
    if (!confirm(`Tem certeza que deseja deletar "${collection.name}"?`)) {
      return;
    }

    try {
      await collectionService.deleteCollection(collection.id);
      loadCollections();
    } catch (error) {
      console.error('Erro ao deletar coleção:', error);
      alert('Erro ao deletar coleção');
    }
  }, [loadCollections]);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Header com filtros */}
      <div className="sticky top-0 z-10 bg-surface-base px-3 sm:px-4 lg:px-6 py-4 border-b border-white/5"
           style={{ contain: 'layout style' }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">Minhas Coleções</h1>
            <p className="text-sm text-text-tertiary">
              {collections.length} {collections.length === 1 ? 'coleção' : 'coleções'}
            </p>
          </div>
          
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Nova Coleção</span>
          </button>
        </div>

        {/* Filtros e Sort */}
        <div className="flex flex-wrap gap-3">
          {/* Filter tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-theme-active text-white'
                  : 'bg-surface-float hover:bg-surface-float2 text-text-secondary'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'public'
                  ? 'bg-theme-active text-white'
                  : 'bg-surface-float hover:bg-surface-float2 text-text-secondary'
              }`}
            >
              Públicas
            </button>
            <button
              onClick={() => setFilter('private')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filter === 'private'
                  ? 'bg-theme-active text-white'
                  : 'bg-surface-float hover:bg-surface-float2 text-text-secondary'
              }`}
            >
              Privadas
            </button>
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-surface-float hover:bg-surface-float2 border border-white/5 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:border-theme-active/50"
          >
            <option value="newest">Mais Recentes</option>
            <option value="oldest">Mais Antigas</option>
            <option value="name">Nome (A-Z)</option>
            <option value="assets">Mais Itens</option>
          </select>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-6">
        {loading ? (
          // Loading skeleton
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-surface-float rounded-xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-surface-float2" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-surface-float2 rounded w-3/4" />
                  <div className="h-3 bg-surface-float2 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : collections.length > 0 ? (
          // Grid de coleções
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
            {collections.map((collection) => (
              <CollectionCard
                key={collection.id}
                collection={collection}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          // Empty state
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-surface-float rounded-full flex items-center justify-center mb-4">
              <FolderOpen size={32} className="text-text-tertiary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              {filter === 'all' 
                ? 'Nenhuma coleção ainda'
                : filter === 'public'
                ? 'Nenhuma coleção pública'
                : 'Nenhuma coleção privada'}
            </h3>
            <p className="text-text-tertiary mb-6 max-w-md">
              {filter === 'all'
                ? 'Organize seus assets favoritos em coleções personalizadas'
                : 'Altere o filtro para ver outras coleções'}
            </p>
            {filter === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary flex items-center gap-2"
              >
                <Plus size={16} />
                <span>Criar Primeira Coleção</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default CollectionsPage;
