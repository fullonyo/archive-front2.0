import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { useCache } from '../../contexts';
import { userService } from '../../services/userService';
import { useCachedQuery } from '../../hooks/useCachedQuery';
import { CACHE_KEYS, CACHE_TTL, CACHE_PATTERNS } from '../../config/cache';
import toast from 'react-hot-toast';
import AssetDetailModal from '../../components/assets/AssetDetailModal';
import AssetCard from '../../components/assets/AssetCard';
import FollowButton from '../../components/user/FollowButton';
import { handleImageError } from '../../utils/imageUtils';
import {
  User,
  Calendar,
  MapPin,
  Link as LinkIcon,
  Edit,
  Settings,
  Trophy,
  Star,
  MessageSquare,
  Download,
  Heart,
  Eye,
  Upload,
  TrendingUp,
  Award,
  Target,
  Zap,
  Clock,
  CheckCircle,
  Users,
  UserPlus,
  BookmarkIcon,
  MoreHorizontal,
  Share2,
  Flag,
  ExternalLink,
  Github,
  Twitter,
  MessageCircle,
  ChevronRight,
  Activity,
  BarChart3,
  Save,
  X,
  Camera,
  ImagePlus
} from 'lucide-react';

const ProfilePage = () => {
  const { t } = useTranslation();
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated, updateUser } = useAuth();
  const { invalidate } = useCache();
  
  // Estados de dados
  const [profileUser, setProfileUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados de UI
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('recent');
  const [isEditing, setIsEditing] = useState(false);
  
  // Estados de upload específicos
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [bannerUploading, setBannerUploading] = useState(false);
  const uploadingRef = useRef(false);
  
  // Form states para edição
  const [formData, setFormData] = useState({
    username: '',
    bio: '',
    country: '',
    city: '',
    socialLinks: {
      twitter: '',
      discord: '',
      vrchat: '',
      website: ''
    }
  });

  // Determinar se é perfil próprio
  const isOwnProfile = useMemo(() => {
    if (!isAuthenticated || !currentUser || !profileUser) return false;
    return currentUser.id === profileUser.id;
  }, [isAuthenticated, currentUser, profileUser]);

  // Cache key baseado no username ou current user
  const profileCacheKey = useMemo(() => {
    if (!username && isAuthenticated && currentUser) {
      return CACHE_KEYS.userProfile(currentUser.username);
    } else if (username) {
      return CACHE_KEYS.userProfile(username);
    }
    return null;
  }, [username, isAuthenticated, currentUser]);

  // Fetch function para cache
  const fetchProfile = useCallback(async () => {
    if (!username && isAuthenticated) {
      return await userService.getCurrentProfile();
    } else if (username) {
      return await userService.getProfileByUsername(username);
    } else {
      navigate('/login');
      return null;
    }
  }, [username, isAuthenticated, navigate]);

  // Usar cache para profile data
  const { 
    data: profileData, 
    loading: profileLoading, 
    error: profileError,
    refetch: refetchProfile,
    isCached
  } = useCachedQuery(
    profileCacheKey,
    fetchProfile,
    { 
      ttl: CACHE_TTL.USER_PROFILE,
      enabled: profileCacheKey !== null // Só executa se tiver cache key
    }
  );

  // Processar dados do profile quando carregados
  useEffect(() => {
    if (profileData && profileData !== null) {
      setProfileUser(profileData);
      setLoading(false);
      
      // Inicializar form data com dados do usuário
      setFormData({
        username: profileData.username || '',
        bio: profileData.bio || '',
        country: profileData.country || '',
        city: profileData.city || '',
        socialLinks: {
          twitter: profileData.socialLinks?.twitter || '',
          discord: profileData.socialLinks?.discord || '',
          vrchat: profileData.socialLinks?.vrchat || '',
          website: profileData.socialLinks?.website || ''
        }
      });
    }
  }, [profileData]);

  // Processar erros
  useEffect(() => {
    if (profileError) {
      setError(profileError.message || 'Failed to load profile');
      setLoading(false);
    }
  }, [profileError]);

  // Handler para alterações no form
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setFormData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  // Salvar alterações
  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Preparar dados para envio
      const updateData = {
        username: formData.username,
        bio: formData.bio,
        country: formData.country,
        city: formData.city,
        socialLinks: formData.socialLinks
      };
      
      const updatedUser = await userService.updateProfile(updateData);
      setProfileUser(updatedUser);
      setIsEditing(false);
      
      // Invalidar cache do perfil
      if (profileUser?.username) {
        invalidate(CACHE_PATTERNS.USER_PROFILE(profileUser.username));
      }
      
      // Refetch para atualizar com dados do servidor
      refetchProfile();
      
      // TODO: Mostrar notificação de sucesso
    } catch (err) {
      console.error('Error saving profile:', err);
      setError(err.message || 'Failed to save profile');
      // TODO: Mostrar notificação de erro
    } finally {
      setLoading(false);
    }
  };

  // Cancelar edição
  const handleCancel = () => {
    // Resetar para dados originais
    if (profileUser) {
      setFormData({
        username: profileUser.username || '',
        bio: profileUser.bio || '',
        country: profileUser.country || '',
        city: profileUser.city || '',
        socialLinks: {
          twitter: profileUser.socialLinks?.twitter || '',
          discord: profileUser.socialLinks?.discord || '',
          vrchat: profileUser.socialLinks?.vrchat || '',
          website: profileUser.socialLinks?.website || ''
        }
      });
    }
    setIsEditing(false);
  };

  // Upload de avatar
  const handleAvatarUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevenir uploads simultâneos
    if (uploadingRef.current) {
      toast('Aguarde o upload anterior completar', { icon: '⚠️' });
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 5MB');
      return;
    }

    // Salvar URL anterior ANTES de qualquer atualização
    const previousAvatarUrl = profileUser?.avatarUrl;
    
    uploadingRef.current = true;

    try {
      // OTIMISTIC UPDATE: Preview imediato
      const previewUrl = URL.createObjectURL(file);
      
      setProfileUser(prev => ({ ...prev, avatarUrl: previewUrl }));
      
      if (isOwnProfile) {
        updateUser(prev => ({ ...prev, avatarUrl: previewUrl }));
      }
      
      // Loading específico
      setAvatarUploading(true);
      toast.loading('Fazendo upload da foto...', { id: 'avatar-upload' });
      
      // Upload real
      const result = await userService.uploadAvatar(file);
      const newAvatarUrl = result.avatar_url;
      
      // Atualizar com URL real
      setProfileUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      
      // CRÍTICO: Atualizar AuthContext (sincroniza header)
      if (isOwnProfile) {
        updateUser(prev => ({ ...prev, avatarUrl: newAvatarUrl }));
      }
      
      // Invalidar cache
      if (profileUser?.username) {
        invalidate(CACHE_PATTERNS.USER_PROFILE(profileUser.username));
        invalidate(/^assets_list_/); // Pode ter foto do autor
      }
      
      // Feedback de sucesso
      toast.success('Foto de perfil atualizada!', { id: 'avatar-upload' });
      
      // Cleanup preview
      URL.revokeObjectURL(previewUrl);
      
    } catch (err) {
      console.error('Error uploading avatar:', err);
      
      // Reverter em caso de erro
      if (previousAvatarUrl) {
        setProfileUser(prev => ({ ...prev, avatarUrl: previousAvatarUrl }));
        if (isOwnProfile) {
          updateUser(prev => ({ ...prev, avatarUrl: previousAvatarUrl }));
        }
      }
      
      toast.error('Falha ao atualizar foto. Tente novamente.', { id: 'avatar-upload' });
    } finally {
      setAvatarUploading(false);
      uploadingRef.current = false;
    }
  }, [profileUser, isOwnProfile, updateUser, invalidate]);

  // Upload de banner
  const handleBannerUpload = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Prevenir uploads simultâneos
    if (uploadingRef.current) {
      toast('Aguarde o upload anterior completar', { icon: '⚠️' });
      return;
    }

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor, selecione uma imagem válida');
      return;
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('A imagem deve ter no máximo 10MB');
      return;
    }

    // Salvar URL anterior ANTES de qualquer atualização
    const previousBannerUrl = profileUser?.bannerUrl;
    
    uploadingRef.current = true;

    try {
      // OTIMISTIC UPDATE: Preview imediato
      const previewUrl = URL.createObjectURL(file);
      
      
      setProfileUser(prev => ({ ...prev, bannerUrl: previewUrl }));
      
      if (isOwnProfile) {
        updateUser(prev => ({ ...prev, bannerUrl: previewUrl }));
      }
      
      // Loading específico
      setBannerUploading(true);
      toast.loading('Fazendo upload do banner...', { id: 'banner-upload' });
      
      // Upload real
      const result = await userService.uploadBanner(file);
      const newBannerUrl = result.banner_url;
      
      // Atualizar com URL real
      setProfileUser(prev => ({ ...prev, bannerUrl: newBannerUrl }));
      
      // CRÍTICO: Atualizar AuthContext (sincroniza header)
      if (isOwnProfile) {
        updateUser(prev => ({ ...prev, bannerUrl: newBannerUrl }));
      }
      
      // Invalidar cache
      if (profileUser?.username) {
        invalidate(CACHE_PATTERNS.USER_PROFILE(profileUser.username));
      }
      
      // Feedback de sucesso
      toast.success('Banner atualizado!', { id: 'banner-upload' });
      
      // Cleanup preview
      URL.revokeObjectURL(previewUrl);
      
    } catch (err) {
      console.error('Error uploading banner:', err);
      
      // Reverter em caso de erro
      if (previousBannerUrl) {
        setProfileUser(prev => ({ ...prev, bannerUrl: previousBannerUrl }));
        if (isOwnProfile) {
          updateUser(prev => ({ ...prev, bannerUrl: previousBannerUrl }));
        }
      }
      
      toast.error('Falha ao atualizar banner. Tente novamente.', { id: 'banner-upload' });
    } finally {
      setBannerUploading(false);
      uploadingRef.current = false;
    }
  }, [profileUser, isOwnProfile, updateUser, invalidate]);

  // Estados para assets do usuário
  const [userAssets, setUserAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(false);
  const [assetsPage, setAssetsPage] = useState(1);
  const [hasMoreAssets, setHasMoreAssets] = useState(true);

  // TODO: Implement posts and activities loading from real API endpoints
  const mockPosts = []; // Placeholder - will be replaced with real posts data
  const mockActivities = []; // Placeholder - will be replaced with real activities data


  // Carregar assets do usuário
  useEffect(() => {
    const loadUserAssets = async () => {
      if (!profileUser?.id) return;
      
      try {
        setAssetsLoading(true);
        const result = await userService.getUserAssets(profileUser.id, {
          page: assetsPage,
          limit: 20,
          includeUnapproved: isOwnProfile,
          includeInactive: isOwnProfile
        });
        
        // Transform backend data to frontend format
        // Maps: thumbnailUrl→thumbnail, user→author, _count→likes/downloads/comments
        const backendAssets = result.data?.assets || result.assets || [];
        const transformedAssets = backendAssets.map(asset => ({
          ...asset,
          thumbnail: asset.thumbnailUrl || 
                    (Array.isArray(asset.imageUrls) && asset.imageUrls.length > 0 ? asset.imageUrls[0] : null),
          category: asset.category?.name || asset.category || 'Unknown',
          author: asset.user || asset.author || {
            id: asset.userId,
            username: 'Unknown',
            avatarUrl: null
          },
          likes: asset._count?.favorites || asset.favoritesCount || 0,
          downloads: asset._count?.downloads || asset.downloadCount || 0,
          comments: asset._count?.reviews || asset.reviewsCount || 0
        }));
        
        if (assetsPage === 1) {
          setUserAssets(transformedAssets);
        } else {
          setUserAssets(prev => [...prev, ...transformedAssets]);
        }
        
        const pagination = result.data?.pagination || result.pagination;
        setHasMoreAssets(pagination?.page < pagination?.pages);
      } catch (err) {
        console.error('Error loading user assets:', err);
      } finally {
        setAssetsLoading(false);
      }
    };

    if (activeTab === 'avatars') {
      loadUserAssets();
    }
  }, [profileUser?.id, assetsPage, isOwnProfile, activeTab]);

  // Cálculo de nível e progresso
  const levelProgress = useMemo(() => {
    if (!profileUser?.stats) return { level: 1, progress: 0, currentRep: 0, nextThreshold: 100, repToNext: 100 };
    
    const currentLevel = profileUser.stats.level || 1;
    const currentRep = profileUser.stats.reputation || 0;
    const levelThresholds = [0, 100, 250, 500, 1000, 2000, 4000, 8000, 15000, 30000, 50000, 75000, 100000];
    
    const currentThreshold = levelThresholds[currentLevel - 1] || 0;
    const nextThreshold = levelThresholds[currentLevel] || levelThresholds[levelThresholds.length - 1];
    const progress = Math.min(((currentRep - currentThreshold) / (nextThreshold - currentThreshold)) * 100, 100);
    
    return {
      level: currentLevel,
      progress: Math.round(progress),
      currentRep,
      nextThreshold,
      repToNext: Math.max(0, nextThreshold - currentRep)
    };
  }, [profileUser?.stats]);

  // Estatísticas calculadas
  const stats = useMemo(() => {
    const uploads = profileUser?.stats?.totalUploads || 0;
    const reviews = profileUser?.stats?.totalReviews || 0;
    const totalEngagement = (uploads * 10) + (reviews * 5);
    
    // Calculate success rate based on approved vs total uploads
    const approved = profileUser?.stats?.approvedUploads || 0;
    const successRate = uploads > 0 ? Math.round((approved / uploads) * 100) : 0;
    
    return {
      totalEngagement,
      averageRating: profileUser?.stats?.averageRating || 0,
      successRate,
      responseTime: '< 2h' // TODO: Calculate from real response data
    };
  }, [profileUser?.stats]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'avatars', label: 'Avatares', icon: User, count: profileUser?.stats?.totalUploads },
    { id: 'achievements', label: 'Conquistas', icon: Trophy }
  ];

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-theme-primary mb-4"></div>
          <p className="text-text-secondary">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              refetchProfile();
            }}
            className="px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // No user data
  if (!profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-text-secondary">Perfil não encontrado</p>
      </div>
    );
  }

  return (
    <div className="pb-6">
      {/* Banner/Cover - Estilo Redes Sociais (Twitter/LinkedIn) */}
      <div className="relative bg-gradient-to-br from-theme-primary via-theme-secondary to-theme-accent h-48 sm:h-56 md:h-64 overflow-hidden">
        {/* Imagem do banner (se existir) */}
        {profileUser?.bannerUrl && (
          <img 
            src={profileUser.bannerUrl}
            alt="Banner do perfil"
            className="absolute inset-0 w-full h-full object-cover"
            onError={handleImageError('banner')}
          />
        )}
        
        {/* Padrão de fundo (fallback ou overlay) */}
        {!profileUser?.bannerUrl && (
          <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        )}
        
        {/* Overlay de edição do banner - Só aparece quando editando */}
        {isEditing && isOwnProfile && (
          <>
            <input 
              type="file"
              id="banner-upload"
              accept="image/*"
              className="hidden"
              onChange={handleBannerUpload}
            />
            <label 
              htmlFor="banner-upload"
              className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-colors cursor-pointer group flex items-center justify-center"
            >
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 px-4 py-2 bg-black/70 backdrop-blur-sm text-white rounded-lg">
                <ImagePlus className="w-5 h-5" />
                <span className="text-sm font-medium">Alterar Banner</span>
              </div>
            </label>
          </>
        )}
      </div>

      {/* Profile Content com fundo sólido */}
      <div className="bg-surface-base">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          {/* Avatar sobrepondo o banner */}
          <div className="relative -mt-16 sm:-mt-20 mb-4">
            <input 
              type="file"
              id="avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarUpload}
            />
            <label 
              htmlFor={isEditing && isOwnProfile ? "avatar-upload" : undefined}
              className={`inline-block relative ${isEditing && isOwnProfile ? 'cursor-pointer group' : ''}`}
            >
            {/* Avatar redondo com borda */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 lg:w-40 lg:h-40 rounded-full border-4 border-surface-base bg-gradient-to-br from-theme-primary to-theme-accent p-1 shadow-2xl">
              <div className="w-full h-full rounded-full bg-surface-float flex items-center justify-center overflow-hidden relative">
                {profileUser?.avatarUrl ? (
                  <img 
                    src={profileUser.avatarUrl} 
                    alt={profileUser.username}
                    className="w-full h-full object-cover"
                    onError={handleImageError('avatar')}
                  />
                ) : (
                  <span className="text-4xl sm:text-5xl font-bold text-text-primary">
                    {profileUser?.username?.[0]?.toUpperCase() || 'U'}
                  </span>
                )}
                
                {/* Overlay de edição do avatar */}
                {isEditing && isOwnProfile && (
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>
            
            {/* Status online */}
            {!isEditing && (
              <div className="absolute bottom-2 right-2 w-7 h-7 bg-green-500 border-4 border-surface-base rounded-full shadow-lg" />
            )}
            
            {/* Badge de verificado */}
            {profileUser?.isVerified && (
              <div className="absolute top-0 right-0 w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center shadow-lg border-4 border-surface-base">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
            )}
          </label>
        </div>

        {/* Profile Info */}
        <div className="space-y-4 pb-4 border-b border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex-1 min-w-0">
              {/* MODO VISUALIZAÇÃO */}
              {!isEditing ? (
                <>
                  {/* Nome e badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
                      {profileUser?.username}
                    </h1>
                    
                    {profileUser.stats?.isVerified && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                        <Star className="w-4 h-4" />
                        Verificado
                      </div>
                    )}
                    
                    {profileUser.stats?.isAdmin && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        Admin
                      </div>
                    )}
                    
                    {profileUser.stats?.isModerator && !profileUser.stats?.isAdmin && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        Moderador
                      </div>
                    )}
                  </div>

                  <p className="text-text-secondary mb-4">@{profileUser?.username}</p>

                  {/* Bio */}
                  {profileUser?.bio && (
                    <p className="text-sm sm:text-base text-text-primary max-w-3xl mb-3 sm:mb-4 leading-relaxed">
                      {profileUser.bio}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-tertiary mb-4 sm:mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Membro desde</span>
                      <span className="sm:hidden">Desde</span>
                      {' '}{new Date(profileUser?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </div>
                    
                    {(profileUser?.city || profileUser?.country) && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {[profileUser?.city, profileUser?.country].filter(Boolean).join(', ')}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {stats.responseTime} tempo de resposta
                    </div>
                  </div>
                </>
              ) : (
                /* MODO EDIÇÃO */
                <div className="space-y-4">
                  {/* Display Name */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Nome de Exibição
                    </label>
                    <input
                      type="text"
                      value={formData.displayName}
                      onChange={(e) => handleInputChange('displayName', e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                      placeholder="Seu nome de exibição"
                    />
                  </div>

                  {/* Username (não editável) */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Username (não editável)
                    </label>
                    <input
                      type="text"
                      value={profileUser?.username}
                      disabled
                      className="w-full px-4 py-2.5 bg-surface-base border border-white/5 rounded-lg text-text-tertiary cursor-not-allowed opacity-60"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Biografia
                      <span className="text-text-tertiary ml-2 text-xs">
                        {formData.bio.length}/500
                      </span>
                    </label>
                    <textarea
                      value={formData.bio}
                      onChange={(e) => {
                        if (e.target.value.length <= 500) {
                          handleInputChange('bio', e.target.value);
                        }
                      }}
                      rows={4}
                      className="w-full px-4 py-2.5 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all resize-none"
                      placeholder="Conte um pouco sobre você..."
                    />
                  </div>

                  {/* Localização */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      <MapPin className="w-4 h-4 inline mr-1" />
                      Localização
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      className="w-full px-4 py-2.5 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                      placeholder="Cidade, País"
                    />
                  </div>

                  {/* Links Sociais */}
                  <div className="pt-4 border-t border-white/5">
                    <h3 className="text-sm font-medium text-text-secondary mb-3">
                      Links Sociais
                    </h3>
                    
                    <div className="space-y-3">
                      {/* Twitter */}
                      <div className="flex items-center gap-3">
                        <Twitter className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                        <input
                          type="text"
                          value={formData.socialLinks.twitter}
                          onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                          placeholder="@username"
                        />
                      </div>

                      {/* Discord */}
                      <div className="flex items-center gap-3">
                        <MessageCircle className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                        <input
                          type="text"
                          value={formData.socialLinks.discord}
                          onChange={(e) => handleSocialLinkChange('discord', e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                          placeholder="username#0000"
                        />
                      </div>

                      {/* VRChat */}
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                        <input
                          type="text"
                          value={formData.socialLinks.vrchat}
                          onChange={(e) => handleSocialLinkChange('vrchat', e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                          placeholder="usr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        />
                      </div>

                      {/* Website */}
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-5 h-5 text-text-tertiary flex-shrink-0" />
                        <input
                          type="url"
                          value={formData.socialLinks.website}
                          onChange={(e) => handleSocialLinkChange('website', e.target.value)}
                          className="flex-1 px-3 py-2 bg-surface-float border border-white/5 rounded-lg text-text-primary placeholder:text-text-tertiary text-sm focus:outline-none focus:border-theme-active focus:bg-surface-elevated transition-all"
                          placeholder="https://seusite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links - Só mostrar no modo visualização */}
              {!isEditing && profileUser?.socialLinks && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profileUser.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${profileUser.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg transition-colors text-text-secondary hover:text-theme-primary text-xs sm:text-sm"
                    >
                      <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Twitter</span>
                    </a>
                  )}
                  
                  {profileUser.socialLinks.discord && (
                    <a 
                      href="#"
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg transition-colors text-text-secondary hover:text-theme-primary text-xs sm:text-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{profileUser.socialLinks.discord}</span>
                      <span className="xs:hidden">Discord</span>
                    </a>
                  )}
                  
                  {profileUser.socialLinks.vrchat && (
                    <a 
                      href={`https://vrchat.com/home/user/${profileUser.socialLinks.vrchat}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg transition-colors text-text-secondary hover:text-theme-primary text-xs sm:text-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">VRChat</span>
                    </a>
                  )}
                </div>
              )}

              {/* Botões de ação - Layout minimalista */}
              {isOwnProfile && (
                <div className={`flex items-center ${isEditing ? 'justify-end gap-3 pt-4 border-t border-white/5' : 'justify-start gap-2'}`}>
                  {!isEditing ? (
                    <>
                      {/* Modo Visualização - Minimalista */}
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-theme-active/10 hover:bg-theme-active text-theme-active hover:text-white rounded-lg transition-all text-sm font-medium"
                      >
                        <Edit className="w-4 h-4" />
                        Editar
                      </button>
                      <button 
                        onClick={() => navigate('/settings')}
                        className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
                        title="Configurações"
                      >
                        <Settings className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-text-tertiary hover:text-text-primary"
                        title="Compartilhar"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Modo Edição - Destaque claro */}
                      <button 
                        onClick={handleSave}
                        className="flex items-center gap-2 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all text-sm font-medium shadow-lg shadow-green-600/20"
                      >
                        <Save className="w-4 h-4" />
                        Salvar
                      </button>
                      <button 
                        onClick={handleCancel}
                        className="px-4 py-2.5 text-text-tertiary hover:text-text-primary transition-colors text-sm font-medium"
                      >
                        Cancelar
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Botões para perfil de outros usuários */}
              {!isOwnProfile && profileUser && (
                <div className="flex items-center gap-2">
                  <FollowButton
                    userId={profileUser.id}
                    username={profileUser.username}
                    initialIsFollowing={profileUser.isFollowing || false}
                    variant="primary"
                    size="default"
                    onFollowChange={(isFollowing, followerCount) => {
                      setProfileUser(prev => ({
                        ...prev,
                        isFollowing,
                        stats: {
                          ...prev.stats,
                          followers: followerCount
                        }
                      }));
                    }}
                  />
                  <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-text-tertiary hover:text-text-primary">
                    <MessageCircle className="w-4 h-4" />
                  </button>
                  <button className="p-2 hover:bg-surface-elevated rounded-lg transition-colors text-text-tertiary hover:text-text-primary">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Level Card - Desktop */}
            <div className="hidden lg:block w-56 xl:w-64 flex-shrink-0">
              <div className="card-gradient p-6 text-center rounded-xl">
                <div className="text-5xl font-bold text-white mb-2">
                  {levelProgress.level}
                </div>
                <div className="text-white/80 text-sm mb-4">Nível</div>
                
                <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden mb-2">
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-white/80 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress.progress}%` }}
                  />
                </div>
                
                <div className="text-white/90 text-xs">
                  {levelProgress.progress}% para o nível {levelProgress.level + 1}
                </div>
                
                <div className="text-white/70 text-xs mt-1">
                  {levelProgress.repToNext.toLocaleString()} XP restantes
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5">
            <StatCard 
              icon={User}
              label="Avatares"
              value={profileUser.stats?.avatarsCount || 0}
              color="text-blue-500"
            />
            
            <StatCard 
              icon={Users}
              label="Seguidores"
              value={profileUser.stats?.followers || 0}
              color="text-purple-500"
            />
            
            <StatCard 
              icon={UserPlus}
              label="Seguindo"
              value={profileUser.stats?.following || 0}
              color="text-indigo-500"
            />
            
            <StatCard 
              icon={Heart}
              label="Curtidas"
              value={profileUser.stats?.favoritesCount || 0}
              color="text-red-500"
            />
            
            <StatCard 
              icon={Download}
              label="Downloads"
              value={profileUser.stats?.downloadsCount || 0}
              color="text-green-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 sm:mt-6">
          <div className="rounded-xl border border-white/5 bg-surface-float p-1.5 sm:p-2">
            <nav className="flex gap-1 sm:gap-2 overflow-x-auto scrollbar-hide">
              {tabs.map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap transition-all
                      ${activeTab === tab.id
                        ? 'bg-theme-active text-white shadow-lg shadow-theme-primary/25'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-elevated'
                      }
                    `}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden xs:inline">{tab.label}</span>
                    {tab.count !== undefined && (
                      <span className={`
                        px-1.5 sm:px-2 py-0.5 rounded-full text-xs font-semibold
                        ${activeTab === tab.id
                          ? 'bg-white/20 text-white'
                          : 'bg-surface-elevated text-text-tertiary'
                        }
                      `}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-4 sm:mt-6 pb-6 sm:pb-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                {/* Recent Avatars */}
                <section className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                      Avatares Recentes
                    </h2>
                    <button 
                      onClick={() => setActiveTab('avatars')}
                      className="text-theme-primary hover:text-theme-primary/80 text-xs sm:text-sm font-medium flex items-center gap-1"
                    >
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  {assetsLoading && userAssets.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
                    </div>
                  ) : userAssets.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-text-secondary">Nenhum avatar publicado ainda</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                      {userAssets.slice(0, 6).map(asset => (
                        <AssetCard key={asset.id} asset={asset} />
                      ))}
                    </div>
                  )}
                </section>
              </div>

              {/* Sidebar */}
              <div className="space-y-4 sm:space-y-6">
                {/* Conquistas */}
                <section className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                    Conquistas
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    {profileUser.stats?.badges?.map(badge => (
                      <div 
                        key={badge.id}
                        className="flex flex-col items-center p-3 bg-surface-elevated rounded-lg hover:bg-surface-elevated/80 transition-colors cursor-pointer group"
                        title={badge.description}
                      >
                        <div className="text-3xl mb-1 group-hover:scale-110 transition-transform">
                          {badge.icon}
                        </div>
                        <span className="text-xs text-text-secondary text-center line-clamp-2">
                          {badge.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Atividade Recente */}
                <section className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                    Resumo de Atividade
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg">
                          <Upload className="w-4 h-4 text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Total de Uploads</p>
                          <p className="text-xs text-text-tertiary">Avatares publicados</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-text-primary">{profileUser.stats?.totalUploads || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                          <Heart className="w-4 h-4 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Curtidas Recebidas</p>
                          <p className="text-xs text-text-tertiary">Total de favoritos</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-text-primary">{profileUser.stats?.favoritesCount || 0}</span>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-surface-elevated rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <Download className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-text-primary">Downloads</p>
                          <p className="text-xs text-text-tertiary">Total de downloads</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-text-primary">{profileUser.stats?.downloadsCount || 0}</span>
                    </div>
                  </div>
                </section>

                {/* Estatísticas Avançadas */}
                <section className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-text-primary mb-3 sm:mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                    Estatísticas
                  </h3>
                  
                  <div className="space-y-4">
                    <ProgressStat 
                      label="Qualidade Média"
                      value={stats.averageRating}
                      max={5}
                      suffix="/5.0"
                      color="bg-yellow-500"
                    />
                    
                    <ProgressStat 
                      label="Taxa de Aprovação"
                      value={stats.successRate}
                      max={100}
                      suffix="%"
                      color="bg-green-500"
                    />
                    
                    <div className="pt-4 border-t border-white/5">
                      <div className="text-sm text-text-tertiary mb-2">Trending</div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary font-medium">+{profileUser.stats?.reputation || 0}</span>
                        <span className="text-green-500 text-sm flex items-center gap-1">
                          <TrendingUp className="w-4 h-4" />
                          +15% este mês
                        </span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}

          {activeTab === 'avatars' && (
            <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Todos os Avatares</h2>
                  <p className="text-xs sm:text-sm text-text-tertiary mt-1">{profileUser.stats?.avatarsCount || 0} avatares publicados</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-surface-elevated rounded-lg text-text-primary text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-theme-active border border-white/5"
                  >
                    <option value="recent">Mais Recentes</option>
                    <option value="popular">Mais Populares</option>
                    <option value="downloads">Mais Baixados</option>
                    <option value="likes">Mais Curtidos</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                {assetsLoading && userAssets.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-theme-primary"></div>
                  </div>
                ) : userAssets.length === 0 ? (
                  <div className="col-span-full text-center py-8">
                    <p className="text-text-secondary">Nenhum avatar encontrado</p>
                  </div>
                ) : (
                  userAssets.map(asset => (
                    <AssetCard key={asset.id} asset={asset} expanded />
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Conquistas & Badges</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {profileUser.stats?.badges?.map(badge => (
                  <div 
                    key={badge.id}
                    className="card-gradient p-4 sm:p-6 text-center hover:scale-105 transition-transform cursor-pointer rounded-xl"
                  >
                    <div className="text-4xl sm:text-6xl mb-2 sm:mb-3">{badge.icon}</div>
                    <h3 className="text-white font-bold text-base sm:text-lg mb-1 sm:mb-2">{badge.name}</h3>
                    <p className="text-white/80 text-xs sm:text-sm">{badge.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

// Componentes auxiliares
const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="text-center">
    <div className="flex items-center justify-center mb-1 sm:mb-2">
      <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${color}`} />
    </div>
    <div className="text-lg sm:text-2xl font-bold text-text-primary mb-0.5 sm:mb-1">
      {typeof value === 'number' ? value.toLocaleString() : value}
    </div>
    <div className="text-[10px] sm:text-xs text-text-tertiary">
      {label}
    </div>
  </div>
);

const ProgressStat = ({ label, value, max, suffix, color }) => {
  const percentage = (value / max) * 100;
  
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 sm:mb-2">
        <span className="text-xs sm:text-sm text-text-secondary">{label}</span>
        <span className="text-xs sm:text-sm font-semibold text-text-primary">
          {value}{suffix}
        </span>
      </div>
      <div className="relative w-full h-1.5 sm:h-2 bg-surface-base rounded-full overflow-hidden">
        <div 
          className={`absolute inset-y-0 left-0 ${color} rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
