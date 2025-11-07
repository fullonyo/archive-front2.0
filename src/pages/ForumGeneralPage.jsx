import { Hash } from 'lucide-react';
import ForumListPage from './ForumListPage';
import { useTranslation } from '../hooks/useTranslation';

const ForumGeneralPage = () => {
  const { t } = useTranslation();

  return (
    <ForumListPage 
      category="general"
      icon={Hash}
      title={t('sidebar.forumGeneral')}
    />
  );
};

export default ForumGeneralPage;
