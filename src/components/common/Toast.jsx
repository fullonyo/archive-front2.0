import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Toast notification component with performance optimizations
 * 
 * @param {Object} props
 * @param {boolean} props.show - Controls visibility
 * @param {Function} props.onClose - Callback when toast closes
 * @param {string} props.message - Message to display
 * @param {string} props.type - Type: 'success', 'error', 'warning', 'info' (default: 'info')
 * @param {number} props.duration - Auto-close duration in ms (default: 3000)
 * @param {string} props.position - Position: 'top-right', 'top-center', 'bottom-right', 'bottom-center' (default: 'top-right')
 */
const Toast = ({ 
  show, 
  onClose, 
  message, 
  type = 'info', 
  duration = 3000,
  position = 'top-right'
}) => {
  // Auto-close timer
  useEffect(() => {
    if (!show || duration === 0) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [show, duration, onClose]);

  if (!show) return null;

  // Icon based on type
  const icons = {
    success: <CheckCircle size={20} className="text-green-500" strokeWidth={2.5} />,
    error: <AlertCircle size={20} className="text-red-500" strokeWidth={2.5} />,
    warning: <AlertTriangle size={20} className="text-yellow-500" strokeWidth={2.5} />,
    info: <Info size={20} className="text-blue-500" strokeWidth={2.5} />
  };

  // Background color based on type
  const bgColors = {
    success: 'bg-green-500/20 border-green-500/30',
    error: 'bg-red-500/20 border-red-500/30',
    warning: 'bg-yellow-500/20 border-yellow-500/30',
    info: 'bg-blue-500/20 border-blue-500/30'
  };

  // Position classes
  const positions = {
    'top-right': 'top-4 right-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  return createPortal(
    <div 
      className={`fixed z-[100] ${positions[position]} animate-slide-down`}
      style={{
        contain: 'layout style paint',
        willChange: 'transform, opacity'
      }}
    >
      <div 
        className={`
          flex items-center gap-3 px-4 py-3 rounded-lg border shadow-2xl
          ${bgColors[type]}
          backdrop-blur-sm
          min-w-[300px] max-w-md
        `}
        role="alert"
        aria-live="polite"
      >
        {/* Icon */}
        <div className="flex-shrink-0">
          {icons[type]}
        </div>

        {/* Message */}
        <p className="flex-1 text-sm font-medium text-text-primary">
          {message}
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
    </div>,
    document.body
  );
};

export default Toast;
