import { UserCircle } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';
import { useTranslation } from '../../hooks/useTranslation';

const VRChatProfilePage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.vrchatProfile')} 
      icon={UserCircle}
    />
  );
};

export default VRChatProfilePage;
