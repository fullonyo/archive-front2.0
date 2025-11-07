import { FolderOpen } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const MyAssetsPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.myAssets')} 
      icon={FolderOpen}
    />
  );
};

export default MyAssetsPage;
