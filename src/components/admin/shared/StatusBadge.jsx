import React from 'react';
import { 
  CheckCircle, XCircle, Clock, AlertCircle, 
  Shield, Crown, User, Zap, Ban, Eye, EyeOff 
} from 'lucide-react';

/**
 * StatusBadge - Componente reutilizável para exibir status com ícones
 * Usado em: Users, Assets, Reports, etc.
 * @param {string} type - Tipo do badge (ADMIN, USER, PENDING, etc)
 * @param {string} variant - Label customizado (sobrescreve o label padrão)
 * @param {string} label - Label customizado (alias para variant)
 * @param {string} size - Tamanho (sm, md, lg)
 * @param {string} className - Classes CSS adicionais
 */
const StatusBadge = ({ type, variant, label, size = 'md', className = '' }) => {
  // Tamanhos
  const sizes = {
    sm: {
      badge: 'px-2 py-0.5 text-[10px]',
      icon: 12
    },
    md: {
      badge: 'px-2.5 py-1 text-xs',
      icon: 14
    },
    lg: {
      badge: 'px-3 py-1.5 text-sm',
      icon: 16
    }
  };

  const currentSize = sizes[size] || sizes.md;

  // Configurações de badges por tipo
  const badgeConfigs = {
    // User Roles
    SISTEMA: {
      label: 'Sistema',
      icon: Zap,
      className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    },
    ADMIN: {
      label: 'Admin',
      icon: Crown,
      className: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    MODERATOR: {
      label: 'Moderator',
      icon: Shield,
      className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    CREATOR: {
      label: 'Creator',
      icon: User,
      className: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    USER: {
      label: 'User',
      icon: User,
      className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    },

    // Account Types
    FREE: {
      label: 'Free',
      icon: User,
      className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    },
    PRO: {
      label: 'Pro',
      icon: Zap,
      className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    BUSINESS: {
      label: 'Business',
      icon: Crown,
      className: 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    },

    // Status
    PENDING: {
      label: 'Pending',
      icon: Clock,
      className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    },
    APPROVED: {
      label: 'Approved',
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    REJECTED: {
      label: 'Rejected',
      icon: XCircle,
      className: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    ACTIVE: {
      label: 'Active',
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    INACTIVE: {
      label: 'Inactive',
      icon: EyeOff,
      className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    },
    BANNED: {
      label: 'Banned',
      icon: Ban,
      className: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },

    // Verification
    VERIFIED: {
      label: 'Verified',
      icon: CheckCircle,
      className: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    UNVERIFIED: {
      label: 'Unverified',
      icon: AlertCircle,
      className: 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    },

    // Category (generic badge with custom label)
    CATEGORY: {
      label: 'Category',
      icon: null,
      className: 'bg-theme-active/20 text-theme-active border border-theme-active/30'
    },

    // Simple variants (sem ícone)
    SUCCESS: {
      label: variant || 'Success',
      icon: null,
      className: 'bg-green-500/20 text-green-400 border border-green-500/30'
    },
    ERROR: {
      label: variant || 'Error',
      icon: null,
      className: 'bg-red-500/20 text-red-400 border border-red-500/30'
    },
    WARNING: {
      label: variant || 'Warning',
      icon: null,
      className: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
    },
    INFO: {
      label: variant || 'Info',
      icon: null,
      className: 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    },
    NEUTRAL: {
      label: variant || 'Neutral',
      icon: null,
      className: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
    }
  };

  const config = badgeConfigs[type] || badgeConfigs.NEUTRAL;
  const Icon = config.icon;
  
  // Prioridade: label > variant > config.label
  const displayLabel = label || variant || config.label;

  return (
    <span 
      className={`
        inline-flex items-center gap-1.5 rounded-md font-medium uppercase tracking-wide
        ${currentSize.badge}
        ${config.className}
        ${className}
      `}
    >
      {Icon && <Icon size={currentSize.icon} className="flex-shrink-0" />}
      <span>{displayLabel}</span>
    </span>
  );
};

export default StatusBadge;
