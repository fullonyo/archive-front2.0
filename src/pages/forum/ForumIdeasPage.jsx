import { Lightbulb } from 'lucide-react';
import ForumListPage from './ForumListPage';
import { useTranslation } from '../../hooks/useTranslation';

const ForumIdeasPage = () => {
  const { t } = useTranslation();

  return (
    <ForumListPage 
      category="ideas"
      icon={Lightbulb}
      title={t('sidebar.forumIdeas')}
    />
  );
};

export default ForumIdeasPage;
