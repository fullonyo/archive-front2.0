import { Activity } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const VRChatStatusPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.vrchatStatus')} 
      icon={Activity}
    />
  );
};

export default VRChatStatusPage;
