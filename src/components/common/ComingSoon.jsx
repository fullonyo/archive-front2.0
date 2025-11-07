import { Construction } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ComingSoon = ({ title, icon: Icon = Construction }) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-8">
      <div className="text-center space-y-4 max-w-md">
        <div className="flex justify-center">
          <div className="p-6 bg-surface-float rounded-full">
            <Icon size={64} className="text-theme-active" />
          </div>
        </div>
        
        {title && (
          <h1 className="text-3xl font-bold text-text-primary">
            {title}
          </h1>
        )}
        
        <p className="text-xl text-text-secondary">
          {t('common.comingSoon')}
        </p>
        
        <p className="text-text-tertiary">
          {t('common.comingSoonDescription')}
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
