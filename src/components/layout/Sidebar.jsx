import { Home, Compass, History, Users, Bookmark, FolderOpen, MessageSquare, Settings, Plus, ChevronRight, ChevronLeft } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const mainMenuItems = [
    { icon: Home, label: 'For You', path: '/' },
    { icon: Users, label: 'Following', path: '/following' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    { icon: History, label: 'History', path: '/history' },
  ];

  const secondaryMenuItems = [
    { icon: Bookmark, label: 'Bookmarks', path: '/bookmarks' },
    { icon: FolderOpen, label: 'My Assets', path: '/my-assets' },
    { icon: MessageSquare, label: 'Discussions', path: '/discussions' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`bg-surface-float border-r border-white/5 transition-all duration-300 ease-in-out flex-shrink-0 ${isOpen ? 'w-64' : 'w-16'}`}>
      <div className="flex flex-col h-full">
        {/* Logo & Toggle Button */}
        <div className="flex items-center justify-between p-4 border-b border-white/5">
          {isOpen ? (
            <>
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <span className={`font-bold text-lg whitespace-nowrap transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>
                  Archive Nyo
                </span>
              </div>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 hover:bg-surface-float2 rounded-lg transition-colors flex-shrink-0"
              >
                <ChevronLeft size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 hover:bg-surface-float2 rounded-lg transition-colors mx-auto"
            >
              <ChevronRight size={20} />
            </button>
          )}
        </div>

        <div className="px-2 py-4">
          <button 
            onClick={() => navigate('/new-asset')} 
            className="group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-theme-active/10 hover:bg-theme-active/20 text-theme-active font-medium transition-all duration-200 overflow-hidden"
          >
            <Plus size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs' : 'opacity-0 max-w-0 ml-0'}`}>
              New Asset
            </span>
          </button>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          <div className="space-y-1">
            {mainMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => navigate(item.path)} 
                  className={`nav-item w-full justify-start overflow-hidden ${active ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0 ml-0'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className={`border-t border-white/5 my-4 transition-opacity duration-200 ${isOpen ? 'opacity-100' : 'opacity-0'}`} />

          <div className="space-y-1">
            {secondaryMenuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button 
                  key={item.path} 
                  onClick={() => navigate(item.path)} 
                  className={`nav-item w-full justify-start overflow-hidden ${active ? 'active' : ''}`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0 ml-0'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>

        <div className="p-2 border-t border-white/5">
          <button 
            onClick={() => navigate('/settings')} 
            className={`nav-item w-full justify-start overflow-hidden ${isActive('/settings') ? 'active' : ''}`}
          >
            <Settings size={20} className="flex-shrink-0" />
            <span className={`whitespace-nowrap transition-all duration-200 ${isOpen ? 'opacity-100 max-w-xs ml-3' : 'opacity-0 max-w-0 ml-0'}`}>
              Settings
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
