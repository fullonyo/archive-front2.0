import { TrendingUp } from 'lucide-react';
import ForumListPage from './ForumListPage';
import { useTranslation } from '../../hooks/useTranslation';

const ForumPopularPage = () => {
  const { t } = useTranslation();

  return (
    <ForumListPage 
      category="popular"
      icon={TrendingUp}
      title={t('sidebar.forumPopular')}
    />
  );
};

export default ForumPopularPage;
