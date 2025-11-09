import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Tooltip Component - Enhanced UX with rich content support
 * 
 * Features:
 * - Smart positioning (auto-adjust to viewport)
 * - Keyboard shortcuts display
 * - Delay on show/hide
 * - Accessible (aria-describedby)
 * - Performance optimized (Portal + containment)
 * 
 * @example
 * <Tooltip content="Download asset" shortcut="Ctrl+D">
 *   <button>Download</button>
 * </Tooltip>
 */
const Tooltip = ({ 
  children, 
  content, 
  shortcut,
  position = 'top', // top, bottom, left, right
  delay = 200,
  disabled = false 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [actualPosition, setActualPosition] = useState(position);
  const timeoutRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipRef = useRef(null);

  const showTooltip = () => {
    if (disabled) return;
    
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        calculatePosition(rect);
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const calculatePosition = (triggerRect) => {
    const padding = 8;
    const tooltipHeight = 36; // Approximate
    const tooltipWidth = 200; // Approximate

    let x = 0;
    let y = 0;
    let pos = position;

    switch (position) {
      case 'top':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.top - padding;
        
        // Check if goes off top
        if (y - tooltipHeight < 0) {
          pos = 'bottom';
          y = triggerRect.bottom + padding;
        }
        break;

      case 'bottom':
        x = triggerRect.left + triggerRect.width / 2;
        y = triggerRect.bottom + padding;
        
        // Check if goes off bottom
        if (y + tooltipHeight > window.innerHeight) {
          pos = 'top';
          y = triggerRect.top - padding;
        }
        break;

      case 'left':
        x = triggerRect.left - padding;
        y = triggerRect.top + triggerRect.height / 2;
        
        // Check if goes off left
        if (x - tooltipWidth < 0) {
          pos = 'right';
          x = triggerRect.right + padding;
        }
        break;

      case 'right':
        x = triggerRect.right + padding;
        y = triggerRect.top + triggerRect.height / 2;
        
        // Check if goes off right
        if (x + tooltipWidth > window.innerWidth) {
          pos = 'left';
          x = triggerRect.left - padding;
        }
        break;

      default:
        break;
    }

    setCoords({ x, y });
    setActualPosition(pos);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransformOrigin = () => {
    switch (actualPosition) {
      case 'top': return 'bottom center';
      case 'bottom': return 'top center';
      case 'left': return 'right center';
      case 'right': return 'left center';
      default: return 'center';
    }
  };

  const getPositionStyles = () => {
    const base = {
      position: 'fixed',
      zIndex: 9999,
      pointerEvents: 'none',
    };

    switch (actualPosition) {
      case 'top':
        return {
          ...base,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: 'translate(-50%, -100%)',
        };
      case 'bottom':
        return {
          ...base,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: 'translate(-50%, 0)',
        };
      case 'left':
        return {
          ...base,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: 'translate(-100%, -50%)',
        };
      case 'right':
        return {
          ...base,
          left: `${coords.x}px`,
          top: `${coords.y}px`,
          transform: 'translate(0, -50%)',
        };
      default:
        return base;
    }
  };

  const tooltipId = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        aria-describedby={isVisible ? tooltipId : undefined}
        style={{ display: 'inline-block' }}
      >
        {children}
      </div>

      {isVisible && createPortal(
        <div
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            ...getPositionStyles(),
            transformOrigin: getTransformOrigin(),
            contain: 'layout style paint',
            willChange: 'opacity, transform',
          }}
          className="tooltip-portal animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl border border-white/10 backdrop-blur-xl whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>{content}</span>
              {shortcut && (
                <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px] font-mono border border-white/20">
                  {shortcut}
                </kbd>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Tooltip;
