# Boas Práticas - Archive Nyo Frontend

> Guidelines e boas práticas para manter a qualidade do código

## 📋 Índice

1. [Componentes React](#componentes-react)
2. [Hooks](#hooks)
3. [Estado](#estado)
4. [Performance](#performance)
5. [CSS e Estilização](#css-e-estilização)
6. [Acessibilidade](#acessibilidade)
7. [Segurança](#segurança)
8. [Git e Versionamento](#git-e-versionamento)

---

## 🧩 Componentes React

### ✅ DO - Faça

```jsx
// ✅ Componentes pequenos e focados
const UserAvatar = ({ user }) => (
  <img src={user.avatar} alt={user.name} />
);

// ✅ Destructuring de props
const Card = ({ title, description, onClick }) => {
  return <div onClick={onClick}>...</div>;
};

// ✅ Default props quando apropriado
const Button = ({ variant = 'primary', children }) => {
  return <button className={variant}>{children}</button>;
};

// ✅ Early return para condições
const UserProfile = ({ user }) => {
  if (!user) return <EmptyState />;
  if (user.isLoading) return <Skeleton />;
  return <Profile user={user} />;
};

// ✅ Composição sobre herança
const Layout = ({ children }) => (
  <div className="layout">
    <Header />
    {children}
    <Footer />
  </div>
);
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Componentes muito grandes
const MegaComponent = () => {
  // 500+ linhas de código
  // Múltiplas responsabilidades
  // Difícil de testar e manter
};

// ❌ Lógica complexa no JSX
return (
  <div>
    {items.filter(i => i.active).map(i => 
      i.type === 'special' ? <Special /> : <Normal />
    )}
  </div>
);
// ✅ Extraia para função helper
const getFilteredItems = () => items.filter(i => i.active);
const renderItem = (item) => 
  item.type === 'special' ? <Special /> : <Normal />;

// ❌ Manipulação direta do DOM
document.getElementById('element').style.display = 'none';
// ✅ Use estado e refs
const [show, setShow] = useState(true);

// ❌ Props com nomes genéricos
<Component data={data} onClick={onClick} />
// ✅ Props descritivas
<UserCard user={user} onUserClick={handleUserClick} />
```

---

## 🎣 Hooks

### ✅ DO - Faça

```jsx
// ✅ Hooks no topo do componente
const Component = () => {
  const { t } = useTranslation();
  const [state, setState] = useState();
  const ref = useRef();
  
  // ... resto do código
};

// ✅ Dependências corretas no useEffect
useEffect(() => {
  fetchData(userId);
}, [userId]); // ✅ Inclui todas as dependências

// ✅ Cleanup de effects
useEffect(() => {
  const subscription = api.subscribe();
  return () => subscription.unsubscribe();
}, []);

// ✅ useCallback para funções passadas como props
const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

// ✅ useMemo para cálculos custosos
const expensiveValue = useMemo(() => {
  return items.reduce((acc, item) => acc + item.value, 0);
}, [items]);

// ✅ Custom hooks para lógica reutilizável
const useWindowSize = () => {
  const [size, setSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });
  
  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  return size;
};
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Hooks condicionais
if (condition) {
  const [state, setState] = useState(); // ❌ Erro!
}

// ❌ Hooks em loops
for (let i = 0; i < items.length; i++) {
  useEffect(() => {}); // ❌ Erro!
}

// ❌ Dependências faltando
useEffect(() => {
  fetchData(userId); // ❌ userId não está nas dependências
}, []);

// ❌ useEffect sem cleanup
useEffect(() => {
  const interval = setInterval(() => {
    updateData();
  }, 1000);
  // ❌ Falta cleanup - memory leak!
}, []);

// ❌ Usar useState para valores derivados
const [total, setTotal] = useState(0);
useEffect(() => {
  setTotal(items.reduce((a, b) => a + b.price, 0));
}, [items]);
// ✅ Use useMemo
const total = useMemo(() => 
  items.reduce((a, b) => a + b.price, 0), [items]
);
```

---

## 📦 Estado

### ✅ DO - Faça

```jsx
// ✅ Estado local quando possível
const Component = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Usado apenas neste componente
};

// ✅ Lift state up quando necessário
const Parent = () => {
  const [sharedState, setSharedState] = useState();
  return (
    <>
      <ChildA state={sharedState} />
      <ChildB setState={setSharedState} />
    </>
  );
};

// ✅ Context para estado global
const ThemeContext = createContext();

// ✅ Atualizações imutáveis
setUser(prev => ({ ...prev, name: 'New Name' }));
setItems(prev => [...prev, newItem]);
setItems(prev => prev.filter(i => i.id !== id));

// ✅ Batch updates quando possível
const handleMultipleUpdates = () => {
  setState1(value1);
  setState2(value2);
  setState3(value3);
  // React agrupa automaticamente
};

// ✅ Normalize data structures
const [usersById, setUsersById] = useState({
  '1': { id: '1', name: 'John' },
  '2': { id: '2', name: 'Jane' }
});
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Mutar estado diretamente
state.value = 'new'; // ❌
setState(state); // ❌

// ❌ Estado redundante
const [items, setItems] = useState([]);
const [itemCount, setItemCount] = useState(0); // ❌ Derivável!
// ✅ Derive do estado existente
const itemCount = items.length;

// ❌ Estado para props
const Component = ({ user }) => {
  const [userState, setUserState] = useState(user); // ❌
  // Props já estão disponíveis!
};

// ❌ Over-engineering state
// Não use Context/Redux para tudo
// Estado local é suficiente para muitos casos
```

---

## ⚡ Performance

### ✅ DO - Faça

```jsx
// ✅ Code splitting
const HeavyComponent = lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <HeavyComponent />
</Suspense>

// ✅ Memoize componentes custosos
const ExpensiveComponent = memo(({ data }) => {
  // Renderização custosa
  return <div>{processData(data)}</div>;
});

// ✅ Virtualização para listas grandes
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={1000}
  itemSize={50}
>
  {Row}
</FixedSizeList>

// ✅ Debounce para inputs de busca
const debouncedSearch = useMemo(
  () => debounce((value) => search(value), 300),
  []
);

// ✅ Lazy loading de imagens
<img 
  loading="lazy"
  src={imageSrc}
  alt={alt}
/>

// ✅ Bundle splitting
// vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom'],
        utils: ['lodash', 'axios']
      }
    }
  }
}
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Re-renderizações desnecessárias
const Parent = () => {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <button onClick={() => setCount(count + 1)}>+</button>
      <ExpensiveChild /> {/* Re-renderiza toda vez! */}
    </div>
  );
};
// ✅ Use memo
const ExpensiveChild = memo(() => <div>...</div>);

// ❌ Criar objetos/arrays em render
<Component 
  config={{ option: true }} // ❌ Novo objeto toda vez!
  items={[1, 2, 3]} // ❌ Novo array toda vez!
/>
// ✅ Defina fora ou use useMemo
const config = useMemo(() => ({ option: true }), []);

// ❌ Inline functions em loops
{items.map(item => (
  <Item onClick={() => handle(item.id)} /> // ❌
))}
// ✅ Extract component ou use useCallback
```

---

## 🎨 CSS e Estilização

### ✅ DO - Faça

```jsx
// ✅ Use Tailwind classes utilitárias
<div className="flex items-center gap-4 p-4 bg-surface-float rounded-lg">

// ✅ Mobile-first approach
<div className="
  flex flex-col     // Base: mobile
  md:flex-row      // Tablet+
  lg:gap-6         // Desktop
">

// ✅ Classes semânticas customizadas
// index.css
.btn {
  @apply px-4 py-2 rounded-lg font-medium;
}

// ✅ CSS variables para temas
:root {
  --color-primary: #2563eb;
}

// ✅ Conditional classes com clsx
import clsx from 'clsx';

className={clsx(
  'base-class',
  isActive && 'active-class',
  { 'error': hasError }
)}

// ✅ Consistent spacing (4px grid)
p-2  // 8px
p-4  // 16px
p-6  // 24px
p-8  // 32px
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Inline styles excessivos
<div style={{ 
  display: 'flex', 
  padding: '16px',
  backgroundColor: '#1C1F26'
}}>
// ✅ Use Tailwind
<div className="flex p-4 bg-surface-float">

// ❌ !important
.class {
  color: red !important; // ❌
}

// ❌ Valores hardcoded
<div className="w-[373px]"> // ❌
// ✅ Use do design system
<div className="w-96"> // 24rem = 384px

// ❌ Mixing CSS modules com Tailwind desnecessariamente
import styles from './Component.module.css';
<div className={styles.container} /> // ❌ Se pode usar Tailwind

// ❌ Classes muito específicas
.user-profile-card-header-title-text {} // ❌
// ✅ Use componentes e Tailwind
```

---

## ♿ Acessibilidade

### ✅ DO - Faça

```jsx
// ✅ Semantic HTML
<header>
  <nav>
    <main>
      <article>
        <footer>

// ✅ ARIA labels
<button aria-label="Fechar modal">
  <X size={20} />
</button>

// ✅ Keyboard navigation
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyPress={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>

// ✅ Focus management
const inputRef = useRef();

useEffect(() => {
  if (isOpen) {
    inputRef.current?.focus();
  }
}, [isOpen]);

// ✅ Alt text para imagens
<img 
  src={user.avatar} 
  alt={`Avatar de ${user.name}`}
/>

// ✅ aria-current para navegação
<a 
  href="/page"
  aria-current={isActive ? 'page' : undefined}
>

// ✅ Loading states visíveis
<button disabled={loading}>
  {loading ? 'Carregando...' : 'Enviar'}
</button>

// ✅ Contraste adequado
// Use as cores do design system que já foram testadas
```

### ❌ DON'T - Não Faça

```jsx
// ❌ Divs para tudo
<div onClick={handleClick}>Click</div>
// ✅ Use button
<button onClick={handleClick}>Click</button>

// ❌ Sem alt em imagens
<img src={src} /> // ❌

// ❌ onClick sem keyboard support
<div onClick={handleClick}>
// ✅ Adicione onKeyPress ou use <button>

// ❌ Placeholder como label
<input placeholder="Nome" /> // ❌
// ✅ Use label
<label>
  Nome
  <input type="text" />
</label>

// ❌ Cores apenas para informação
<span className="text-red-500">Erro!</span>
// ✅ Adicione ícone ou texto
<span className="text-red-500">
  <AlertCircle size={16} />
  Erro!
</span>
```

---

## 🔒 Segurança

### ✅ DO - Faça

```jsx
// ✅ Sanitize user input
import DOMPurify from 'dompurify';

const cleanHTML = DOMPurify.sanitize(userInput);

// ✅ Validate data
const validateEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

// ✅ Use HTTPS para APIs
const API_URL = 'https://api.example.com';

// ✅ Não expor secrets no frontend
// Use variáveis de ambiente
const API_KEY = import.meta.env.VITE_API_KEY;

// ✅ Content Security Policy
// index.html
<meta http-equiv="Content-Security-Policy" content="...">

// ✅ Escape user content
{/* React já faz escape automático */}
<div>{userContent}</div>
```

### ❌ DON'T - Não Faça

```jsx
// ❌ dangerouslySetInnerHTML sem sanitização
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ❌ Secrets no código
const API_KEY = 'sk-abc123...'; // ❌ NUNCA!

// ❌ eval() ou new Function()
eval(userCode); // ❌ MUITO PERIGOSO!

// ❌ Confiar em dados do cliente
// Sempre valide no backend também

// ❌ localStorage para dados sensíveis
localStorage.setItem('password', pass); // ❌
```

---

## 🌳 Git e Versionamento

### ✅ DO - Faça

```bash
# ✅ Commits atômicos e descritivos
git commit -m "feat: adiciona componente AssetCard"
git commit -m "fix: corrige bug no infinite scroll"
git commit -m "style: ajusta espaçamento do header"

# ✅ Conventional Commits
feat:     # Nova feature
fix:      # Bug fix
docs:     # Documentação
style:    # Formatação
refactor: # Refatoração
perf:     # Performance
test:     # Testes
chore:    # Build, deps

# ✅ Branches descritivas
feature/asset-upload
fix/sidebar-mobile
refactor/api-service

# ✅ Pull requests pequenos
# Foque em uma feature/fix por vez

# ✅ Code review checklist
- [ ] Código funciona
- [ ] Testes passam
- [ ] Sem console.logs
- [ ] Segue padrões
- [ ] Acessível
- [ ] Responsivo
```

### ❌ DON'T - Não Faça

```bash
# ❌ Commits genéricos
git commit -m "fix"
git commit -m "update"
git commit -m "wip"

# ❌ Commits muito grandes
# Alterações em 50+ arquivos

# ❌ Commitar código comentado
// const oldCode = () => {};
// function deprecated() {}

# ❌ Commitar console.logs
console.log('debug:', data); // ❌

# ❌ Commitar .env ou secrets
.env
*.key
secrets.json
```

---

## 📋 Checklist de PR

Antes de abrir um Pull Request:

### Código
- [ ] Código segue os padrões do projeto
- [ ] Sem console.logs ou debuggers
- [ ] Sem código comentado
- [ ] Variáveis e funções bem nomeadas
- [ ] Componentes pequenos e focados
- [ ] Props com PropTypes/TypeScript

### Funcionalidade
- [ ] Feature funciona como esperado
- [ ] Casos edge tratados
- [ ] Loading states implementados
- [ ] Error handling implementado
- [ ] Validações no frontend

### UI/UX
- [ ] Design seguido corretamente
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Animações suaves
- [ ] Feedback visual adequado
- [ ] Estados vazios tratados

### Tradução
- [ ] Textos em pt-BR
- [ ] Textos em en-US
- [ ] Keys organizadas corretamente

### Acessibilidade
- [ ] Semantic HTML usado
- [ ] ARIA labels quando necessário
- [ ] Keyboard navigation funciona
- [ ] Contraste adequado
- [ ] Alt text em imagens

### Performance
- [ ] Sem re-renders desnecessários
- [ ] Lazy loading quando apropriado
- [ ] Imagens otimizadas
- [ ] Bundle size OK

### Testes
- [ ] Testes unitários (quando aplicável)
- [ ] Testado em Chrome
- [ ] Testado em Firefox
- [ ] Testado em Safari/Edge

### Documentação
- [ ] README atualizado (se necessário)
- [ ] Comentários em código complexo
- [ ] JSDoc para funções públicas

---

## 🎓 Recursos de Aprendizado

### React
- [React Beta Docs](https://react.dev)
- [React Patterns](https://reactpatterns.com)
- [Kent C. Dodds Blog](https://kentcdodds.com/blog)

### Performance
- [Web.dev Performance](https://web.dev/performance/)
- [React Performance](https://react.dev/learn/render-and-commit)

### Acessibilidade
- [A11y Project](https://www.a11yproject.com)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN Accessibility](https://developer.mozilla.org/en-US/docs/Web/Accessibility)

### CSS
- [Tailwind Best Practices](https://tailwindcss.com/docs/reusing-styles)
- [CSS Tricks](https://css-tricks.com)

---

## 📝 Notas Finais

### Lembre-se:
1. **Simplicidade** > Complexidade
2. **Legibilidade** > Cleverness
3. **Consistência** > Perfeição
4. **Documentação** > Código autoexplicativo

### Quando em dúvida:
1. Consulte este documento
2. Veja exemplos no código existente
3. Pergunte ao time
4. Faça um spike/POC primeiro

### Mantenha o código:
- ✅ Simples
- ✅ Testável
- ✅ Documentado
- ✅ Acessível
- ✅ Performático

---

**"Código é lido muito mais vezes do que é escrito"**

**Mantenha-o limpo, simples e bem documentado! 🚀**
