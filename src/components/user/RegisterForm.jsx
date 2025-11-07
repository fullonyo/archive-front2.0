import { useState } from 'react';
import { useAuth } from '../../hooks/user/useAuth';
import { useTranslation } from '../../hooks/useTranslation';
import { 
  UserPlus, 
  Eye, 
  EyeOff,
  AlertTriangle,
  Check
} from 'lucide-react';

const RegisterForm = ({ onSwitchToLogin, onClose }) => {
  const { t } = useTranslation();
  const { register, loading, error, clearError } = useAuth();
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    displayName: '',
    agreeToTerms: false,
    agreeToPrivacy: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Clear general error
    if (error) clearError();
  };

  const validateForm = () => {
    const errors = {};
    
    // Username validation
    if (!formData.username) {
      errors.username = t('user.validation.usernameRequired');
    } else if (formData.username.length < 3) {
      errors.username = t('user.validation.usernameTooShort');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = t('user.validation.usernameInvalid');
    }
    
    // Email validation
    if (!formData.email) {
      errors.email = t('user.validation.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = t('user.validation.emailInvalid');
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = t('user.validation.passwordRequired');
    } else if (formData.password.length < 8) {
      errors.password = t('user.validation.passwordTooShort');
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = t('user.validation.passwordWeak');
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      errors.confirmPassword = t('user.validation.confirmPasswordRequired');
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = t('user.validation.passwordMismatch');
    }
    
    // Display name validation (optional but if provided should be valid)
    if (formData.displayName && formData.displayName.length > 50) {
      errors.displayName = t('user.validation.displayNameTooLong');
    }
    
    // Terms and privacy validation
    if (!formData.agreeToTerms) {
      errors.agreeToTerms = t('user.validation.agreeToTermsRequired');
    }
    
    if (!formData.agreeToPrivacy) {
      errors.agreeToPrivacy = t('user.validation.agreeToPrivacyRequired');
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getPasswordStrength = () => {
    const password = formData.password;
    if (!password) return { strength: 0, label: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;
    
    const levels = [
      { strength: 0, label: t('user.password.veryWeak'), color: 'bg-red-500' },
      { strength: 1, label: t('user.password.weak'), color: 'bg-red-400' },
      { strength: 2, label: t('user.password.fair'), color: 'bg-yellow-500' },
      { strength: 3, label: t('user.password.good'), color: 'bg-blue-500' },
      { strength: 4, label: t('user.password.strong'), color: 'bg-green-500' },
      { strength: 5, label: t('user.password.veryStrong'), color: 'bg-green-600' }
    ];
    
    return levels[score] || levels[0];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const result = await register({
      username: formData.username,
      email: formData.email,
      password: formData.password,
      displayName: formData.displayName || formData.username
    });
    
    if (result.success) {
      onClose?.();
    }
  };

  const passwordStrength = getPasswordStrength();

  return (
    <div className="max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <UserPlus className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('user.register.title')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {t('user.register.subtitle')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Username Field */}
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('user.fields.username')} *
          </label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              ${validationErrors.username ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder={t('user.placeholders.username')}
            disabled={loading}
          />
          {validationErrors.username && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.username}
            </p>
          )}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('user.fields.email')} *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              ${validationErrors.email ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder={t('user.placeholders.email')}
            disabled={loading}
          />
          {validationErrors.email && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.email}
            </p>
          )}
        </div>

        {/* Display Name Field */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('user.fields.displayName')} ({t('user.optional')})
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className={`
              w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
              dark:bg-gray-800 dark:border-gray-600 dark:text-white
              ${validationErrors.displayName ? 'border-red-500' : 'border-gray-300'}
            `}
            placeholder={t('user.placeholders.displayName')}
            disabled={loading}
          />
          {validationErrors.displayName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.displayName}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('user.fields.password')} *
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
                dark:bg-gray-800 dark:border-gray-600 dark:text-white
                ${validationErrors.password ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder={t('user.placeholders.password')}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
                <span>{t('user.password.strength')}</span>
                <span className="font-medium">{passwordStrength.label}</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                  style={{ width: `${(passwordStrength.strength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
          
          {validationErrors.password && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.password}
            </p>
          )}
        </div>

        {/* Confirm Password Field */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t('user.fields.confirmPassword')} *
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              className={`
                w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 
                dark:bg-gray-800 dark:border-gray-600 dark:text-white
                ${validationErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}
              `}
              placeholder={t('user.placeholders.confirmPassword')}
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            
            {/* Password Match Indicator */}
            {formData.confirmPassword && formData.password && (
              <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
                {formData.password === formData.confirmPassword ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                )}
              </div>
            )}
          </div>
          {validationErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.confirmPassword}
            </p>
          )}
        </div>

        {/* Terms and Privacy */}
        <div className="space-y-4">
          <label className="flex items-start">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('user.register.agreeToTerms')}{' '}
              <button type="button" className="text-green-600 hover:text-green-500 font-medium">
                {t('user.register.termsOfService')}
              </button>
            </span>
          </label>
          {validationErrors.agreeToTerms && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.agreeToTerms}
            </p>
          )}
          
          <label className="flex items-start">
            <input
              type="checkbox"
              name="agreeToPrivacy"
              checked={formData.agreeToPrivacy}
              onChange={handleInputChange}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
              disabled={loading}
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              {t('user.register.agreeToPrivacy')}{' '}
              <button type="button" className="text-green-600 hover:text-green-500 font-medium">
                {t('user.register.privacyPolicy')}
              </button>
            </span>
          </label>
          {validationErrors.agreeToPrivacy && (
            <p className="text-sm text-red-600 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              {validationErrors.agreeToPrivacy}
            </p>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-200'
            }
            text-white
          `}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              {t('user.register.creating')}
            </div>
          ) : (
            t('user.register.createAccount')
          )}
        </button>

        {/* Switch to Login */}
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('user.register.hasAccount')}{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-green-600 hover:text-green-500 font-medium"
              disabled={loading}
            >
              {t('user.register.signIn')}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default RegisterForm;