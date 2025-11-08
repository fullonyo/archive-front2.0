import { createPortal } from 'react-dom';
import { useCallback, useEffect, useState } from 'react';
import { Mail, X, RefreshCw, CheckCircle } from 'lucide-react';
import registerService from '../../services/registerService';
import toast from 'react-hot-toast';

const PendingConfirmationModal = ({ isOpen, onClose, email, username }) => {
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  const handleResend = useCallback(async () => {
    if (cooldown > 0 || isResending) return;

    setIsResending(true);
    try {
      const response = await registerService.resendConfirmation(email);
      
      if (response.success) {
        toast.success('Confirmation email resent!');
        // Cooldown de 60 segundos
        setCooldown(60);
      }
    } catch (error) {
      console.error('Resend error:', error);
      toast.error(error.response?.data?.message || 'Failed to resend email');
    } finally {
      setIsResending(false);
    }
  }, [email, cooldown, isResending]);

  // Countdown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
      onClick={handleBackdrop}
      style={{
        contain: 'layout style paint',
        willChange: 'transform',
        transform: 'translateZ(0)'
      }}
    >
      <div
        className="bg-surface-float rounded-xl max-w-md w-full shadow-2xl animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative px-6 py-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-b border-white/10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-text-tertiary hover:text-text-primary transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center">
              <Mail className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-text-primary">
                Check Your Email
              </h2>
              <p className="text-sm text-text-secondary">
                Confirmation sent to {username}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 space-y-4">
          {/* Success Message */}
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-green-500 mb-1">
                Registration Successful!
              </p>
              <p className="text-sm text-text-secondary">
                We've sent a confirmation email to <span className="font-semibold text-text-primary">{email}</span>
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-text-primary">
              Next Steps:
            </h3>
            <ol className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-theme-active font-semibold">1.</span>
                <span>Check your inbox (and spam folder)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-theme-active font-semibold">2.</span>
                <span>Click the confirmation link in the email</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-theme-active font-semibold">3.</span>
                <span>You'll be redirected to login automatically</span>
              </li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <p className="text-xs text-yellow-500">
              ⚠️ The confirmation link expires in <span className="font-bold">24 hours</span>
            </p>
          </div>

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={isResending || cooldown > 0}
            className="btn btn-secondary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isResending ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Sending...</span>
              </>
            ) : cooldown > 0 ? (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend in {cooldown}s</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>Resend Confirmation Email</span>
              </>
            )}
          </button>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-surface-base/30 border-t border-white/5 text-center">
          <p className="text-xs text-text-tertiary mb-2">
            Didn't receive the email?{' '}
            <button className="text-theme-active hover:text-theme-hover transition-colors">
              Contact Support
            </button>
          </p>
          
          {/* Dev Mode Helper */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-xs text-blue-400">
                💡 <strong>Development Mode:</strong> Check the backend console for the confirmation link
              </p>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default PendingConfirmationModal;
