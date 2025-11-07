# Padrões do Frontend - Archive Nyo

> Documentação completa dos padrões, convenções e arquitetura do projeto frontend.
> Data: 7 de Novembro de 2025

---

## 📋 Índice

1. [Stack Tecnológica](#stack-tecnológica)
2. [Arquitetura](#arquitetura)
3. [Estrutura de Pastas](#estrutura-de-pastas)
4. [Padrões de Código](#padrões-de-código)
5. [Estilização](#estilização)
6. [Componentes](#componentes)
7. [Roteamento](#roteamento)
8. [Internacionalização](#internacionalização)
9. [Estado e Contextos](#estado-e-contextos)
10. [Performance](#performance)
11. [Acessibilidade](#acessibilidade)
12. [Convenções de Nomenclatura](#convenções-de-nomenclatura)

---

## 🚀 Stack Tecnológica

### Dependências Principais
```json
{
  "react": "^19.1.1",
  "react-dom": "^19.1.1",
  "react-router-dom": "^7.9.5",
  "axios": "^1.13.2",
  "lucide-react": "^0.552.0",
  "three": "^0.181.0",
  "postprocessing": "^6.37.8"
}
```

### Build Tools
- **Vite 7.1.7** - Build tool e dev server
- **ESLint 9.36** - Linting
- **PostCSS 8.5.6** - Processamento CSS
- **Tailwind CSS 3.4.18** - Framework CSS

### Utilitários
- **clsx** - Manipulação de classes CSS
- **tailwind-merge** - Merge inteligente de classes Tailwind
- **react-window** - Virtualização de listas
- **react-icons** - Biblioteca complementar de ícones

---

## 🏗️ Arquitetura

### Padrão Arquitetural
- **Component-Based Architecture**
- **Feature-Based Organization**
- **Separation of Concerns**

### Princípios Seguidos
1. **DRY** (Don't Repeat Yourself)
2. **KISS** (Keep It Simple, Stupid)
3. **Single Responsibility**
4. **Composition over Inheritance**

### Fluxo de Dados
```
User Interaction
    ↓
Component Event Handler
    ↓
Context/State Update
    ↓
Re-render Components
    ↓
UI Update
```

---

## 📁 Estrutura de Pastas

```
archive-front/
├── public/                    # Arquivos estáticos
├── src/
│   ├── assets/               # Imagens, fontes, etc
│   ├── components/           # Componentes React
│   │   ├── assets/          # Componentes de assets
│   │   ├── common/          # Componentes comuns
│   │   └── layout/          # Componentes de layout
│   ├── config/              # Configurações
│   │   ├── backgrounds.js   # Config de backgrounds
│   │   ├── gridScan.config.js
│   │   ├── pixelBlast.config.js
│   │   └── index.js
│   ├── contexts/            # React Contexts
│   ├── hooks/               # Custom Hooks
│   ├── locales/             # Traduções
│   │   ├── pt-BR.js
│   │   ├── en-US.js
│   │   └── index.js
│   ├── pages/               # Páginas/Views
│   ├── services/            # Serviços de API (futuro)
│   ├── utils/               # Utilitários (futuro)
│   ├── App.jsx              # Componente raiz
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── eslint.config.js
└── postcss.config.js
```

### Convenções de Nomenclatura de Pastas
- **lowercase** para configs e utilitários
- **PascalCase** para componentes (.jsx)
- **camelCase** para arquivos JavaScript (.js)

---

## 💻 Padrões de Código

### Componentes React

#### 1. Estrutura Padrão de Componente
```jsx
import { useState, useEffect } from 'react';
import { IconName } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';

const ComponentName = ({ prop1, prop2 }) => {
  // 1. Hooks de contexto/tradução
  const { t } = useTranslation();
  
  // 2. Estados locais
  const [state, setState] = useState(initialValue);
  
  // 3. Refs
  const ref = useRef(null);
  
  // 4. Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // 5. Handlers
  const handleEvent = () => {
    // Handler logic
  };
  
  // 6. Render helpers
  const renderHelper = () => {
    return <div>Helper</div>;
  };
  
  // 7. Return JSX
  return (
    <div className="component-class">
      {/* JSX content */}
    </div>
  );
};

export default ComponentName;
```

#### 2. Props Pattern
```jsx
// Com destructuring
const Component = ({ title, onClick, children }) => {
  return <div onClick={onClick}>{title}{children}</div>;
};

// Com PropTypes (quando necessário)
Component.propTypes = {
  title: PropTypes.string.isRequired,
  onClick: PropTypes.func,
  children: PropTypes.node
};

// Com default props
Component.defaultProps = {
  onClick: () => {},
  children: null
};
```

#### 3. Conditional Rendering
```jsx
// Preferir ternário para casos simples
{isLoading ? <Spinner /> : <Content />}

// Usar && para renderização condicional simples
{showModal && <Modal />}

// Usar early return para casos complexos
if (error) return <ErrorPage />;
if (loading) return <Loading />;
return <Content />;
```

#### 4. Event Handlers
```jsx
// Sempre usar prefixo "handle"
const handleClick = () => {};
const handleSubmit = (e) => {
  e.preventDefault();
};
const handleChange = (e) => {
  setValue(e.target.value);
};

// Para prevenir propagação
const handleLike = (e) => {
  e.preventDefault();
  e.stopPropagation();
  // Logic
};
```

### Hooks Customizados

#### Padrão de Hook
```javascript
// hooks/useCustomHook.js
import { useState, useEffect } from 'react';

export const useCustomHook = (initialValue) => {
  const [value, setValue] = useState(initialValue);
  
  useEffect(() => {
    // Effect logic
  }, []);
  
  return { value, setValue };
};
```

#### Hooks Existentes
- `useTranslation` - Hook de tradução
- Futuros: `useAuth`, `useAssets`, `useCategories`

### ESLint Configuration

```javascript
// Regras ativas
{
  'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]' }],
  // React Hooks regras recomendadas
  // React Refresh regras
}
```

---

## 🎨 Estilização

### TailwindCSS Configuration

#### Design Tokens

##### 1. Breakpoints
```javascript
screens: {
  'xs': '475px',
  'sm': '640px',
  'md': '768px',
  'lg': '1024px',
  'xl': '1280px',
  '2xl': '1536px',
  '3xl': '1920px',
}
```

##### 2. Cores - Sistema de Tema Dark
```javascript
colors: {
  primary: {
    50: '#f0f9ff',
    // ... até 900
  },
  surface: {
    float: '#1C1F26',   // Cards, componentes flutuantes
    float2: '#131517',  // Backgrounds secundários
    base: '#0E1217',    // Background principal
  },
  text: {
    primary: '#FFFFFF',    // Texto principal
    secondary: '#A8B3CF',  // Texto secundário
    tertiary: '#6C7586',   // Texto terciário
    disabled: '#495057',   // Texto desabilitado
  },
  theme: {
    active: '#2563eb',  // Azul ativo
    hover: '#1e40af',   // Azul hover
    label: '#1d4ed8',   // Azul labels
  }
}
```

##### 3. Animações
```javascript
animation: {
  'fade-in': 'fadeIn 0.2s ease-in-out',
  'slide-up': 'slideUp 0.3s ease-out',
  'slide-down': 'slideDown 0.3s ease-out',
}
```

##### 4. Sombras
```javascript
boxShadow: {
  'card': '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
  'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
}
```

### CSS Patterns

#### 1. Classes de Componente Base
```css
/* index.css - @layer components */

/* Botões */
.btn {
  @apply px-4 py-2 rounded-lg transition-all duration-200 font-medium;
  @apply flex items-center gap-2 justify-center;
}

.btn-primary {
  @apply bg-theme-active hover:bg-theme-hover text-white;
}

/* Navigation */
.nav-item {
  @apply flex items-center gap-3 px-3 py-2 rounded-lg;
  @apply text-text-secondary hover:text-text-primary;
  @apply hover:bg-surface-float2 transition-all duration-200;
}

.nav-item.active {
  @apply bg-theme-active/10 text-theme-active;
  @apply border-l-2 border-theme-active;
}

/* Cards */
.card {
  @apply bg-surface-float rounded-xl border border-white/5;
  @apply transition-all duration-300;
}

.card:hover {
  @apply shadow-card-hover border-white/10;
}
```

#### 2. Padrão de Classes Condicionais
```jsx
// Usando clsx ou template literals
<div className={`
  base-class
  ${condition ? 'class-true' : 'class-false'}
  ${isActive && 'active-class'}
`}>

// Usando clsx (preferido)
import clsx from 'clsx';

<div className={clsx(
  'base-class',
  condition && 'conditional-class',
  {
    'active': isActive,
    'disabled': isDisabled
  }
)}>
```

#### 3. Responsive Design Pattern
```jsx
// Mobile-first approach
<div className="
  flex flex-col        // Mobile: vertical
  md:flex-row         // Tablet+: horizontal
  lg:gap-6            // Desktop: mais espaçamento
  xl:max-w-7xl        // XL: largura máxima
">
```

### Temas CSS Variables

```css
/* Theme Dark (ativo) */
.theme-dark {
  --surface-base: 13 13 15;
  --surface-float: 20 20 23;
  --surface-float2: 28 28 32;
  --text-primary: 248 248 248;
  --text-secondary: 163 163 163;
  --text-tertiary: 115 115 115;
  --theme-active: 59 130 246;
  --theme-hover: 37 99 235;
}
```

---

## 🧩 Componentes

### Hierarquia de Componentes

```
App
└── LanguageProvider
    └── Router
        └── MainLayout
            ├── PixelBlast/GridScan (Background)
            ├── Header
            │   ├── SearchBar
            │   ├── LanguageSelector
            │   └── UserMenu
            ├── Sidebar
            │   └── Navigation Items
            └── Outlet (Pages)
                └── Page Components
                    └── Feature Components
```

### Categorias de Componentes

#### 1. Layout Components (`components/layout/`)
- **MainLayout** - Layout principal da aplicação
- **Header** - Cabeçalho com busca e ações
- **Sidebar** - Menu lateral responsivo
- **Container** - Container centralizado de conteúdo

**Padrões:**
- Sempre usar `flex` para layouts
- Implementar responsividade mobile-first
- Usar `sticky` ou `fixed` quando necessário

#### 2. Common Components (`components/common/`)
- **PageHeader** - Cabeçalho de página
- **LanguageSelector** - Seletor de idioma
- **ComingSoon** - Página "Em breve"
- **PixelBlast** - Background animado
- **GridScan** - Background animado alternativo

**Padrões:**
- Componentes totalmente reutilizáveis
- Props bem definidas
- Sem dependências de contexto (exceto tradução)

#### 3. Feature Components (`components/assets/`)
- **AssetCard** - Card de asset
- **AssetDetailModal** - Modal de detalhes

**Padrões:**
- Específicos para domínio
- Podem usar contextos específicos
- Auto-contidos com seu próprio estado

### Padrão de Composição

```jsx
// Componente Container
const AssetGrid = ({ children, title }) => (
  <div className="asset-grid">
    <h2>{title}</h2>
    {children}
  </div>
);

// Uso com composição
<AssetGrid title="Popular Assets">
  {assets.map(asset => (
    <AssetCard key={asset.id} asset={asset} />
  ))}
</AssetGrid>
```

### Background Animations Pattern

```jsx
// config/backgrounds.js
export const activeBackground = 'pixelblast'; // ou 'gridscan'

// MainLayout.jsx
const renderBackground = () => {
  switch (activeBackground) {
    case 'gridscan':
      return <GridScan {...gridScanConfig} />;
    case 'pixelblast':
    default:
      return <PixelBlast {...pixelBlastConfig} />;
  }
};
```

---

## 🛣️ Roteamento

### React Router v7 Pattern

```jsx
// App.jsx
<Router>
  <Routes>
    <Route path="/" element={<MainLayout />}>
      <Route index element={<ForYouPage />} />
      <Route path="explore" element={<ExplorePage />} />
      
      {/* Rotas agrupadas por feature */}
      <Route path="forum/popular" element={<ForumPopularPage />} />
      <Route path="forum/support" element={<ForumSupportPage />} />
      
      <Route path="vrchat/profile" element={<VRChatProfilePage />} />
      
      <Route path="settings" element={<PlaceholderPage title="Settings" />} />
    </Route>
  </Routes>
</Router>
```

### Navegação Pattern

```jsx
import { useNavigate, useLocation } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Verificar rota ativa
  const isActive = (path) => location.pathname === path;
  
  // Navegar programaticamente
  const handleNavigation = (path) => {
    navigate(path);
  };
  
  // Navegar com query params
  const handleSearch = (query) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };
};
```

### Estrutura de URLs

```
/                          - For You Page
/explore                   - Explorar
/history                   - Histórico
/bookmarks                 - Salvos
/my-assets                 - Meus Assets
/forum/popular            - Fórum Popular
/forum/support            - Fórum Suporte
/forum/ideas              - Fórum Ideias
/forum/general            - Fórum Geral
/vrchat/profile           - Perfil VRChat
/vrchat/friends           - Amigos VRChat
/vrchat/status            - Status VRChat
/settings                 - Configurações
/profile                  - Perfil
/new-asset                - Upload Novo Asset
/search?q=query           - Busca
/category/:id             - Categoria específica
```

---

## 🌍 Internacionalização

### Sistema de Tradução

#### Estrutura de Arquivos
```
locales/
├── index.js        # Export central
├── pt-BR.js        # Português Brasil
└── en-US.js        # Inglês USA
```

#### Pattern de Tradução

```javascript
// locales/pt-BR.js
export const ptBR = {
  header: {
    searchPlaceholder: 'Pesquisar assets...',
    notifications: 'Notificações',
  },
  sidebar: {
    menu: 'Menu',
    forYou: 'Para Você',
  },
  // ... nested structure
};
```

#### Context Pattern

```jsx
// contexts/LanguageContext.jsx
export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'pt-BR';
  });
  
  const changeLanguage = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };
  
  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
```

#### Hook Pattern

```javascript
// hooks/useTranslation.js
export const useTranslation = () => {
  const { language, changeLanguage } = useLanguage();
  
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key; // Fallback para a key se não encontrar
  };
  
  return { t, language, changeLanguage };
};
```

#### Uso nos Componentes

```jsx
const Component = () => {
  const { t, language, changeLanguage } = useTranslation();
  
  return (
    <div>
      <h1>{t('header.title')}</h1>
      <p>{t('common.loading')}</p>
      <button onClick={() => changeLanguage('en-US')}>
        Change to English
      </button>
    </div>
  );
};
```

### Idiomas Suportados
- **pt-BR** - Português Brasil (padrão)
- **en-US** - Inglês USA

---

## 📦 Estado e Contextos

### Context Pattern

```jsx
// contexts/ExampleContext.jsx
import { createContext, useContext, useState } from 'react';

const ExampleContext = createContext();

export const useExample = () => {
  const context = useContext(ExampleContext);
  if (!context) {
    throw new Error('useExample must be used within ExampleProvider');
  }
  return context;
};

export const ExampleProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  const actions = {
    updateState: (newState) => setState(newState),
  };
  
  return (
    <ExampleContext.Provider value={{ state, ...actions }}>
      {children}
    </ExampleContext.Provider>
  );
};
```

### Estado Local Pattern

```jsx
// Para estado simples
const [value, setValue] = useState(initialValue);

// Para objetos
const [user, setUser] = useState({
  name: '',
  email: ''
});

// Update parcial de objeto
setUser(prev => ({
  ...prev,
  name: 'New Name'
}));

// Para arrays
const [items, setItems] = useState([]);

// Adicionar item
setItems(prev => [...prev, newItem]);

// Remover item
setItems(prev => prev.filter(item => item.id !== id));

// Update item
setItems(prev => prev.map(item => 
  item.id === id ? { ...item, ...updates } : item
));
```

### Contextos Atuais
- **LanguageContext** - Gerenciamento de idioma

### Contextos Futuros (Planejados)
- **AuthContext** - Autenticação
- **AssetContext** - Estado de assets
- **ThemeContext** - Tema (dark/light)

---

## ⚡ Performance

### Patterns de Otimização

#### 1. Lazy Loading de Componentes
```jsx
import { lazy, Suspense } from 'react';

const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>
```

#### 2. Memoization
```jsx
import { memo, useMemo, useCallback } from 'react';

// Memoizar componentes
const MemoizedComponent = memo(({ prop }) => {
  return <div>{prop}</div>;
});

// Memoizar valores calculados
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(data);
}, [data]);

// Memoizar callbacks
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);
```

#### 3. Infinite Scroll Pattern
```jsx
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const observerTarget = useRef(null);

const loadMore = useCallback(() => {
  if (!hasMore || loading) return;
  // Fetch more data
}, [hasMore, loading]);

useEffect(() => {
  const observer = new IntersectionObserver(
    entries => {
      if (entries[0].isIntersecting) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );
  
  if (observerTarget.current) {
    observer.observe(observerTarget.current);
  }
  
  return () => observer.disconnect();
}, [loadMore]);
```

#### 4. Virtualização (react-window)
```jsx
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={100}
  width="100%"
>
  {({ index, style }) => (
    <div style={style}>
      {items[index]}
    </div>
  )}
</FixedSizeList>
```

### Build Optimization

```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          three: ['three', 'postprocessing'],
        }
      }
    }
  }
});
```

---

## ♿ Acessibilidade

### ARIA Patterns

```jsx
// Navegação
<nav aria-label="Menu principal">
  <button 
    aria-label="Abrir sidebar"
    aria-expanded={isOpen}
  >
    Menu
  </button>
</nav>

// Estado atual
<a 
  href="/page"
  aria-current={isActive ? 'page' : undefined}
>
  Page
</a>

// Elementos interativos
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => e.key === 'Enter' && handleClick()}
>
  Click me
</div>
```

### Keyboard Navigation

```jsx
// Suporte para Enter e Space
const handleKeyPress = (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleAction();
  }
};

// Escape para fechar modals
useEffect(() => {
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };
  
  document.addEventListener('keydown', handleEscape);
  return () => document.removeEventListener('keydown', handleEscape);
}, [onClose]);
```

### Semantic HTML

```jsx
// Usar elementos semânticos apropriados
<header>
  <nav>
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main>
  <article>
    <h1>Title</h1>
    <section>Content</section>
  </article>
</main>

<footer>
  Footer content
</footer>
```

---

## 📝 Convenções de Nomenclatura

### Arquivos

```
ComponentName.jsx          # Componentes React
utilityFunction.js         # Funções utilitárias
useCustomHook.js          # Hooks (sempre começar com 'use')
ComponentName.css         # Estilos específicos
constants.js              # Constantes
types.js                  # Type definitions (futuro)
ComponentName.test.jsx    # Testes (futuro)
```

### Variáveis e Funções

```jsx
// camelCase para variáveis e funções
const userName = 'John';
const fetchUserData = () => {};

// PascalCase para componentes e classes
const UserCard = () => {};
class UserService {}

// UPPER_SNAKE_CASE para constantes
const API_BASE_URL = 'https://api.example.com';
const MAX_RETRIES = 3;

// Prefixos para handlers
const handleClick = () => {};
const handleSubmit = () => {};
const handleChange = () => {};

// Prefixos para estados booleanos
const isLoading = true;
const hasError = false;
const canEdit = true;
const shouldShow = true;

// Prefixos para funções de checagem
const checkPermission = () => {};
const validateInput = () => {};
```

### Classes CSS

```css
/* BEM-like pattern para componentes */
.asset-card {}
.asset-card__title {}
.asset-card__image {}
.asset-card--featured {}

/* Utility classes (Tailwind) */
.btn
.nav-item
.card

/* State classes */
.is-active
.is-loading
.is-disabled
```

### Pastas

```
components/        # lowercase plural
hooks/            # lowercase plural
contexts/         # lowercase plural
pages/            # lowercase plural
services/         # lowercase plural
utils/            # lowercase plural
config/           # lowercase singular
assets/           # lowercase plural
```

---

## 🔄 Patterns de Loading e Error

### Loading States

```jsx
// Skeleton loading
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="h-40 bg-surface-float2 rounded-t-xl" />
    <div className="p-4 space-y-2">
      <div className="h-4 bg-surface-float2 rounded w-3/4" />
      <div className="h-4 bg-surface-float2 rounded w-1/2" />
    </div>
  </div>
);

// Spinner loading
const Spinner = () => (
  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-theme-active" />
);

// Conditional rendering
{loading && <Spinner />}
{loading ? <Skeleton /> : <Content />}
```

### Error Handling

```jsx
const [error, setError] = useState(null);

// Try-catch pattern
try {
  const data = await fetchData();
  setData(data);
  setError(null);
} catch (err) {
  setError(err.message);
  console.error('Error:', err);
}

// Error UI
{error && (
  <div className="error-message">
    <AlertCircle size={20} />
    <p>{error}</p>
    <button onClick={retry}>Tentar novamente</button>
  </div>
)}
```

---

## 📱 Responsive Design

### Breakpoint Strategy

```jsx
// Mobile-first approach
className="
  // Base (mobile)
  flex flex-col p-4 text-sm
  
  // Tablet (md: 768px+)
  md:flex-row md:p-6 md:text-base
  
  // Desktop (lg: 1024px+)
  lg:p-8 lg:text-lg
  
  // Large Desktop (xl: 1280px+)
  xl:max-w-7xl xl:mx-auto
"
```

### Mobile Menu Pattern

```jsx
const [isMobile, setIsMobile] = useState(false);
const [menuOpen, setMenuOpen] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (mobile && menuOpen) {
      setMenuOpen(false);
    }
  };
  
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, [menuOpen]);

// Mobile overlay
{isMobile && menuOpen && (
  <div 
    className="fixed inset-0 bg-black/50 z-40"
    onClick={() => setMenuOpen(false)}
  />
)}
```

---

## 🎯 Próximos Passos

### Features Planejadas
- [ ] Sistema de autenticação completo
- [ ] Integração com API backend
- [ ] Sistema de upload de assets
- [ ] Perfil de usuário
- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Tema claro/escuro
- [ ] PWA support

### Melhorias Técnicas
- [ ] Testes unitários (Jest/Vitest)
- [ ] Testes E2E (Playwright)
- [ ] TypeScript migration
- [ ] Error Boundary
- [ ] Service Worker
- [ ] Analytics
- [ ] SEO optimization
- [ ] Docker setup

---

## 📚 Referências

### Documentação Oficial
- [React 19 Docs](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Router v7](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

### Design System
- Inspirado em [daily.dev](https://daily.dev)
- Dark theme baseado em modern web apps
- Component library: Custom built

### Convenções de Código
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript)
- [React Best Practices](https://react.dev/learn)
- [TailwindCSS Best Practices](https://tailwindcss.com/docs/reusing-styles)

---

## 📄 Licença e Contribuição

### Padrões de Commit
```
feat: adiciona novo componente AssetCard
fix: corrige bug no sidebar mobile
style: ajusta espaçamento do header
refactor: reorganiza estrutura de pastas
docs: atualiza documentação de padrões
perf: otimiza performance do infinite scroll
test: adiciona testes para hooks
chore: atualiza dependências
```

### Code Review Checklist
- [ ] Código segue os padrões estabelecidos
- [ ] Componentes são reutilizáveis
- [ ] Classes CSS usam Tailwind quando possível
- [ ] Tradução implementada (pt-BR e en-US)
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Acessibilidade (ARIA, keyboard)
- [ ] Performance otimizada
- [ ] Sem console.logs em produção
- [ ] Variáveis e funções bem nomeadas
- [ ] Comentários apenas quando necessário

---

**Documento mantido por:** Equipe de Desenvolvimento  
**Última atualização:** 7 de Novembro de 2025  
**Versão:** 1.0.0
