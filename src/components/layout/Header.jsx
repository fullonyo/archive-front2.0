import { Search, Bell, User, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../../hooks/useTranslation';
import LanguageSelector from '../common/LanguageSelector';
import UserButton from '../user/UserButton';

const Header = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef(null);
  const navigate = useNavigate();

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
    <header className="bg-surface-float/80 backdrop-blur-xl border-b border-white/5 z-50 sticky top-0">
      <div className="flex items-center justify-between gap-6 px-4 h-14 w-full">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-bold text-lg hidden sm:block">Archive Nyo</span>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex-1 max-w-3xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" size={18} />
            <input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-surface-base/50 border border-white/5 rounded-lg text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-theme-active/50 focus:bg-surface-base transition-all"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-1">
          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <div className="relative" ref={notificationsRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 hover:bg-surface-float2 rounded-lg transition-colors"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-surface-float" />
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-surface-float border border-white/10 rounded-xl shadow-xl overflow-hidden animate-slide-down">
                <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">{t('header.notifications')}</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs text-text-tertiary bg-theme-active/10 px-2 py-0.5 rounded-full">
                      {unreadCount} {t('header.newNotifications')}
                    </span>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`
                        px-4 py-3 border-b border-white/5 hover:bg-surface-float2 cursor-pointer transition-colors
                        ${!notification.read ? 'bg-theme-active/5' : ''}
                      `}
                    >
                      <p className="text-sm leading-relaxed">{notification.message}</p>
                      <p className="text-xs text-text-tertiary mt-1.5">{notification.time}</p>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2.5 text-center border-t border-white/5 bg-surface-base/30">
                  <button className="text-xs text-theme-active hover:text-theme-hover font-medium">
                    {t('header.viewAllNotifications')}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Button */}
          <UserButton />
        </div>
      </div>
    </header>
  );
};

export default Header;
