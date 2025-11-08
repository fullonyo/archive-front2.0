import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import registerService from '../../services/registerService';
import { CheckCircle, XCircle, Loader, ArrowRight, Mail } from 'lucide-react';

const EmailConfirmationPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevenir race conditions
    let hasConfirmed = false; // Prevenir chamadas duplicadas

    const confirmEmail = async () => {
      // Prevenir execução duplicada
      if (hasConfirmed) {
        console.log('[EmailConfirmation] Already confirmed, skipping...');
        return;
      }
      
      hasConfirmed = true;

      if (!token) {
        if (isMounted) {
          setStatus('error');
          setMessage('Invalid confirmation link');
        }
        return;
      }

      try {
        console.log('[EmailConfirmation] Confirming token:', token);
        const response = await registerService.confirmEmail(token);
        
        if (!isMounted) return; // Componente desmontado, não atualizar estado
        
        if (response.success) {
          setStatus('success');
          setMessage(response.message || 'Email confirmed successfully!');
          setUserData(response.data?.user);
          
          // Redirecionar para login após 3 segundos
          setTimeout(() => {
            if (isMounted) {
              navigate('/login', { 
                state: { 
                  message: 'Account created! Please sign in.',
                  username: response.data?.user?.username 
                }
              });
            }
          }, 3000);
        }
      } catch (error) {
        console.error('Confirmation error:', error);
        
        if (!isMounted) return; // Componente desmontado
        
        // Mensagem específica para email já confirmado
        if (error.response?.data?.message?.includes('já foi confirmado')) {
          setStatus('success');
          setMessage('This email has already been confirmed. Redirecting to login...');
          
          // Redirecionar imediatamente
          setTimeout(() => {
            if (isMounted) {
              navigate('/login', { 
                state: { 
                  message: 'Your account is already active. Please sign in.'
                }
              });
            }
          }, 2000);
          return;
        }
        
        setStatus('error');
        
        // Mensagens de erro específicas
        if (error.response?.status === 410) {
          setMessage('This confirmation link has expired. Please register again.');
        } else if (error.response?.status === 404) {
          setMessage('Invalid confirmation link. Please check your email.');
        } else if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else {
          setMessage('Failed to confirm email. Please try again.');
        }
      }
    };

    confirmEmail();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-surface-base flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="card overflow-hidden shadow-2xl">
          
          {/* Status Icon */}
          <div className={`
            px-8 py-12 flex flex-col items-center justify-center
            ${status === 'loading' ? 'bg-blue-500/10' : ''}
            ${status === 'success' ? 'bg-green-500/10' : ''}
            ${status === 'error' ? 'bg-red-500/10' : ''}
          `}>
            {status === 'loading' && (
              <>
                <Loader className="w-16 h-16 text-blue-500 animate-spin mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Confirming Email...
                </h2>
                <p className="text-text-secondary text-center">
                  Please wait while we verify your email address
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="relative mb-6">
                  <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                  <CheckCircle className="w-16 h-16 text-green-500 relative" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Email Confirmed!
                </h2>
                <p className="text-text-secondary text-center mb-4">
                  {message}
                </p>
                {userData && (
                  <div className="bg-surface-base/50 rounded-lg p-4 mt-4 w-full">
                    <p className="text-sm text-text-tertiary mb-1">Welcome</p>
                    <p className="text-lg font-semibold text-text-primary">
                      {userData.username}
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      {userData.email}
                    </p>
                  </div>
                )}
                <p className="text-xs text-text-tertiary mt-6">
                  Redirecting to login page...
                </p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="w-16 h-16 text-red-500 mb-4" />
                <h2 className="text-2xl font-bold text-text-primary mb-2">
                  Confirmation Failed
                </h2>
                <p className="text-text-secondary text-center mb-6">
                  {message}
                </p>
                <button
                  onClick={() => navigate('/login?mode=register')}
                  className="btn btn-primary"
                >
                  <span>Back to Registration</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-text-tertiary">
            Need help?{' '}
            <button className="text-theme-active hover:text-theme-hover transition-colors">
              Contact Support
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmationPage;
