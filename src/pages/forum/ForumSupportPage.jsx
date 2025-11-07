import { HelpCircle } from 'lucide-react';
import ForumListPage from './ForumListPage';
import { useTranslation } from '../../hooks/useTranslation';

const ForumSupportPage = () => {
  const { t } = useTranslation();

  return (
    <ForumListPage 
      category="support"
      icon={HelpCircle}
      title={t('sidebar.forumSupport')}
    />
  );
};

export default ForumSupportPage;
