import { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, Search, Check, Lock, Globe, Loader2 } from 'lucide-react';
import collectionService from '../../services/collectionService';
import CreateCollectionModal from './CreateCollectionModal';

const SaveToCollectionDropdown = ({ isOpen, onClose, assetId, assetTitle, buttonRef }) => {
  const [collections, setCollections] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [savingIds, setSavingIds] = useState(new Set());
  
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Carregar coleções
  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      const response = await collectionService.searchCollections(searchQuery, assetId);
      
      if (response.success) {
        setCollections(response.data.collections || []);
      }
    } catch (error) {
      console.error('Erro ao carregar coleções:', error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, assetId]);

  // Carregar ao abrir
  useEffect(() => {
    if (isOpen) {
      loadCollections();
      // Focus no search após abrir
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery('');
      setCollections([]);
      setShowCreateModal(false); // Reset modal state
    }
  }, [isOpen, loadCollections]);

  // Toggle save/unsave
  const handleToggleCollection = useCallback(async (collection) => {
    try {
      setSavingIds(prev => new Set([...prev, collection.id]));
      
      if (collection.isSelected) {
        await collectionService.removeAssetFromCollection(collection.id, assetId);
      } else {
        await collectionService.addAssetToCollection(collection.id, assetId);
      }
      
      // Atualizar lista
      await loadCollections();
    } catch (error) {
      console.error('Erro ao salvar:', error);
    } finally {
      setSavingIds(prev => {
        const next = new Set(prev);
        next.delete(collection.id);
        return next;
      });
    }
  }, [assetId, loadCollections]);

  // Criar nova coleção
  const handleCreateSuccess = useCallback(async (newCollection) => {
    setShowCreateModal(false);
    
    // Adicionar asset à nova coleção automaticamente
    try {
      await collectionService.addAssetToCollection(newCollection.id, assetId);
      await loadCollections();
    } catch (error) {
      console.error('Erro ao adicionar à nova coleção:', error);
    }
  }, [assetId, loadCollections]);

  // Handler para abrir modal de criação
  const handleOpenCreateModal = useCallback((e) => {
    e.stopPropagation();
    setShowCreateModal(true);
  }, []);

  // Handler para fechar modal de criação
  const handleCloseCreateModal = useCallback(() => {
    setShowCreateModal(false);
  }, []);

  // Click fora fecha dropdown (mas não quando modal está aberto)
  useEffect(() => {
    if (!isOpen || showCreateModal) return; // Não fecha dropdown se modal estiver aberto

    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(e.target) &&
        buttonRef?.current &&
        !buttonRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, showCreateModal, onClose, buttonRef]); // Adiciona showCreateModal como dependência

  // Calcular posição do dropdown
  const [position, setPosition] = useState(null);

  useEffect(() => {
    if (!isOpen || !buttonRef?.current) {
      setPosition(null);
      return;
    }
    
    const updatePosition = () => {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 320; // w-80
      const dropdownHeight = 400; // max estimado
      
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceRight = window.innerWidth - rect.left;
      
      let top, left;
      
      // Calcular top (preferir abrir para baixo)
      if (spaceBelow >= dropdownHeight || spaceBelow > rect.top) {
        top = rect.bottom + 8; // Abre para baixo
      } else {
        top = rect.top - dropdownHeight - 8; // Abre para cima
      }
      
      // Calcular left (garantir que não saia da tela)
      if (spaceRight >= dropdownWidth) {
        left = rect.left; // Alinha com o botão
      } else {
        left = rect.right - dropdownWidth; // Alinha à direita
      }
      
      setPosition({ top, left });
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, buttonRef]);

  if (!isOpen || !position) return null;

  return createPortal(
    <>
      {/* Invisible backdrop to catch clicks */}
      {!showCreateModal && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          onMouseDown={(e) => {
            e.stopPropagation();
            e.preventDefault();
          }}
        />
      )}

      {/* Dropdown */}
      <div
        ref={dropdownRef}
        className="fixed z-50 w-80 bg-surface-float border border-white/10 rounded-xl shadow-2xl"
        style={{
          top: `${position.top}px`,
          left: `${position.left}px`,
          contain: 'layout style paint',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold mb-3">Salvar na pasta</h3>
          
          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Pesquisar pastas"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-surface-float2 border border-white/5 rounded-lg text-sm focus:outline-none focus:border-theme-active/50 transition-colors"
            />
          </div>
        </div>

        {/* Collections List */}
        <div 
          className="max-h-[300px] overflow-y-auto"
          style={{
            WebkitOverflowScrolling: 'touch',
            contain: 'layout style paint',
            willChange: 'scroll-position',
            overscrollBehavior: 'contain',
          }}
        >
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={20} className="animate-spin text-text-tertiary" />
            </div>
          ) : collections.length > 0 ? (
            <div className="py-2">
              {collections.map((collection) => {
                const isSaving = savingIds.has(collection.id);
                
                return (
                  <button
                    key={collection.id}
                    onClick={() => handleToggleCollection(collection)}
                    disabled={isSaving}
                    className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-surface-float2 transition-colors text-left disabled:opacity-50"
                  >
                    {/* Emoji ou ícone de privacidade */}
                    <span className="text-xl flex-shrink-0">
                      {collection.emoji || '📌'}
                    </span>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">
                          {collection.name}
                        </span>
                        {collection.visibility === 'PRIVATE' ? (
                          <Lock size={12} className="text-text-tertiary flex-shrink-0" />
                        ) : (
                          <Globe size={12} className="text-text-tertiary flex-shrink-0" />
                        )}
                      </div>
                      <span className="text-xs text-text-tertiary">
                        {collection.assetCount} {collection.assetCount === 1 ? 'item' : 'itens'}
                      </span>
                    </div>
                    
                    {/* Check ou Loading */}
                    <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin text-theme-active" />
                      ) : collection.isSelected ? (
                        <div className="w-5 h-5 rounded-full bg-theme-active flex items-center justify-center">
                          <Check size={14} className="text-white" strokeWidth={3} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-white/20" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="py-8 px-4 text-center text-text-tertiary text-sm">
              {searchQuery ? 'Nenhuma pasta encontrada' : 'Você ainda não tem pastas'}
            </div>
          )}
        </div>

        {/* Footer - Create New */}
        <div className="p-3 border-t border-white/5">
          <button
            onClick={handleOpenCreateModal}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-theme-active hover:bg-theme-hover rounded-lg text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span>Criar pasta</span>
          </button>
        </div>
      </div>

      {/* Create Collection Modal */}
      <CreateCollectionModal
        isOpen={showCreateModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateSuccess}
      />
    </>,
    document.body
  );
};

export default SaveToCollectionDropdown;
