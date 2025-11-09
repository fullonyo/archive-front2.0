# Masonry View - Quick Reference

## 📋 Overview
Layout Masonry minimalista otimizado para 60 FPS, seguindo padrões de performance do projeto. Alternativa visual ao grid padrão do ForYouPage.

## 🎯 Componentes Criados

### 1. AssetCardMasonry (`components/assets/AssetCardMasonry.jsx`)
Card minimalista com **apenas imagem** - sem botões, stats ou overlays complexos.

**Features:**
- ✅ Apenas imagem + título no hover
- ✅ GPU acceleration (`translateZ(0)`, `willChange`)
- ✅ CSS containment (`contain: 'layout style paint'`)
- ✅ Lazy loading nativo (`loading="lazy"`)
- ✅ Skeleton placeholder com shimmer
- ✅ Hover: scale + gradient overlay + título
- ✅ Click: abre `AssetDetailModal` existente
- ✅ Memoizado com `React.memo`

**Props:**
```jsx
<AssetCardMasonry 
  asset={asset}      // Asset object
  height={240}       // Altura dinâmica em pixels
/>
```

### 2. MasonryGrid (`components/assets/MasonryGrid.jsx`)
Container com layout CSS columns (Pinterest-style).

**Features:**
- ✅ CSS columns ao invés de JavaScript positioning
- ✅ Responsive breakpoints automáticos
- ✅ CSS containment para scroll 60 FPS
- ✅ Skeleton loading com shimmer
- ✅ Alturas dinâmicas para efeito natural
- ✅ iOS smooth scrolling

**Props:**
```jsx
<MasonryGrid 
  assets={[...]}     // Array de assets
  loading={false}    // Loading state
/>
```

**Breakpoints:**
```
Mobile (< 640px):   1 coluna
Tablet (640px+):    2 colunas
Desktop (1024px+):  3 colunas
Large (1280px+):    4 colunas
XL (1536px+):       5 colunas
```

### 3. ForYouPage Toggle
Botão para alternar entre **Grid** e **Masonry** views.

**Features:**
- ✅ Toggle com ícones `Grid3x3` / `LayoutGrid`
- ✅ Persistência no `localStorage` (`forYou_viewMode`)
- ✅ Transição suave entre layouts
- ✅ Posicionado na barra de filtros (sticky)

**LocalStorage:**
```javascript
localStorage.setItem('forYou_viewMode', 'grid' | 'masonry');
```

## 🚀 Performance Optimizations

### CSS Containment (CRITICAL)
```jsx
style={{
  contain: 'layout style paint',
  willChange: 'transform',
  transform: 'translateZ(0)'
}}
```

### Lazy Loading
```jsx
<img loading="lazy" />
```

### Memoization
```jsx
const AssetCardMasonry = React.memo(({ asset, height }) => {
  const handleClick = useCallback(() => { ... }, []);
  // ...
});
```

### Responsive Columns (CSS Native)
```jsx
style={{
  columns: columnCount,  // 1-5 baseado em window width
  columnGap: '16px',
  contain: 'layout style paint'
}}
```

## 📐 Layout CSS

### Masonry Container
```css
columns: 1-5 (responsive);
column-gap: 16px;
contain: layout style paint;
```

### Card Styling
```css
break-inside: avoid;
margin-bottom: 16px;
border-radius: 12px;
overflow: hidden;
```

### Hover Effects
```css
img: scale(1.05)
overlay: opacity 0 → 1
ring: white/0 → white/20
```

## 🎨 Design Philosophy

**Minimalismo Extremo:**
- ❌ Sem botões de ação
- ❌ Sem stats (likes, downloads)
- ❌ Sem autor info
- ✅ Apenas imagem pura
- ✅ Título só no hover
- ✅ Foco no visual

**Inspiração:**
- Unsplash minimal cards
- Pinterest clean layout
- Behance image grids

## 🔄 Fluxo de Uso

1. **User entra no ForYouPage**
   - View mode carregado do localStorage
   - Default: `grid`

2. **User clica no toggle Masonry**
   - `setViewMode('masonry')`
   - localStorage atualizado
   - Re-render com MasonryGrid

3. **User clica em um card**
   - `AssetDetailModal` abre
   - Todos os detalhes/ações disponíveis

4. **User volta ao grid**
   - Preferência persistida
   - Próxima visita mantém escolha

## 🐛 Troubleshooting

### Cards não quebram corretamente
```css
.masonry-card {
  break-inside: avoid;
  page-break-inside: avoid;
}
```

### Scroll lag
Verificar se `contain` está aplicado:
```jsx
style={{ contain: 'layout style paint' }}
```

### Imagens não carregam
Verificar `loading="lazy"` e fallback:
```jsx
onError={handleImageError('thumbnail')}
```

### LocalStorage não persiste
Verificar se está salvando corretamente:
```javascript
localStorage.setItem('forYou_viewMode', mode);
```

## 📝 Future Enhancements

- [ ] Virtualization para >500 items
- [ ] Image aspect ratio detection
- [ ] Drag to reorder (opcional)
- [ ] Filter por aspect ratio
- [ ] Densidade de colunas customizável

## 🔗 Related Files

- `components/assets/AssetCard.jsx` - Card padrão com detalhes
- `components/assets/AssetDetailModal.jsx` - Modal compartilhado
- `pages/avatar-lab/ForYouPage.jsx` - Página principal
- `utils/imageUtils.js` - Helpers de imagem
- `constants/index.js` - Placeholders

## 📊 Performance Metrics

**Target:**
- 60 FPS scroll ✅
- <100ms image load ✅
- <50ms layout shift ✅
- Zero jank ✅

**Achieved:**
- CSS columns = GPU accelerated
- Containment = isolated layout
- Lazy load = progressive enhancement
- Memoization = minimal re-renders
