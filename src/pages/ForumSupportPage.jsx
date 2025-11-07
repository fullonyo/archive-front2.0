import { HelpCircle } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const ForumSupportPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.forumSupport')} 
      icon={HelpCircle}
    />
  );
};

export default ForumSupportPage;
