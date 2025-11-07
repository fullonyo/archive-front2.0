import { Lightbulb } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const ForumIdeasPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.forumIdeas')} 
      icon={Lightbulb}
    />
  );
};

export default ForumIdeasPage;
