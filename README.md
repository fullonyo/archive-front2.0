# Archive Nyo Frontend

> Frontend moderno para a plataforma Archive Nyo, inspirado no design do daily.dev.

## � Documentação

- **[FRONTEND_PATTERNS.md](./FRONTEND_PATTERNS.md)** - Documentação completa de padrões e arquitetura
- **[QUICK_REFERENCE.md](./QUICK_REFERENCE.md)** - Referência rápida para desenvolvimento
- **[BEST_PRACTICES.md](./BEST_PRACTICES.md)** - Boas práticas e guidelines

## �🚀 Stack Tecnológica

- **React 19.1.1** - Biblioteca UI
- **Vite 7.1.7** - Build tool e dev server ultrarrápido
- **React Router v7** - Roteamento SPA
- **TailwindCSS 3.4** - Framework CSS utilitário
- **Lucide React** - Biblioteca de ícones modernos
- **Three.js** - Gráficos 3D para backgrounds animados
- **Axios** - Cliente HTTP (futuro)

## 📁 Estrutura do Projeto

```
archive-front/
├── src/
│   ├── components/
│   │   ├── assets/          # AssetCard, AssetDetailModal
│   │   ├── common/          # PageHeader, LanguageSelector, Backgrounds
│   │   └── layout/          # MainLayout, Header, Sidebar, Container
│   ├── contexts/            # LanguageContext
│   ├── hooks/               # useTranslation
│   ├── locales/             # pt-BR, en-US
│   ├── pages/               # ForYouPage, ExplorePage, etc
│   ├── config/              # Configurações (backgrounds, etc)
│   ├── App.jsx              # Componente raiz
│   ├── main.jsx             # Entry point
│   └── index.css            # Estilos globais + Tailwind
├── public/                  # Assets estáticos
├── FRONTEND_PATTERNS.md     # Documentação completa
├── QUICK_REFERENCE.md       # Referência rápida
├── BEST_PRACTICES.md        # Boas práticas
└── package.json
```

## 🔧 Como Executar

### Instalação

```bash
# Clone o repositório
git clone <repo-url>

# Entre na pasta
cd archive-front

# Instale as dependências
npm install
```

### Desenvolvimento

```bash
# Inicia servidor de desenvolvimento
npm run dev

# Acesse: http://localhost:5173
```

### Build

```bash
# Build para produção
npm run build

# Preview do build
npm run preview
```

### Linting

```bash
# Verificar código
npm run lint
```

## 🎯 Features Implementadas

### Layout e Navegação
✅ Sidebar responsiva com collapse
✅ Header com busca global
✅ Sistema de navegação com React Router
✅ Layout centralizado e responsivo
✅ Backgrounds animados (PixelBlast, GridScan)

### Componentes
✅ AssetCard com preview e ações
✅ AssetDetailModal
✅ PageHeader reutilizável
✅ LanguageSelector
✅ Loading states e skeletons

### Funcionalidades
✅ Infinite scroll
✅ Sistema de categorias
✅ Filtros e ordenação
✅ Sistema de curtidas
✅ Internacionalização (i18n)
✅ Dark theme
✅ Mobile-first responsive design

### Páginas
✅ For You (Feed personalizado)
✅ Explore (Explorar categorias)
✅ History (Histórico)
✅ Bookmarks (Salvos)
✅ My Assets (Meus assets)
✅ Forum (Popular, Support, Ideas, General)
✅ VRChat Integration (Profile, Friends, Status)

## 🌍 Internacionalização

Idiomas suportados:
- 🇧🇷 Português Brasil (padrão)
- 🇺🇸 English USA

```jsx
// Uso
const { t } = useTranslation();
<h1>{t('header.title')}</h1>
```

## 🎨 Design System

### Cores
```css
/* Surfaces */
--surface-base: #0E1217    /* Background principal */
--surface-float: #1C1F26   /* Cards, componentes */
--surface-float2: #131517  /* Backgrounds secundários */

/* Text */
--text-primary: #FFFFFF    /* Texto principal */
--text-secondary: #A8B3CF  /* Texto secundário */
--text-tertiary: #6C7586   /* Texto terciário */

/* Theme */
--theme-active: #2563eb    /* Azul ativo */
--theme-hover: #1e40af     /* Azul hover */
```

### Breakpoints
```
xs:  475px   (Small mobile)
sm:  640px   (Mobile)
md:  768px   (Tablet)
lg:  1024px  (Desktop)
xl:  1280px  (Large desktop)
2xl: 1536px  (XL desktop)
3xl: 1920px  (Ultra wide)
```

## 🧩 Principais Componentes

### Layout
- `MainLayout` - Layout principal com sidebar e header
- `Header` - Cabeçalho com busca e menu do usuário
- `Sidebar` - Menu lateral com navegação
- `Container` - Container centralizado para conteúdo

### Comuns
- `PageHeader` - Cabeçalho de página
- `LanguageSelector` - Seletor de idioma
- `PixelBlast` - Background animado principal
- `GridScan` - Background animado alternativo
- `ComingSoon` - Placeholder para páginas

### Assets
- `AssetCard` - Card de asset com preview
- `AssetDetailModal` - Modal de detalhes do asset

## 🛣️ Rotas

```
/                     - For You (Feed)
/explore              - Explorar
/history              - Histórico
/bookmarks            - Salvos
/my-assets            - Meus Assets
/forum/popular        - Fórum Popular
/forum/support        - Suporte
/forum/ideas          - Ideias
/forum/general        - Geral
/vrchat/profile       - Perfil VRChat
/vrchat/friends       - Amigos VRChat
/vrchat/status        - Status VRChat
/settings             - Configurações
/profile              - Perfil
/new-asset            - Upload Novo Asset
/search?q=query       - Busca
```

## 📋 Scripts Disponíveis

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build para produção
npm run preview   # Preview do build
npm run lint      # Verificar código com ESLint
```

## 🔜 Próximas Features

- [ ] Sistema de autenticação
- [ ] Integração com API backend
- [ ] Upload de assets
- [ ] Perfil de usuário completo
- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Tema claro (light mode)
- [ ] PWA support
- [ ] Testes (Jest/Vitest)
- [ ] TypeScript migration

## 🤝 Contribuindo

1. Leia [FRONTEND_PATTERNS.md](./FRONTEND_PATTERNS.md) para entender a arquitetura
2. Consulte [BEST_PRACTICES.md](./BEST_PRACTICES.md) antes de desenvolver
3. Use [QUICK_REFERENCE.md](./QUICK_REFERENCE.md) como referência rápida
4. Siga os padrões de commit (Conventional Commits)
5. Abra um PR com descrição clara

### Padrão de Commits

```
feat: adiciona novo componente
fix: corrige bug no sidebar
style: ajusta espaçamento
refactor: reorganiza estrutura
docs: atualiza documentação
perf: otimiza performance
test: adiciona testes
chore: atualiza dependências
```

## 📖 Recursos

- [Documentação React](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [TailwindCSS](https://tailwindcss.com)
- [React Router](https://reactrouter.com)
- [Lucide Icons](https://lucide.dev)

## 📄 Licença

Este projeto é proprietário e confidencial.

---

**Desenvolvido com ❤️ para a comunidade VRChat**
