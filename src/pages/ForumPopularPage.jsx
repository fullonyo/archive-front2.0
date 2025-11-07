import { TrendingUp } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const ForumPopularPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.forumPopular')} 
      icon={TrendingUp}
    />
  );
};

export default ForumPopularPage;
