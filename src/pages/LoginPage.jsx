import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
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
  Star
} from 'lucide-react';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useUser();
  const { t } = useTranslation();
  
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      await login(formData.username, formData.password);
      // Redirecionamento será implementado posteriormente
    } catch (error) {
      setErrors({
        general: error.message || 'Login failed. Please check your credentials.'
      });
    } finally {
      setIsLoading(false);
    }
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
        <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
          <div className="w-full max-w-2xl space-y-8">
            
            {/* Logo/Brand */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-gradient-to-br from-theme-active to-theme-hover rounded-xl flex items-center justify-center shadow-lg shadow-theme-active/30">
                <User className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-xl lg:text-2xl font-bold text-text-primary">Lhama Archive</h2>
                <p className="text-sm text-text-tertiary">VRChat Assets Hub</p>
              </div>
            </div>

            {/* TextType Hero */}
            <div className="space-y-6">
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
              
              <p className="text-lg lg:text-xl text-text-secondary animate-fade-in leading-relaxed">
                Sign in to explore and share VRChat avatars, worlds, and more with the community.
              </p>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 animate-fade-in">
                {[
                  { icon: Palette, title: 'Avatars', desc: 'Discover unique designs' },
                  { icon: Globe, title: 'Worlds', desc: 'Explore amazing spaces' },
                  { icon: MessageCircle, title: 'Community', desc: 'Connect with creators' },
                  { icon: Star, title: 'Favorites', desc: 'Save your picks' }
                ].map((feature, idx) => {
                  const IconComponent = feature.icon;
                  return (
                    <div
                      key={idx}
                      className="card p-4 hover:scale-105 cursor-default"
                    >
                      <div className="w-10 h-10 bg-gradient-to-br from-theme-active/20 to-theme-hover/20 rounded-lg flex items-center justify-center mb-3">
                        <IconComponent className="w-5 h-5 text-theme-active" />
                      </div>
                      <h3 className="text-sm font-semibold text-text-primary mb-1">{feature.title}</h3>
                      <p className="text-xs text-text-tertiary">{feature.desc}</p>
                    </div>
                  );
                })}
              </div>
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
                  Welcome Back
                </h2>
                <p className="text-text-secondary">
                  Sign in to continue your journey
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
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-tertiary hover:text-text-primary transition-colors"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-white/20 bg-surface-base/50 text-theme-active focus:ring-2 focus:ring-theme-active/50 transition-all"
                    />
                    <span className="ml-2.5 text-sm text-text-secondary group-hover:text-text-primary transition-colors">
                      Remember me
                    </span>
                  </label>
                  <button
                    type="button"
                    className="text-sm text-theme-active hover:text-theme-hover font-medium transition-colors"
                    disabled={isLoading}
                  >
                    Forgot password?
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn btn-primary w-full py-3 justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="bg-surface-float2/40 backdrop-blur-sm px-8 py-5 border-t border-white/10">
                <p className="text-sm text-center text-text-secondary">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    className="text-theme-active hover:text-theme-hover font-semibold transition-colors"
                    disabled={isLoading}
                  >
                    Sign up now
                  </button>
                </p>
              </div>
            </div>

            {/* Terms */}
            <p className="mt-6 text-center text-xs text-text-tertiary">
              By signing in, you agree to our{' '}
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
