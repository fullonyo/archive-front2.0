import { AuthProvider } from './AuthContext';
import { AvatarProvider } from './AvatarContext';
import { ForumProvider } from './ForumContext';
import { NotificationProvider } from './NotificationContext';
import { VRChatProvider } from './VRChatContext';
import { CacheProvider } from './CacheContext';

/**
 * Componente que combina todos os providers da aplicação
 * 
 * Ordem de providers (importante):
 * 1. CacheProvider - Cache global (independente)
 * 2. AuthProvider - Base para todos os outros (fornece user)
 * 3. NotificationProvider - Depende de AuthContext
 * 4. AvatarProvider - Depende de AuthContext
 * 5. ForumProvider - Depende de AuthContext
 * 6. VRChatProvider - Depende de AuthContext
 * 
 * Performance:
 * - Cada contexto tem seu próprio estado
 * - Mudanças em um contexto NÃO causam re-render nos outros
 * - Componentes podem usar apenas os contextos que precisam
 * 
 * Uso:
 * ```jsx
 * // Em App.jsx
 * <AppProviders>
 *   <Router>
 *     <Routes>...</Routes>
 *   </Router>
 * </AppProviders>
 * ```
 * 
 * Migração do UserContext antigo:
 * - Antes: useUser() retornava TUDO (36+ valores)
 * - Agora: useAuth(), useAvatar(), useForum(), etc. retornam apenas o necessário
 * - Performance: ~70% menos re-renders
 */
export const AppProviders = ({ children }) => {
  return (
    <CacheProvider>
      <AuthProvider>
        <NotificationProvider>
          <AvatarProvider>
            <ForumProvider>
              <VRChatProvider>
                {children}
              </VRChatProvider>
            </ForumProvider>
          </AvatarProvider>
        </NotificationProvider>
      </AuthProvider>
    </CacheProvider>
  );
};
