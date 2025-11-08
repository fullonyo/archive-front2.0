import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import TextType from '../components/common/TextType';
import PixelBlast from '../components/common/PixelBlast';
import GridScan from '../components/common/GridScan';
import { textTypeConfig, activeBackground, pixelBlastConfig, gridScanConfig } from '../config';
import { 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertTriangle, 
  ArrowRight,
  Palette,
  Globe,
  MessageCircle,
  Star,
  Mail
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const { t } = useTranslation();
  
  // Detectar modo inicial da URL (login ou register)
  const initialMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
  const [mode, setMode] = useState(initialMode);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Carregar "Remember Me" do localStorage ao montar
  useEffect(() => {
    const savedRememberMe = localStorage.getItem('rememberMe') === 'true';
    setRememberMe(savedRememberMe);
    
    // Se remember me estava ativo, tentar carregar username salvo
    if (savedRememberMe) {
      const savedUsername = localStorage.getItem('savedUsername');
      if (savedUsername) {
        setFormData(prev => ({ ...prev, username: savedUsername }));
      }
    }
  }, []);

  // Atualizar modo quando URL mudar
  useEffect(() => {
    const urlMode = searchParams.get('mode') === 'register' ? 'register' : 'login';
    setMode(urlMode);
    // Limpar erros ao trocar de modo
    setErrors({});
  }, [searchParams]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Calcular força da senha em tempo real
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calcular força da senha (0-4)
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const getPasswordStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    const colors = ['text-red-500', 'text-orange-500', 'text-yellow-500', 'text-blue-500', 'text-green-500'];
    return { label: labels[passwordStrength], color: colors[passwordStrength] };
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validação de username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }
    
    // Validação de email (apenas registro)
    if (mode === 'register') {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
    }
    
    // Validação de senha (mais rigorosa para registro)
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode === 'register') {
      if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase and lowercase letters';
      } else if (!/(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain at least one number';
      }
    } else {
      // Login: mínimo 6 caracteres (para compatibilidade com contas antigas)
      if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
    }
    
    // Confirmação de senha (apenas registro)
    if (mode === 'register') {
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      if (mode === 'login') {
        await login(formData.username, formData.password);
        
        // Salvar preferência de "Remember Me"
        localStorage.setItem('rememberMe', rememberMe.toString());
        
        if (rememberMe) {
          // Salvar apenas o username (NUNCA a senha!)
          localStorage.setItem('savedUsername', formData.username);
        } else {
          // Limpar username salvo se desmarcou
          localStorage.removeItem('savedUsername');
        }
        
        navigate('/');
      } else {
        // Registro - implementar posteriormente
        console.log('Register:', formData);
        setErrors({
          general: 'Registration is not yet available. Please contact an administrator.'
        });
      }
    } catch (error) {
      // Erro genérico para não revelar se username existe
      setErrors({
        general: mode === 'login' 
          ? 'Invalid credentials. Please check your username and password.' 
          : 'Registration failed. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const switchMode = () => {
    const newMode = mode === 'login' ? 'register' : 'login';
    navigate(newMode === 'register' ? '/login?mode=register' : '/login');
  };

  // Renderizar background baseado na configuração (igual ao MainLayout)
  const renderBackground = () => {
    switch (activeBackground) {
      case 'gridscan':
        return <GridScan {...gridScanConfig} />;
      case 'pixelblast':
      default:
        return <PixelBlast {...pixelBlastConfig} />;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden">
      {/* Background Animado */}
      <div className="absolute inset-0 z-0">
        {renderBackground()}
      </div>

      {/* Overlay escuro para melhor legibilidade */}
      <div className="absolute inset-0 bg-surface-base/40 backdrop-blur-[2px] z-[1]" />

      {/* Container Principal - Split Layout */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        
        {/* LADO ESQUERDO - Hero Section com TextType */}
        <div className="flex-1 flex flex-col justify-between px-6 py-8 lg:py-12">
          
          {/* Logo/Brand - Topo */}
          <div className="flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 bg-gradient-to-br from-theme-active/80 to-theme-hover/80 rounded-lg flex items-center justify-center shadow-md">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Lhama Archive</h2>
              <p className="text-xs text-text-tertiary">VRChat Assets Hub</p>
            </div>
          </div>

          {/* TextType Hero - Centro (Isolado e com altura fixa) */}
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="w-full max-w-3xl text-center px-4">
              {/* Container com altura mínima fixa para evitar movimentação */}
              <div className="min-h-[320px] lg:min-h-[380px] flex flex-col items-center justify-center">
                <TextType
                  text={textTypeConfig.texts}
                  as={textTypeConfig.as}
                  typingSpeed={textTypeConfig.typingSpeed}
                  pauseDuration={textTypeConfig.pauseDuration}
                  deletingSpeed={textTypeConfig.deletingSpeed}
                  loop={textTypeConfig.loop}
                  showCursor={textTypeConfig.showCursor}
                  cursorCharacter={textTypeConfig.cursorCharacter}
                  cursorClassName={textTypeConfig.cursorClassName}
                  cursorBlinkDuration={textTypeConfig.cursorBlinkDuration}
                  textColors={textTypeConfig.textColors}
                  className={textTypeConfig.className}
                />
              </div>
              
              <p className="mt-8 text-sm lg:text-base text-text-secondary/70 animate-fade-in leading-relaxed max-w-lg mx-auto">
                Sign in to explore and share VRChat avatars, worlds, and more with the community.
              </p>
            </div>
          </div>

          {/* Features Grid - Rodapé (Menor destaque) */}
          <div className="opacity-60 hover:opacity-80 transition-opacity">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-2xl mx-auto">
              {[
                { icon: Palette, title: 'Avatars' },
                { icon: Globe, title: 'Worlds' },
                { icon: MessageCircle, title: 'Community' },
                { icon: Star, title: 'Favorites' }
              ].map((feature, idx) => {
                const IconComponent = feature.icon;
                return (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 p-3 rounded-lg bg-surface-float/30 hover:bg-surface-float/50 transition-all"
                  >
                    <IconComponent className="w-4 h-4 text-theme-active/70" />
                    <span className="text-xs text-text-tertiary font-medium">{feature.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* LADO DIREITO - Login Form */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0 lg:border-l lg:border-white/10">
          <div className="w-full max-w-md">
            
            {/* Card do Formulário */}
            <div className="card overflow-hidden shadow-2xl">
              
              {/* Header */}
              <div className="bg-gradient-to-br from-surface-float2/60 to-surface-float/40 px-8 py-8 border-b border-white/10">
                <h2 className="text-3xl font-bold text-text-primary mb-2">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-text-secondary">
                  {mode === 'login' ? 'Sign in to continue your journey' : 'Join our community today'}
                </p>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="px-8 py-8 space-y-6">
                
                {/* General Error */}
                {errors.general && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3 animate-shake">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-500">{errors.general}</p>
                  </div>
                )}

                {/* Username Field */}
                <div className="space-y-2">
                  <label htmlFor="username" className="block text-sm font-semibold text-text-primary">
                    Username
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={`
                        input pl-12
                        ${errors.username ? 'border-red-500/50 bg-red-500/5' : ''}
                      `}
                      placeholder="Enter your username"
                      disabled={isLoading}
                      autoComplete="username"
                    />
                  </div>
                  {errors.username && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.username}
                    </p>
                  )}
                </div>

                {/* Email Field - Only for Register */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-semibold text-text-primary">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-text-tertiary" />
                      </div>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        className={`
                          input pl-12
                          ${errors.email ? 'border-red-500/50 bg-red-500/5' : ''}
                        `}
                        placeholder="Enter your email"
                        disabled={isLoading}
                        autoComplete="email"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>
                )}

                {/* Password Field */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-semibold text-text-primary">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-text-tertiary" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`
                        input pl-12 pr-12
                        ${errors.password ? 'border-red-500/50 bg-red-500/5' : ''}
                      `}
                      placeholder="Enter your password"
                      disabled={isLoading}
                      autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-tertiary hover:text-text-primary transition-colors"
                      disabled={isLoading}
                      tabIndex={-1}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  
                  {/* Password Strength Indicator - Only for Register */}
                  {mode === 'register' && formData.password && (
                    <div className="mt-2 space-y-2">
                      <div className="flex gap-1">
                        {[...Array(4)].map((_, idx) => (
                          <div
                            key={idx}
                            className={`h-1 flex-1 rounded-full transition-all ${
                              idx < passwordStrength
                                ? passwordStrength === 1
                                  ? 'bg-red-500'
                                  : passwordStrength === 2
                                  ? 'bg-yellow-500'
                                  : passwordStrength === 3
                                  ? 'bg-blue-500'
                                  : 'bg-green-500'
                                : 'bg-white/10'
                            }`}
                          />
                        ))}
                      </div>
                      <p className={`text-xs ${getPasswordStrengthLabel().color}`}>
                        {getPasswordStrengthLabel().label}
                      </p>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password Field - Only for Register */}
                {mode === 'register' && (
                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-primary">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-text-tertiary" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        id="confirmPassword"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className={`
                          input pl-12 pr-12
                          ${errors.confirmPassword ? 'border-red-500/50 bg-red-500/5' : ''}
                        `}
                        placeholder="Confirm your password"
                        disabled={isLoading}
                        autoComplete="new-password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-tertiary hover:text-text-primary transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5" />
                        ) : (
                          <Eye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4" />
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                )}

                {/* Remember Me & Forgot Password - Only for Login */}
                {mode === 'login' && (
                  <div className="flex items-center justify-between">
                    <label className="flex items-center cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded border-white/20 bg-surface-base/50 text-theme-active focus:ring-2 focus:ring-theme-active/50 transition-all cursor-pointer"
                        disabled={isLoading}
                      />
                      <span className="ml-2.5 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                        Remember me
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setErrors({ general: 'Password reset is not yet available. Please contact support.' })}
                      className="text-sm text-theme-active hover:text-theme-hover font-medium transition-colors"
                      disabled={isLoading}
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3 justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>{mode === 'login' ? 'Signing in...' : 'Creating account...'}</span>
                    </>
                  ) : (
                    <>
                      <span>{mode === 'login' ? 'Sign In' : 'Create Account'}</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer - Switch Mode */}
              <div className="px-8 py-6 bg-surface-base/30 border-t border-white/5 text-center">
                <p className="text-sm text-text-secondary">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
                  {' '}
                  <button
                    type="button"
                    onClick={switchMode}
                    className="text-theme-active hover:text-theme-hover font-semibold transition-colors"
                  >
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </button>
                </p>
              </div>
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-text-tertiary">
              By {mode === 'login' ? 'signing in' : 'signing up'}, you agree to our{' '}
              <button className="text-theme-active hover:text-theme-hover transition-colors hover:underline">
                Terms
              </button>
              {' '}and{' '}
              <button className="text-theme-active hover:text-theme-hover transition-colors hover:underline">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
