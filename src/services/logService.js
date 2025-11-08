/**
 * Logging Service
 * 
 * Centralized logging with support for:
 * - Different log levels (info, warn, error)
 * - Structured logging (context, metadata)
 * - Future: Send to backend logging service
 */

const LOG_LEVELS = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG'
};

class LogService {
  constructor() {
    this.isDevelopment = import.meta.env.DEV;
  }

  /**
   * Format log message with timestamp and context
   */
  _formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    return {
      timestamp,
      level,
      message,
      context,
      userAgent: navigator.userAgent,
      url: window.location.href
    };
  }

  /**
   * Log to console in development, could send to backend in production
   */
  _log(level, message, context = {}) {
    const formattedLog = this._formatMessage(level, message, context);

    // Always log to console in development
    if (this.isDevelopment) {
      const style = this._getConsoleStyle(level);
      console.log(
        `%c[${level}]%c ${message}`,
        style,
        'color: inherit',
        context
      );
    }

    // In production, could send to backend logging service
    // Example: this._sendToBackend(formattedLog);

    return formattedLog;
  }

  /**
   * Get console styling based on log level
   */
  _getConsoleStyle(level) {
    switch (level) {
      case LOG_LEVELS.ERROR:
        return 'color: #ef4444; font-weight: bold';
      case LOG_LEVELS.WARN:
        return 'color: #f59e0b; font-weight: bold';
      case LOG_LEVELS.INFO:
        return 'color: #3b82f6; font-weight: bold';
      case LOG_LEVELS.DEBUG:
        return 'color: #8b5cf6; font-weight: bold';
      default:
        return 'color: inherit';
    }
  }

  /**
   * Log info message
   */
  info(message, context = {}) {
    return this._log(LOG_LEVELS.INFO, message, context);
  }

  /**
   * Log warning
   */
  warn(message, context = {}) {
    return this._log(LOG_LEVELS.WARN, message, context);
  }

  /**
   * Log error
   */
  error(message, context = {}) {
    return this._log(LOG_LEVELS.ERROR, message, context);
  }

  /**
   * Log debug (only in development)
   */
  debug(message, context = {}) {
    if (this.isDevelopment) {
      return this._log(LOG_LEVELS.DEBUG, message, context);
    }
  }

  /**
   * Log React component error (for ErrorBoundary)
   */
  logComponentError(error, errorInfo) {
    const context = {
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      componentStack: errorInfo.componentStack,
      type: 'COMPONENT_ERROR'
    };

    return this.error('React component error', context);
  }

  /**
   * Log API error
   */
  logApiError(endpoint, error, requestData = {}) {
    const context = {
      endpoint,
      error: {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      },
      requestData,
      type: 'API_ERROR'
    };

    return this.error(`API error: ${endpoint}`, context);
  }

  /**
   * Log user action
   */
  logUserAction(action, data = {}) {
    const context = {
      action,
      data,
      type: 'USER_ACTION'
    };

    return this.info(`User action: ${action}`, context);
  }

  /**
   * Future: Send logs to backend
   */
  _sendToBackend(logData) {
    // TODO: Implement backend logging endpoint
    // Example:
    // fetch('/api/logs', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(logData)
    // }).catch(() => {
    //   // Silently fail - don't break app if logging fails
    // });
  }
}

// Export singleton instance
export default new LogService();
