import { Bookmark } from 'lucide-react';
import ComingSoon from '../../components/common/ComingSoon';
import { useTranslation } from '../../hooks/useTranslation';

const BookmarksPage = () => {
  const { t } = useTranslation();

  return (
    <ComingSoon 
      title={t('sidebar.bookmarks')} 
      icon={Bookmark}
    />
  );
};

export default BookmarksPage;
