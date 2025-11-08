import { Component } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import logService from '../../services/logService';

/**
 * Error Boundary Component
 * 
 * Catches React errors and prevents white screen of death.
 * Shows user-friendly fallback UI with recovery options.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to logging service
    logService.logComponentError(error, errorInfo);

    // Update state with error details
    this.setState(prevState => ({
      error,
      errorInfo,
      errorCount: prevState.errorCount + 1
    }));

    // If too many errors, might be in error loop - reload page
    if (this.state.errorCount >= 3) {
      console.error('Too many errors detected. Reloading page...');
      setTimeout(() => window.location.reload(), 2000);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const isDevelopment = import.meta.env.DEV;

      return (
        <div className="min-h-screen bg-surface-base flex items-center justify-center p-4">
          <div className="max-w-2xl w-full">
            {/* Error Card */}
            <div className="bg-surface-float rounded-2xl border border-red-500/20 p-8 text-center">
              {/* Icon */}
              <div className="inline-flex items-center justify-center w-16 h-16 bg-red-500/10 rounded-full mb-6">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-text-primary mb-3">
                Oops! Algo deu errado
              </h1>

              {/* Description */}
              <p className="text-text-secondary mb-6">
                Encontramos um erro inesperado. Não se preocupe, seus dados estão seguros.
                Tente uma das opções abaixo:
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                <button
                  onClick={this.handleReset}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-theme-active hover:bg-theme-hover text-white rounded-lg font-medium transition-colors"
                >
                  <RefreshCw size={18} />
                  Tentar Novamente
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-float2 hover:bg-surface-float text-text-primary rounded-lg font-medium transition-colors border border-white/10"
                >
                  <Home size={18} />
                  Ir para Início
                </button>

                <button
                  onClick={this.handleReload}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-surface-float2 hover:bg-surface-float text-text-primary rounded-lg font-medium transition-colors border border-white/10"
                >
                  <RefreshCw size={18} />
                  Recarregar Página
                </button>
              </div>

              {/* Error Details (Dev Mode Only) */}
              {isDevelopment && this.state.error && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm font-medium text-text-secondary hover:text-text-primary mb-2">
                    Detalhes do Erro (Dev Mode)
                  </summary>
                  
                  <div className="bg-surface-base rounded-lg p-4 border border-white/5">
                    <p className="text-xs font-mono text-red-400 mb-2">
                      {this.state.error.toString()}
                    </p>
                    
                    {this.state.error.stack && (
                      <pre className="text-xs text-text-tertiary overflow-x-auto mb-4">
                        {this.state.error.stack}
                      </pre>
                    )}
                    
                    {this.state.errorInfo?.componentStack && (
                      <div>
                        <p className="text-xs font-semibold text-text-secondary mb-1">
                          Component Stack:
                        </p>
                        <pre className="text-xs text-text-tertiary overflow-x-auto">
                          {this.state.errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Help Text */}
              <p className="text-xs text-text-tertiary mt-6">
                Se o problema persistir, entre em contato com o suporte.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
