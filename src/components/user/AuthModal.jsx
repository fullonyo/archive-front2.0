import { useState } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [currentMode, setCurrentMode] = useState(initialMode);

  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    // Reset to login mode when closing
    setTimeout(() => setCurrentMode('login'), 300);
  };

  const switchToRegister = () => setCurrentMode('register');
  const switchToLogin = () => setCurrentMode('login');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-md mx-auto">
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 z-10"
          >
            <X className="h-6 w-6" />
          </button>
          
          {/* Content */}
          <div className="p-6 pt-12">
            {currentMode === 'login' ? (
              <LoginForm 
                onSwitchToRegister={switchToRegister}
                onClose={handleClose}
              />
            ) : (
              <RegisterForm 
                onSwitchToLogin={switchToLogin}
                onClose={handleClose}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;