import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * StatsCard - Card de estatísticas reutilizável
 * Usado em: Overview, Analytics, Dashboard
 */
const StatsCard = ({ 
  title, 
  value, 
  icon: Icon, 
  trend, // { value: '+12%', direction: 'up' | 'down' | 'neutral' }
  subtitle,
  className = '',
  loading = false
}) => {
  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp size={14} className="text-green-500" />;
      case 'down':
        return <TrendingDown size={14} className="text-red-500" />;
      default:
        return <Minus size={14} className="text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return '';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-500';
      case 'down':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  if (loading) {
    return (
      <div className={`bg-surface-float border border-white/10 rounded-xl p-4 ${className}`}>
        <div className="animate-pulse">
          <div className="h-4 bg-surface-float2 rounded w-24 mb-3" />
          <div className="h-8 bg-surface-float2 rounded w-20 mb-2" />
          <div className="h-3 bg-surface-float2 rounded w-16" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-float border border-white/10 rounded-xl p-4 hover:border-white/20 transition-colors ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-text-secondary font-medium">
          {title}
        </span>
        {Icon && (
          <div className="p-2 rounded-lg bg-theme-active/10">
            <Icon size={18} className="text-theme-active" />
          </div>
        )}
      </div>

      {/* Value */}
      <div className="mb-2">
        <span className="text-2xl font-bold text-text-primary">
          {value}
        </span>
      </div>

      {/* Trend & Subtitle */}
      <div className="flex items-center gap-2 text-xs">
        {trend && (
          <div className={`flex items-center gap-1 font-medium ${getTrendColor()}`}>
            {getTrendIcon()}
            <span>{trend.value}</span>
          </div>
        )}
        {subtitle && (
          <span className="text-text-tertiary">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
