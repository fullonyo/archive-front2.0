import { Home, Compass, History, Users, Bookmark, FolderOpen, MessageSquare, Settings, Plus, ChevronRight, ChevronLeft, X, Hash, TrendingUp, HelpCircle, Lightbulb, Link2, UserCircle, Activity, PenTool, Shield, FolderHeart } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect, useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isMobile, setIsMobile] = useState(false);

  // Check if user is admin/moderator
  const isAdminUser = user && ['SISTEMA', 'ADMIN', 'MODERATOR'].includes(user.role);

  // Detectar mobile e persistir estado da sidebar
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && isOpen) {
        // Auto-colapsar em mobile
        setIsOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Persistir estado no localStorage
  useEffect(() => {
    const savedState = localStorage.getItem('sidebarOpen');
    if (savedState !== null && !isMobile) {
      setIsOpen(JSON.parse(savedState));
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebarOpen', JSON.stringify(isOpen));
    }
  }, [isOpen, isMobile]);

  // Avatar Lab - Seção principal no topo
  const avatarLabItems = [
    { icon: Plus, label: t('sidebar.newAsset'), path: '/new-asset', special: true },
    { icon: Home, label: t('sidebar.forYou'), path: '/' },
    { icon: Compass, label: t('sidebar.explore'), path: '/explore' },
    { icon: FolderOpen, label: t('sidebar.myAssets'), path: '/my-assets' },
    { icon: FolderHeart, label: 'Coleções', path: '/collections' },
    { icon: Bookmark, label: t('sidebar.bookmarks'), path: '/bookmarks' },
    { icon: History, label: t('sidebar.history'), path: '/history' },
  ];

  const forumCategories = [
    { icon: TrendingUp, label: t('sidebar.forumPopular'), path: '/forum/popular' },
    { icon: HelpCircle, label: t('sidebar.forumSupport'), path: '/forum/support' },
    { icon: Lightbulb, label: t('sidebar.forumIdeas'), path: '/forum/ideas' },
    { icon: Hash, label: t('sidebar.forumGeneral'), path: '/forum/general' },
  ];

  const vrchatItems = [
    { icon: UserCircle, label: t('sidebar.vrchatProfile'), path: '/vrchat/profile' },
    { icon: Users, label: t('sidebar.vrchatFriends'), path: '/vrchat/friends' },
    { icon: Activity, label: t('sidebar.vrchatStatus'), path: '/vrchat/status' },
  ];

  // Função melhorada para detectar item ativo incluindo sub-rotas
  const isActive = (path) => {
    if (location.pathname === path) return true;
    
    // Se está em um post de fórum, destacar a categoria correspondente
    if (location.pathname.startsWith('/forum/post/')) {
      // Detectar categoria pela URL anterior ou state
      const forumPaths = {
        '/forum/popular': location.pathname.includes('popular') || true, // default
        '/forum/support': location.pathname.includes('support'),
        '/forum/ideas': location.pathname.includes('ideas'),
        '/forum/general': location.pathname.includes('general'),
      };
      
      // Se vier de uma categoria específica, destacar ela
      if (path.startsWith('/forum/')) {
        const prevPath = sessionStorage.getItem('forumCategory');
        if (prevPath === path) return true;
        // Por padrão, destacar Popular
        return path === '/forum/popular';
      }
    }
    
    // Para sub-rotas de fórum
    if (path.startsWith('/forum/') && location.pathname.startsWith(path)) {
      return true;
    }
    
    return false;
  };

  // Salvar categoria do fórum quando navegar
  useEffect(() => {
    if (location.pathname.startsWith('/forum/') && !location.pathname.includes('/post/')) {
      sessionStorage.setItem('forumCategory', location.pathname);
    }
  }, [location.pathname]);

  const handleNavigation = (path) => {
    navigate(path);
    // Fechar sidebar em mobile após navegação
    if (isMobile) {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside 
        className={`
          bg-surface-float border-r border-white/5 flex-shrink-0 h-full overflow-x-clip
          ${isOpen ? 'w-64' : 'w-16'}
          ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
        style={{
          contain: 'layout style paint',
          transition: 'width 250ms cubic-bezier(0.4, 0, 0.2, 1)',
          willChange: 'width'
        }}
        aria-label={t('sidebar.menu')}
      >
      <div className="flex flex-col h-full">
        {/* Logo & Toggle Button */}
        <div className="flex items-center justify-between p-2 border-b border-white/5 flex-shrink-0">
          {isOpen ? (
            <>
              <span className="font-medium text-sm text-text-secondary">
                {t('sidebar.menu')}
              </span>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-surface-float2 rounded-lg transition-colors flex-shrink-0"
                aria-label="Fechar sidebar"
                aria-expanded="true"
              >
                {isMobile ? <X size={20} /> : <ChevronLeft size={20} />}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-surface-float2 rounded-lg transition-colors mx-auto"
              aria-label="Abrir sidebar"
              aria-expanded="false"
              title={t('sidebar.menu')}
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <nav 
          className="flex-1 min-h-0 px-2 py-1 overflow-y-auto" 
          aria-label="Menu principal"
          style={{
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'thin'
          }}
        >
          {/* Avatar Lab - Seção Principal */}
          {isOpen && (
            <h3 className="px-3 mb-1 text-xs font-semibold text-theme-active uppercase tracking-wider">
              Avatar Lab
            </h3>
          )}
          <div className={isOpen ? "pb-1 space-y-0.5" : "pb-1 space-y-0.5"}>
            {avatarLabItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              const isSpecial = item.special;
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => handleNavigation(item.path)} 
                  className={`
                    w-full flex items-center py-1.5 rounded-lg font-medium transition-all duration-200 text-sm
                    ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'}
                    ${isSpecial 
                      ? 'bg-theme-active/10 hover:bg-theme-active/20 text-theme-active' 
                      : active 
                        ? 'nav-item active' 
                        : 'nav-item'
                    }
                  `}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Separador */}
          {isOpen && <div className="border-t border-white/5 my-2" />}

          {/* Fórum */}
          {isOpen && (
            <h3 className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              Forum Lab
            </h3>
          )}
          <div className="space-y-0.5 pt-1">
            {/* New Topic Button */}
            <button 
              onClick={() => handleNavigation('/forum/new')} 
              className={`w-full flex items-center py-1.5 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium transition-all duration-200 text-sm ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'}`}
              aria-label={t('sidebar.newTopic')}
              title={!isOpen ? t('sidebar.newTopic') : undefined}
            >
              <PenTool size={18} className="flex-shrink-0" />
              {isOpen && (
                <span className="truncate">
                  {t('sidebar.newTopic')}
                </span>
              )}
            </button>
            
            {/* Forum Categories */}
            {forumCategories.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => handleNavigation(item.path)} 
                  className={`nav-item w-full text-sm py-1.5 ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'} ${active ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate ml-3">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Separador */}
          {isOpen && <div className="border-t border-white/5 my-2" />}

          {/* VRChat API */}
          {isOpen && (
            <h3 className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
              VRChat Lab
            </h3>
          )}
          <div className="space-y-0.5 pt-1">
            {vrchatItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => handleNavigation(item.path)} 
                  className={`nav-item w-full text-sm py-1.5 ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'} ${active ? 'active' : ''}`}
                  aria-label={item.label}
                  aria-current={active ? 'page' : undefined}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon size={18} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate ml-3">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Admin Panel - Only for ADMIN/MODERATOR */}
          {isAdminUser && (
            <>
              <div className="my-2 border-t border-white/10" />
              
              {isOpen && (
                <h3 className="px-3 mb-1 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                  Admin
                </h3>
              )}
              <div className="space-y-0.5">
                <button 
                  onClick={() => handleNavigation('/admin')} 
                  className={`nav-item w-full text-sm py-1.5 ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'} ${isActive('/admin') ? 'active' : ''}`}
                  aria-label={t('sidebar.admin') || 'Admin Panel'}
                  aria-current={isActive('/admin') ? 'page' : undefined}
                  title={!isOpen ? t('sidebar.admin') || 'Admin Panel' : undefined}
                >
                  <Shield size={18} className="flex-shrink-0" />
                  {isOpen && (
                    <span className="truncate ml-3">
                      {t('sidebar.admin') || 'Admin Panel'}
                    </span>
                  )}
                </button>
              </div>
            </>
          )}

        </nav>

        <div className="flex-shrink-0 p-2 border-t border-white/5">
          <button 
            onClick={() => handleNavigation('/settings')} 
            className={`nav-item w-full text-sm py-1.5 ${isOpen ? 'px-3 gap-3' : 'px-3 justify-center'} ${isActive('/settings') ? 'active' : ''}`}
            aria-label={t('sidebar.settings')}
            aria-current={isActive('/settings') ? 'page' : undefined}
            title={!isOpen ? t('sidebar.settings') : undefined}
          >
            <Settings size={18} className="flex-shrink-0" />
            {isOpen && (
              <span className="truncate ml-3">
                {t('sidebar.settings')}
              </span>
            )}
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
