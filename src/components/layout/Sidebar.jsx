import { Home, Compass, History, Users, Bookmark, FolderOpen, MessageSquare, Settings, Plus, ChevronRight, ChevronLeft, X, Hash, TrendingUp, HelpCircle, Lightbulb, Link2, UserCircle, Activity, PenTool } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import { useEffect, useState } from 'react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);

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
          bg-surface-float border-r border-white/5 transition-all duration-300 flex-shrink-0 h-full overflow-hidden
          ${isOpen ? 'w-64' : 'w-16'}
          ${isMobile ? 'fixed left-0 top-0 bottom-0 z-50' : 'relative'}
          ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
        `}
        aria-label={t('sidebar.menu')}
      >
      <div className="flex flex-col min-h-full">
        {/* Logo & Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
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

        <nav className="flex-1 px-2 py-2 space-y-1 overflow-y-auto" aria-label="Menu principal">
          {/* Avatar Lab - Seção Principal */}
          {isOpen ? (
            <div className="pb-3">
              <h3 className="px-3 mb-2 text-xs font-semibold text-theme-active uppercase tracking-wider">
                Avatar Lab
              </h3>
              <div className="space-y-0.5">
                {avatarLabItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  const isSpecial = item.special;
                  
                  return (
                    <button 
                      key={item.path} 
                      onClick={() => handleNavigation(item.path)} 
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 overflow-hidden text-sm
                        ${isSpecial 
                          ? 'bg-theme-active/10 hover:bg-theme-active/20 text-theme-active' 
                          : active 
                            ? 'nav-item active' 
                            : 'nav-item'
                        }
                      `}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="whitespace-nowrap">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Mostrar apenas ícones quando colapsado
            <div className="space-y-0.5 pb-2">
              {avatarLabItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                const isSpecial = item.special;
                
                return (
                  <button 
                    key={item.path} 
                    onClick={() => handleNavigation(item.path)} 
                    className={`
                      w-full flex items-center justify-center p-2 rounded-lg transition-all duration-200
                      ${isSpecial 
                        ? 'bg-theme-active/10 hover:bg-theme-active/20 text-theme-active' 
                        : active 
                          ? 'nav-item active' 
                          : 'nav-item'
                      }
                    `}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon size={18} />
                  </button>
                );
              })}
            </div>
          )}

          {/* Separador */}
          {isOpen && <div className="border-t border-white/5 my-3" />}

          {/* Fórum */}
          {isOpen ? (
            <div className="pt-3">
              <h3 className="px-3 mb-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('sidebar.forum')}
              </h3>
              <div className="space-y-0.5">
                {/* New Topic Button */}
                <button 
                  onClick={() => handleNavigation('/forum/new')} 
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 font-medium transition-all duration-200 overflow-hidden text-sm"
                  aria-label={t('sidebar.newTopic')}
                >
                  <PenTool size={18} className="flex-shrink-0" />
                  <span className="whitespace-nowrap">
                    {t('sidebar.newTopic')}
                  </span>
                </button>
                
                {/* Forum Categories */}
                {forumCategories.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button 
                      key={item.path} 
                      onClick={() => handleNavigation(item.path)} 
                      className={`nav-item w-full justify-start overflow-hidden text-sm py-2 ${active ? 'active' : ''}`}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="whitespace-nowrap ml-3">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Mostrar apenas ícones quando colapsado
            <div className="space-y-0.5">
              {/* New Topic Button - Collapsed */}
              <button 
                onClick={() => handleNavigation('/forum/new')} 
                className="w-full flex items-center justify-center p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 transition-all duration-200"
                aria-label={t('sidebar.newTopic')}
                title={t('sidebar.newTopic')}
              >
                <PenTool size={18} />
              </button>
              
              {/* Forum Categories - Collapsed */}
              {forumCategories.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button 
                    key={item.path} 
                    onClick={() => handleNavigation(item.path)} 
                    className={`nav-item w-full justify-start overflow-hidden text-sm py-2 ${active ? 'active' : ''}`}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}

          {/* Separador */}
          {isOpen && <div className="border-t border-white/5 my-3" />}

          {/* VRChat API */}
          {isOpen ? (
            <div className="pt-3">
              <h3 className="px-3 mb-1.5 text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {t('sidebar.vrchatApi')}
              </h3>
              <div className="space-y-0.5">
                {vrchatItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <button 
                      key={item.path} 
                      onClick={() => handleNavigation(item.path)} 
                      className={`nav-item w-full justify-start overflow-hidden text-sm py-2 ${active ? 'active' : ''}`}
                      aria-label={item.label}
                      aria-current={active ? 'page' : undefined}
                    >
                      <Icon size={18} className="flex-shrink-0" />
                      <span className="whitespace-nowrap ml-3">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            // Mostrar apenas ícones quando colapsado
            <div className="space-y-0.5">
              {vrchatItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button 
                    key={item.path} 
                    onClick={() => handleNavigation(item.path)} 
                    className={`nav-item w-full justify-start overflow-hidden text-sm py-2 ${active ? 'active' : ''}`}
                    aria-label={item.label}
                    aria-current={active ? 'page' : undefined}
                    title={item.label}
                  >
                    <Icon size={18} className="flex-shrink-0" />
                  </button>
                );
              })}
            </div>
          )}


        </nav>

        <div className="p-2 border-t border-white/5">
          <button 
            onClick={() => handleNavigation('/settings')} 
            className={`nav-item w-full justify-start overflow-hidden text-sm py-2 ${isActive('/settings') ? 'active' : ''}`}
            aria-label={t('sidebar.settings')}
            aria-current={isActive('/settings') ? 'page' : undefined}
            title={!isOpen ? t('sidebar.settings') : ''}
          >
            <Settings size={18} className="flex-shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0'}`}>
              {t('sidebar.settings')}
            </span>
          </button>
        </div>
      </div>
    </aside>
    </>
  );
};

export default Sidebar;
