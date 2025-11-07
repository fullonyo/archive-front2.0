import { Users } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';
import { useTranslation } from '../../hooks/useTranslation';

const VRChatFriendsPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.vrchatFriends')} 
      icon={Users}
    />
  );
};

export default VRChatFriendsPage;
