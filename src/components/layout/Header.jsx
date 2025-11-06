import { Search, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const userMenuRef = useRef(null);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

  // Mock user data - será substituído com contexto real
  const user = {
    name: 'User Name',
    avatar: null,
    email: 'user@example.com'
  };

  // Mock notifications
  const notifications = [
    {
      id: 1,
      type: 'like',
      message: 'Someone liked your asset "Cool Avatar"',
      time: '5m ago',
      read: false
    },
    {
      id: 2,
      type: 'comment',
      message: 'New comment on your asset',
      time: '1h ago',
      read: false
    },
    {
      id: 3,
      type: 'follow',
      message: 'JohnDoe started following you',
      time: '2h ago',
      read: true
    },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="bg-surface-float/80 backdrop-blur-xl border-b border-white/5 z-40">
      <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={20} />
            <input
              type="text"
              placeholder="Search assets, creators, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 pr-4"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-2 ml-4">
          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-surface-float2 rounded-lg transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-float border border-white/10 rounded-xl shadow-card-hover overflow-hidden animate-slide-down">
                <div className="p-4 border-b border-white/5">
                  <h3 className="font-semibold">Notifications</h3>
                  {unreadCount > 0 && (
                    <p className="text-sm text-text-tertiary">{unreadCount} unread</p>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        p-4 border-b border-white/5 hover:bg-surface-float2 cursor-pointer
                        ${!notification.read ? 'bg-theme-active/5' : ''}
                      `}
                    >
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-xs text-text-tertiary mt-1">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="p-3 text-center border-t border-white/5">
                  <button className="text-sm text-theme-active hover:text-theme-hover">
                    View all notifications
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 hover:bg-surface-float2 rounded-lg transition-colors"
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User size={16} />
                </div>
              )}
            </button>

            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-56 bg-surface-float border border-white/10 rounded-xl shadow-card-hover overflow-hidden animate-slide-down">
                <div className="p-4 border-b border-white/5">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-text-tertiary">{user.email}</p>
                </div>
                <div className="py-2">
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-surface-float2 flex items-center gap-3"
                  >
                    <User size={16} />
                    <span>Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      navigate('/settings');
                      setShowUserMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-surface-float2 flex items-center gap-3"
                  >
                    <SettingsIcon size={16} />
                    <span>Settings</span>
                  </button>
                </div>
                <div className="p-2 border-t border-white/5">
                  <button
                    onClick={() => {
                      // TODO: Implement logout
                      console.log('Logout');
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-red-500/10 text-red-500 rounded-lg flex items-center gap-3"
                  >
                    <LogOut size={16} />
                    <span>Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
