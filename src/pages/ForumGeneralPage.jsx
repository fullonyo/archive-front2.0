import { Hash } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const ForumGeneralPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.forumGeneral')} 
      icon={Hash}
    />
  );
};

export default ForumGeneralPage;
