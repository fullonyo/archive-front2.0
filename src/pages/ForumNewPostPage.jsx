import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Upload, Tag, AlertCircle } from 'lucide-react';
import { useTranslation } from '../hooks/useTranslation';
import Breadcrumb from '../components/common/Breadcrumb';
import ForumEditor from '../components/forum/ForumEditor';

const ForumNewPostPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [category, setCategory] = useState('general');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [errors, setErrors] = useState({});

  // Auto-save draft
  useEffect(() => {
    const draftKey = 'forum-new-post-draft';
    const savedDraft = localStorage.getItem(draftKey);
    
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || '');
        setContent(draft.content || '');
        setSelectedTags(draft.tags || []);
        setCategory(draft.category || 'general');
        setIsDraft(true);
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    }
  }, []);

  // Save draft automatically
  useEffect(() => {
    if (title.trim() || content.trim() || selectedTags.length > 0) {
      const draftKey = 'forum-new-post-draft';
      const draft = {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        category,
        savedAt: new Date().toISOString()
      };
      localStorage.setItem(draftKey, JSON.stringify(draft));
    }
  }, [title, content, selectedTags, category]);

  const categories = [
    { value: 'general', label: 'Geral', description: 'Discussões gerais sobre VRChat' },
    { value: 'support', label: 'Suporte', description: 'Precisa de ajuda com algo?' },
    { value: 'ideas', label: 'Ideias', description: 'Compartilhe suas ideias e sugestões' },
    { value: 'showcase', label: 'Showcase', description: 'Mostre seus projetos e criações' }
  ];

  const popularTags = [
    'Avatar', 'World', 'Shader', 'Unity', 'Blender', 'PhysBones', 'OSC', 'Tutorial',
    'Help', 'Question', 'Bug', 'Feature', 'VRChat+', 'Animation', 'Texture', 'Script'
  ];

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = 'Título é obrigatório';
    } else if (title.trim().length < 10) {
      newErrors.title = 'Título deve ter pelo menos 10 caracteres';
    }
    
    if (!content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    } else if (content.trim().length < 20) {
      newErrors.content = 'Conteúdo deve ter pelo menos 20 caracteres';
    }
    
    if (selectedTags.length === 0) {
      newErrors.tags = 'Selecione pelo menos uma tag';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [title, content, selectedTags]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;
    
    setIsSaving(true);
    try {
      // TODO: Replace with actual API call
      const postData = {
        title: title.trim(),
        content: content.trim(),
        tags: selectedTags,
        category,
        createdAt: new Date().toISOString()
      };
      
      console.log('Creating post:', postData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear draft
      localStorage.removeItem('forum-new-post-draft');
      
      // Navigate to new post (mock ID)
      navigate(`/forum/post/${Date.now()}`);
      
    } catch (error) {
      console.error('Failed to create post:', error);
      // TODO: Show error toast
    } finally {
      setIsSaving(false);
    }
  }, [title, content, selectedTags, category, validateForm, navigate]);

  const handleTagToggle = useCallback((tag) => {
    setSelectedTags(prev => {
      if (prev.includes(tag)) {
        return prev.filter(t => t !== tag);
      } else if (prev.length < 5) {
        return [...prev, tag];
      }
      return prev;
    });
  }, []);

  const clearDraft = useCallback(() => {
    localStorage.removeItem('forum-new-post-draft');
    setTitle('');
    setContent('');
    setSelectedTags([]);
    setCategory('general');
    setIsDraft(false);
    setErrors({});
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto">
      {/* Breadcrumb */}
      <div className="px-3 sm:px-4 lg:px-6 pt-4">
        <Breadcrumb
          items={[
            { label: 'Fórum', path: '/forum/popular' },
            { label: 'Novo Post', path: '/forum/new' }
          ]}
        />
      </div>

      {/* Header */}
      <div className="px-3 sm:px-4 lg:px-6 py-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-surface-float rounded-lg transition-colors"
              aria-label="Voltar"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Criar Novo Post</h1>
              <p className="text-text-secondary text-sm">
                Compartilhe sua pergunta, ideia ou conhecimento com a comunidade
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isDraft && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 text-yellow-400 rounded-lg border border-yellow-500/20">
                <Save size={14} />
                <span className="text-xs font-medium">Rascunho salvo</span>
              </div>
            )}
            
            <button
              onClick={() => setIsPreview(!isPreview)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                isPreview 
                  ? 'bg-theme-active text-white' 
                  : 'bg-surface-float text-text-secondary hover:bg-surface-float2 hover:text-text-primary'
              }`}
            >
              <Eye size={16} />
              {isPreview ? 'Editar' : 'Preview'}
            </button>
            
            <button
              onClick={handleSubmit}
              disabled={isSaving || !title.trim() || !content.trim()}
              className="flex items-center gap-2 px-4 py-1.5 bg-theme-active text-white rounded-lg hover:bg-theme-hover 
                transition-all font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Publicando...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Publicar Post
                </>
              )}
            </button>
          </div>
        </div>

        {isDraft && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-yellow-400">
                <AlertCircle size={16} />
                <span className="text-sm font-medium">
                  Você tem um rascunho salvo automaticamente
                </span>
              </div>
              <button
                onClick={clearDraft}
                className="text-xs text-yellow-400 hover:text-yellow-300 underline"
              >
                Limpar rascunho
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="px-3 sm:px-4 lg:px-6 py-6">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="xl:col-span-2 space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold mb-3">
                Categoria
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`p-4 rounded-lg border text-left transition-all ${
                      category === cat.value
                        ? 'border-theme-active bg-theme-active/10'
                        : 'border-white/5 bg-surface-float hover:border-white/10'
                    }`}
                  >
                    <div className="font-medium text-sm mb-1">{cat.label}</div>
                    <div className="text-xs text-text-secondary">{cat.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Título *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Descreva sua pergunta de forma clara e concisa..."
                className={`w-full h-12 px-4 bg-surface-float border rounded-lg text-sm 
                  focus:outline-none focus:border-theme-active/50 focus:bg-surface-float2 transition-all
                  placeholder:text-text-tertiary ${
                    errors.title ? 'border-red-400' : 'border-white/5'
                  }`}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Conteúdo *
              </label>
              <ForumEditor
                value={content}
                onChange={setContent}
                isPreview={isPreview}
                placeholder="Descreva detalhadamente sua pergunta, problema ou ideia..."
                error={errors.content}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold mb-2">
                Tags * (máximo 5)
              </label>
              <div className="space-y-3">
                {/* Selected Tags */}
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-theme-active/20 text-theme-active 
                          border border-theme-active/40 rounded-lg hover:bg-theme-active/30 transition-colors"
                      >
                        <Tag size={12} />
                        <span className="text-sm font-medium">{tag}</span>
                        <span className="text-xs">×</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Tags */}
                <div className="border border-white/5 rounded-lg p-4 bg-surface-float">
                  <div className="text-xs text-text-tertiary mb-3">Tags populares:</div>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(tag => (
                      <button
                        key={tag}
                        onClick={() => handleTagToggle(tag)}
                        disabled={selectedTags.includes(tag) || selectedTags.length >= 5}
                        className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                          selectedTags.includes(tag)
                            ? 'bg-theme-active/20 text-theme-active border border-theme-active/40 cursor-default'
                            : selectedTags.length >= 5
                            ? 'bg-surface-float2 text-text-tertiary cursor-not-allowed opacity-50'
                            : 'bg-surface-float2 text-text-secondary border border-white/5 hover:border-white/10 hover:text-text-primary'
                        }`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              {errors.tags && (
                <p className="text-red-400 text-xs mt-1">{errors.tags}</p>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Tips */}
            <div className="bg-surface-float border border-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <AlertCircle size={16} />
                Dicas para um bom post
              </h3>
              <ul className="space-y-2 text-xs text-text-secondary">
                <li>• Use um título claro e específico</li>
                <li>• Descreva o problema em detalhes</li>
                <li>• Inclua screenshots se necessário</li>
                <li>• Mencione suas tentativas anteriores</li>
                <li>• Use tags relevantes para ajudar outros usuários</li>
                <li>• Seja respeitoso e construtivo</li>
              </ul>
            </div>

            {/* Markdown Help */}
            <div className="bg-surface-float border border-white/5 rounded-lg p-4">
              <h3 className="font-semibold text-sm mb-3">Formatação Markdown</h3>
              <div className="space-y-1 text-xs text-text-secondary font-mono">
                <div>**negrito**</div>
                <div>*itálico*</div>
                <div>`código`</div>
                <div>[link](url)</div>
                <div>![imagem](url)</div>
              </div>
            </div>

            {/* Preview Box quando em modo preview */}
            {isPreview && (
              <div className="bg-surface-float border border-white/5 rounded-lg p-4">
                <h3 className="font-semibold text-sm mb-3">Preview do Post</h3>
                <div className="text-xs text-text-secondary">
                  O preview está sendo exibido no editor principal ←
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForumNewPostPage;