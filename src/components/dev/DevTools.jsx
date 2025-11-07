import { useState } from 'react';
import { useUser } from '../../contexts/UserContext';
import { Settings, User, LogOut, X } from 'lucide-react';

const DevTools = () => {
  const { isAuthenticated, logout, user, userStats } = useUser();
  const [isOpen, setIsOpen] = useState(false);

  // Mostrar apenas em desenvolvimento
  if (import.meta.env.PROD) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-[9999] w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all"
        title="Dev Tools"
      >
        <Settings className="w-5 h-5" />
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-[9999] w-80 bg-surface-float border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-purple-600 px-4 py-3 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Dev Tools
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Auth Status */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">Authentication</h4>
              <div className="bg-surface-base/50 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-red-500'}`} />
                  <span className="text-sm text-text-secondary">
                    {isAuthenticated ? 'Logged In' : 'Logged Out'}
                  </span>
                </div>
                
                {isAuthenticated && user && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 mb-2">
                      <img
                        src={user.avatar}
                        alt={user.displayName}
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-medium text-text-primary">{user.displayName}</p>
                        <p className="text-xs text-text-tertiary">@{user.username}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mt-3">
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">{userStats.avatarsCount}</div>
                        <div className="text-xs text-text-tertiary">Avatars</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">{userStats.favoritesCount}</div>
                        <div className="text-xs text-text-tertiary">Favorites</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-text-primary">{userStats.level}</div>
                        <div className="text-xs text-text-tertiary">Level</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <h4 className="text-sm font-semibold text-text-primary">Actions</h4>
              {isAuthenticated ? (
                <button
                  onClick={logout}
                  className="w-full btn btn-secondary justify-center text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Logout (Mockup)
                </button>
              ) : (
                <button
                  onClick={() => window.location.href = '/login'}
                  className="w-full btn btn-primary justify-center text-sm"
                >
                  <User className="w-4 h-4" />
                  Go to Login
                </button>
              )}
            </div>

            {/* Info */}
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
              <p className="text-xs text-yellow-500">
                <strong>Mockup Mode:</strong> User data is simulated. Remove MOCKUP code in UserContext when backend is ready.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevTools;
