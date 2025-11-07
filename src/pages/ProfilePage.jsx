import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useTranslation } from '../hooks/useTranslation';
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
  const { user: currentUser, isAuthenticated, userStats } = useUser();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedFilter, setSelectedFilter] = useState('recent');
  const [isEditing, setIsEditing] = useState(false);
  
  // Form states para edição
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    socialLinks: {
      twitter: '',
      discord: '',
      vrchat: '',
      website: ''
    }
  });

  // Simular se é perfil próprio
  const isOwnProfile = isAuthenticated && currentUser?.username === username;
  const displayUser = currentUser; // TODO: Carregar perfil de outro usuário se necessário

  // Inicializar form data quando o usuário carregar
  useState(() => {
    if (displayUser) {
      setFormData({
        displayName: displayUser.displayName || '',
        bio: displayUser.bio || '',
        location: displayUser.location || '',
        socialLinks: {
          twitter: displayUser.socialLinks?.twitter || '',
          discord: displayUser.socialLinks?.discord || '',
          vrchat: displayUser.socialLinks?.vrchat || '',
          website: displayUser.socialLinks?.website || ''
        }
      });
    }
  }, [displayUser]);

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
  const handleSave = () => {
    // TODO: Implementar chamada à API para salvar
    console.log('Saving profile data:', formData);
    setIsEditing(false);
    // Aqui você faria: updateUser(formData)
  };

  // Cancelar edição
  const handleCancel = () => {
    // Resetar para dados originais
    setFormData({
      displayName: displayUser.displayName || '',
      bio: displayUser.bio || '',
      location: displayUser.location || '',
      socialLinks: {
        twitter: displayUser.socialLinks?.twitter || '',
        discord: displayUser.socialLinks?.discord || '',
        vrchat: displayUser.socialLinks?.vrchat || '',
        website: displayUser.socialLinks?.website || ''
      }
    });
    setIsEditing(false);
  };

  // Dados mockup para demonstração
  const mockAvatars = [
    { id: 1, name: 'Cyber Fox', preview: 'https://images.unsplash.com/photo-1614680376593-902f74cf0d41?w=400', likes: 234, downloads: 1203, views: 5432, uploadDate: '2024-10-15' },
    { id: 2, name: 'Neon Cat', preview: 'https://images.unsplash.com/photo-1573865526739-10c1d3a1f0ed?w=400', likes: 189, downloads: 892, views: 4123, uploadDate: '2024-10-10' },
    { id: 3, name: 'Space Wolf', preview: 'https://images.unsplash.com/photo-1614680376408-81e91ffe3db7?w=400', likes: 312, downloads: 1534, views: 6789, uploadDate: '2024-09-28' },
    { id: 4, name: 'Crystal Dragon', preview: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400', likes: 445, downloads: 2103, views: 8234, uploadDate: '2024-09-15' },
    { id: 5, name: 'Galaxy Girl', preview: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=400', likes: 567, downloads: 2834, views: 9876, uploadDate: '2024-08-30' },
    { id: 6, name: 'Tech Warrior', preview: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=400', likes: 123, downloads: 543, views: 2345, uploadDate: '2024-08-20' }
  ];

  const mockPosts = [
    { id: 1, title: 'Best practices for avatar optimization', category: 'Tutorial', replies: 45, likes: 123, views: 2340, date: '2024-10-01', isPinned: true },
    { id: 2, title: 'New avatar showcase - Cyber collection', category: 'Showcase', replies: 28, likes: 89, views: 1234, date: '2024-09-28' },
    { id: 3, title: 'Looking for feedback on my latest creation', category: 'Discussion', replies: 67, likes: 156, views: 3456, date: '2024-09-25' },
    { id: 4, title: 'Avatar creation tools comparison', category: 'Guide', replies: 34, likes: 78, views: 1876, date: '2024-09-20' }
  ];

  const mockActivities = [
    { id: 1, type: 'upload', content: 'Uploaded new avatar "Cyber Fox"', time: '2h ago', icon: Upload, color: 'text-blue-500' },
    { id: 2, type: 'post', content: 'Posted in Tutorial: "Best practices for avatar optimization"', time: '5h ago', icon: MessageSquare, color: 'text-green-500' },
    { id: 3, type: 'like', content: 'Liked 3 avatars', time: '1d ago', icon: Heart, color: 'text-red-500' },
    { id: 4, type: 'comment', content: 'Commented on "New VRChat update discussion"', time: '2d ago', icon: MessageCircle, color: 'text-purple-500' },
    { id: 5, type: 'achievement', content: 'Earned "Creator" badge', time: '3d ago', icon: Award, color: 'text-yellow-500' }
  ];

  // Cálculo de nível e progresso
  const levelProgress = useMemo(() => {
    const currentLevel = userStats?.level || 1;
    const currentRep = userStats?.reputation || 0;
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
  }, [userStats]);

  // Estatísticas calculadas
  const stats = useMemo(() => ({
    totalEngagement: (userStats?.avatarsCount * 10) + (userStats?.postsCount * 5) + (userStats?.repliesCount * 2),
    averageRating: 4.8,
    successRate: 94,
    responseTime: '< 2h'
  }), [userStats]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', icon: Activity },
    { id: 'avatars', label: 'Avatares', icon: User, count: userStats?.avatarsCount },
    { id: 'posts', label: 'Posts', icon: MessageSquare, count: userStats?.postsCount },
    { id: 'activity', label: 'Atividade', icon: TrendingUp },
    { id: 'achievements', label: 'Conquistas', icon: Trophy }
  ];

  return (
    <div>
      {/* Header com Cover - Bem pequeno */}
      <div className="relative bg-gradient-to-br from-theme-primary via-theme-secondary to-theme-accent h-20 sm:h-24">
        {/* Padrão de fundo */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10" />
        
        {/* Botão de alterar cover - Só aparece quando editando */}
        {isEditing && isOwnProfile && (
          <button 
            className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 px-3 py-2 bg-black/50 hover:bg-black/70 backdrop-blur-sm text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
            title="Alterar imagem de capa"
          >
            <ImagePlus className="w-4 h-4" />
            <span className="hidden sm:inline">Alterar Capa</span>
          </button>
        )}
      </div>

      {/* Profile Info Card - Com padding padrão das páginas */}
      <div className="px-3 sm:px-4 lg:px-6 -mt-10 sm:-mt-12 relative z-10">
        <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 rounded-2xl bg-gradient-to-br from-theme-primary to-theme-accent p-1 shadow-xl">
                <div className="w-full h-full rounded-xl bg-surface-float flex items-center justify-center overflow-hidden">
                  {displayUser?.avatar ? (
                    <img 
                      src={displayUser.avatar} 
                      alt={displayUser.displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-5xl font-bold text-text-primary">
                      {displayUser?.displayName?.[0]?.toUpperCase() || 'U'}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Botão de upload de avatar - Só aparece quando editando */}
              {isEditing && isOwnProfile && (
                <button 
                  className="absolute bottom-0 right-0 w-10 h-10 sm:w-12 sm:h-12 bg-theme-primary hover:bg-theme-hover text-white rounded-full flex items-center justify-center shadow-lg transition-colors"
                  title="Alterar foto de perfil"
                >
                  <Camera className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
              
              {/* Status online - Só mostra quando não está editando */}
              {!isEditing && (
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-surface-float rounded-full shadow-lg" />
              )}
              
              {/* Badge de verificado */}
              {displayUser?.isVerified && (
                <div className="absolute -top-2 -right-2 w-10 h-10 bg-theme-primary rounded-full flex items-center justify-center shadow-lg border-4 border-surface-float">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              {/* MODO VISUALIZAÇÃO */}
              {!isEditing ? (
                <>
                  {/* Nome e badges */}
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h1 className="text-3xl lg:text-4xl font-bold text-text-primary">
                      {displayUser?.displayName || displayUser?.username}
                    </h1>
                    
                    {userStats?.isVerified && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full text-sm font-medium">
                        <Star className="w-4 h-4" />
                        Verificado
                      </div>
                    )}
                    
                    {userStats?.isAdmin && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-red-500/10 text-red-500 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        Admin
                      </div>
                    )}
                    
                    {userStats?.isModerator && !userStats?.isAdmin && (
                      <div className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-500 rounded-full text-sm font-medium">
                        <Award className="w-4 h-4" />
                        Moderador
                      </div>
                    )}
                  </div>

                  <p className="text-text-secondary mb-4">@{displayUser?.username}</p>

                  {/* Bio */}
                  {displayUser?.bio && (
                    <p className="text-sm sm:text-base text-text-primary max-w-3xl mb-3 sm:mb-4 leading-relaxed">
                      {displayUser.bio}
                    </p>
                  )}

                  {/* Meta info */}
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-tertiary mb-4 sm:mb-6">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Membro desde</span>
                      <span className="sm:hidden">Desde</span>
                      {' '}{new Date(displayUser?.createdAt || Date.now()).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                    </div>
                    
                    {displayUser?.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {displayUser.location}
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
                      className="w-full px-4 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-theme-primary transition-colors"
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
                      value={displayUser?.username}
                      disabled
                      className="w-full px-4 py-2 bg-surface-base border border-white/5 rounded-lg text-text-tertiary cursor-not-allowed"
                    />
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-text-secondary mb-2">
                      Biografia
                      <span className="text-text-tertiary ml-2">
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
                      className="w-full px-4 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-theme-primary transition-colors resize-none"
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
                      className="w-full px-4 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary focus:outline-none focus:border-theme-primary transition-colors"
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
                          className="flex-1 px-3 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-theme-primary transition-colors"
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
                          className="flex-1 px-3 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-theme-primary transition-colors"
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
                          className="flex-1 px-3 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-theme-primary transition-colors"
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
                          className="flex-1 px-3 py-2 bg-surface-elevated border border-white/10 rounded-lg text-text-primary text-sm focus:outline-none focus:border-theme-primary transition-colors"
                          placeholder="https://seusite.com"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links - Só mostrar no modo visualização */}
              {!isEditing && displayUser?.socialLinks && (
                <div className="flex flex-wrap gap-2">
                  {displayUser.socialLinks.twitter && (
                    <a 
                      href={`https://twitter.com/${displayUser.socialLinks.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg transition-colors text-text-secondary hover:text-theme-primary text-xs sm:text-sm"
                    >
                      <Twitter className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Twitter</span>
                    </a>
                  )}
                  
                  {displayUser.socialLinks.discord && (
                    <a 
                      href="#"
                      className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 bg-surface-elevated hover:bg-surface-elevated/80 rounded-lg transition-colors text-text-secondary hover:text-theme-primary text-xs sm:text-sm"
                    >
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">{displayUser.socialLinks.discord}</span>
                      <span className="xs:hidden">Discord</span>
                    </a>
                  )}
                  
                  {displayUser.socialLinks.vrchat && (
                    <a 
                      href={`https://vrchat.com/home/user/${displayUser.socialLinks.vrchat}`}
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

              {/* Botões de ação */}
              <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-white/5">
                {isOwnProfile ? (
                  <>
                    {!isEditing ? (
                      <>
                        {/* Modo Visualização */}
                        <button 
                          onClick={() => setIsEditing(true)}
                          className="flex items-center gap-2 px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors text-sm"
                        >
                          <Edit className="w-4 h-4" />
                          Editar Perfil
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors text-sm">
                          <Share2 className="w-4 h-4" />
                          Compartilhar
                        </button>
                        <button 
                          onClick={() => navigate('/settings')}
                          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors text-sm"
                        >
                          <Settings className="w-4 h-4" />
                          <span className="hidden sm:inline">Configurações</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* Modo Edição */}
                        <button 
                          onClick={handleSave}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
                        >
                          <Save className="w-4 h-4" />
                          Salvar Alterações
                        </button>
                        <button 
                          onClick={handleCancel}
                          className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancelar
                        </button>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <button className="flex items-center gap-2 px-4 py-2 bg-theme-active text-white rounded-lg hover:bg-theme-hover transition-colors text-sm">
                      <Users className="w-4 h-4" />
                      Seguir
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors text-sm">
                      <MessageCircle className="w-4 h-4" />
                      Mensagem
                    </button>
                    <button className="px-4 py-2 bg-surface-elevated hover:bg-surface-elevated/80 text-text-primary rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
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
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 sm:gap-4 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-white/5">
            <StatCard 
              icon={User}
              label="Avatares"
              value={userStats?.avatarsCount || 0}
              color="text-blue-500"
            />
            
            <StatCard 
              icon={MessageSquare}
              label="Posts"
              value={userStats?.postsCount || 0}
              color="text-green-500"
            />
            
            <StatCard 
              icon={Heart}
              label="Curtidas"
              value={userStats?.favoritesCount || 0}
              color="text-red-500"
            />
            
            <StatCard 
              icon={Download}
              label="Downloads"
              value={userStats?.downloadsCount || 0}
              color="text-purple-500"
            />
            
            <StatCard 
              icon={Trophy}
              label="Reputação"
              value={userStats?.reputation || 0}
              color="text-yellow-500"
            />
            
            <StatCard 
              icon={Target}
              label="Taxa de Sucesso"
              value={`${stats.successRate}%`}
              color="text-cyan-500"
            />
            
            <StatCard 
              icon={Zap}
              label="Engajamento"
              value={stats.totalEngagement}
              color="text-orange-500"
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
                    <button className="text-theme-primary hover:text-theme-primary/80 text-xs sm:text-sm font-medium flex items-center gap-1">
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {mockAvatars.slice(0, 6).map(avatar => (
                      <AvatarCard key={avatar.id} avatar={avatar} />
                    ))}
                  </div>
                </section>

                {/* Recent Posts */}
                <section className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <h2 className="text-lg sm:text-xl font-bold text-text-primary flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-theme-primary" />
                      Posts Recentes
                    </h2>
                    <button className="text-theme-primary hover:text-theme-primary/80 text-xs sm:text-sm font-medium flex items-center gap-1">
                      Ver todos
                      <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                  
                  <div className="space-y-2 sm:space-y-3">
                    {mockPosts.map(post => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
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
                    {userStats?.badges?.map(badge => (
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
                    Atividade Recente
                  </h3>
                  
                  <div className="space-y-3 sm:space-y-4">
                    {mockActivities.slice(0, 5).map(activity => (
                      <ActivityItem key={activity.id} activity={activity} />
                    ))}
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
                        <span className="text-text-primary font-medium">+{userStats?.reputation || 0}</span>
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
                  <p className="text-xs sm:text-sm text-text-tertiary mt-1">{userStats?.avatarsCount || 0} avatares publicados</p>
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
                {mockAvatars.map(avatar => (
                  <AvatarCard key={avatar.id} avatar={avatar} expanded />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'posts' && (
            <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary">Todos os Posts</h2>
                  <p className="text-xs sm:text-sm text-text-tertiary mt-1">{userStats?.postsCount || 0} posts no fórum</p>
                </div>
              </div>
              
              <div className="space-y-2 sm:space-y-3">
                {mockPosts.map(post => (
                  <PostCard key={post.id} post={post} expanded />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Timeline de Atividades</h2>
              
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-theme-primary via-theme-secondary to-transparent" />
                
                <div className="space-y-6">
                  {mockActivities.map((activity, index) => (
                    <ActivityItemExpanded key={activity.id} activity={activity} isLast={index === mockActivities.length - 1} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'achievements' && (
            <div className="rounded-xl border border-white/5 bg-surface-float p-4 sm:p-6">
              <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-4 sm:mb-6">Conquistas & Badges</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {userStats?.badges?.map(badge => (
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

const AvatarCard = ({ avatar, expanded = false }) => (
  <div className="group relative bg-surface-elevated rounded-lg sm:rounded-xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer">
    <div className="aspect-square bg-surface-base overflow-hidden">
      <img 
        src={avatar.preview}
        alt={avatar.name}
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
    </div>
    
    <div className="p-2 sm:p-3">
      <h3 className="font-semibold text-text-primary text-xs sm:text-sm mb-1 sm:mb-2 line-clamp-1 group-hover:text-theme-primary transition-colors">
        {avatar.name}
      </h3>
      
      <div className="flex items-center justify-between text-[10px] sm:text-xs text-text-tertiary">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {avatar.likes}
          </span>
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Download className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {avatar.downloads}
          </span>
          {expanded && (
            <span className="flex items-center gap-0.5 sm:gap-1">
              <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
              {avatar.views}
            </span>
          )}
        </div>
      </div>
    </div>
  </div>
);

const PostCard = ({ post, expanded = false }) => (
  <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 p-3 sm:p-4 bg-surface-elevated rounded-lg hover:bg-surface-elevated/80 transition-colors cursor-pointer group">
    <div className="flex-shrink-0">
      <div className={`
        w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center
        ${post.isPinned ? 'bg-yellow-500/10' : 'bg-theme-primary/10'}
      `}>
        <MessageSquare className={`w-4 h-4 sm:w-5 sm:h-5 ${post.isPinned ? 'text-yellow-500' : 'text-theme-primary'}`} />
      </div>
    </div>
    
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h3 className="font-semibold text-text-primary group-hover:text-theme-primary transition-colors line-clamp-1 text-xs sm:text-sm lg:text-base">
          {post.title}
        </h3>
        {post.isPinned && (
          <span className="flex-shrink-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 bg-yellow-500/10 text-yellow-500 rounded-full whitespace-nowrap">
            Fixado
          </span>
        )}
      </div>
      
      <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[10px] sm:text-xs text-text-tertiary">
        <span className="px-1.5 sm:px-2 py-0.5 bg-theme-primary/10 text-theme-primary rounded-full">
          {post.category}
        </span>
        
        <span className="flex items-center gap-0.5 sm:gap-1">
          <MessageSquare className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {post.replies}
        </span>
        
        <span className="flex items-center gap-0.5 sm:gap-1">
          <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
          {post.likes}
        </span>
        
        {expanded && (
          <span className="flex items-center gap-0.5 sm:gap-1">
            <Eye className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
            {post.views}
          </span>
        )}
        
        <span className="hidden sm:inline">{new Date(post.date).toLocaleDateString('pt-BR')}</span>
      </div>
    </div>
  </div>
);

const ActivityItem = ({ activity }) => {
  const Icon = activity.icon;
  return (
    <div className="flex items-start gap-2 sm:gap-3">
      <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-surface-base flex items-center justify-center ${activity.color}`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs sm:text-sm text-text-primary line-clamp-2">
          {activity.content}
        </p>
        <p className="text-[10px] sm:text-xs text-text-tertiary mt-0.5 sm:mt-1">
          {activity.time}
        </p>
      </div>
    </div>
  );
};

const ActivityItemExpanded = ({ activity, isLast }) => {
  const Icon = activity.icon;
  return (
    <div className="relative pl-10 sm:pl-12">
      <div className={`absolute left-0 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-float border-4 border-surface-base flex items-center justify-center ${activity.color}`}>
        <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </div>
      
      <div className="rounded-xl border border-white/5 bg-surface-float p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-text-primary mb-1 sm:mb-2">
          {activity.content}
        </p>
        <p className="text-[10px] sm:text-sm text-text-tertiary">
          {activity.time}
        </p>
      </div>
    </div>
  );
};

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
