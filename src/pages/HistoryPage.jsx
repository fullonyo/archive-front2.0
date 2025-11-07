import { History } from 'lucide-react';
import ComingSoon from '../components/common/ComingSoon';
import { useTranslation } from '../hooks/useTranslation';

const HistoryPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.history')} 
      icon={History}
    />
  );
};

export default HistoryPage;
