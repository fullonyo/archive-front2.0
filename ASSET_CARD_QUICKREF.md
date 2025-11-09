# AssetCard - Quick Reference Guide

## 🎯 Action System

### Hierarquia de Botões

```
PRIMARY (CTA Principal)
├─ Download
│  ├─ Posição: Centro (flex-1)
│  ├─ Visual: btn-primary (gradient)
│  ├─ Icon: 16px, strokeWidth 2.5
│  └─ States: default, hover, active, loading

SECONDARY (Quick Actions)
├─ Bookmark (Quick Save)
│  ├─ Posição: Direita do Download
│  ├─ Visual: Toggle (black/90 ↔ blue-500)
│  ├─ Icons: Bookmark → BookmarkCheck
│  └─ Diferença: 1-click save pessoal

TERTIARY (Advanced Actions)
├─ Save to Collection
│  ├─ Posição: Extrema direita
│  ├─ Visual: Icon-only (FolderPlus)
│  └─ Função: Organizar em pastas

PASSIVE (Always Visible)
├─ Like
│  ├─ Posição: Top-right
│  ├─ Visual: Toggle (black/90 ↔ red-500)
│  └─ Comportamento: Não compete com CTA
```

---

## 📐 Layout Structure

```jsx
<article>
  {/* THUMBNAIL LAYER */}
  <div className="thumbnail-container">
    <img aspectRatio="16/9" />
    
    {/* Top Bar - Sempre visível */}
    <div className="absolute top-0">
      <Badge>[Category/Status]</Badge>
      <ButtonLike />
    </div>
    
    {/* Action Bar - Hover (desktop) / Sempre (mobile) */}
    <div className="absolute bottom-0 hover:slide-up">
      <ButtonBookmark />
      <ButtonDownload /> {/* PRIMARY */}
      <ButtonCollection />
    </div>
  </div>

  {/* CONTENT LAYER */}
  <div className="p-3">
    <h3>Title</h3>
    <AuthorInfo />
    <Stats />
  </div>
</article>
```

---

## 🎨 Visual Tokens

### Colors
```css
/* Backgrounds */
--card-bg: bg-surface-float2
--overlay-bg: bg-black/90 + backdrop-blur-xl
--gradient: from-black/80 via-black/20 to-transparent

/* States */
--primary: bg-theme-active (blue/purple)
--liked: bg-red-500/95
--bookmarked: bg-blue-500/95
--neutral: bg-black/90

/* Text */
--title: text-text-primary (hover: theme-active)
--author: text-text-secondary
--stats: text-text-tertiary
```

### Spacing
```css
/* Card */
padding: 12px (p-3)

/* Thumbnail */
aspect-ratio: 16/9
height: auto (flexible)

/* Gaps */
action-gap: 8px (gap-2)
stats-gap: 14px (gap-3.5)
```

### Typography
```css
/* Title */
font-size: 14px (text-sm)
font-weight: 600 (semibold)
line-height: tight

/* Author */
font-size: 12px (text-xs)
font-weight: 500 (medium)

/* Stats */
font-size: 12px (text-xs)
font-weight: 500 (medium)
font-variant-numeric: tabular-nums
```

---

## ⚡ Performance Checklist

### CSS Containment
```jsx
// Card root
style={{
  contain: 'layout style paint',
  willChange: 'transform',
  transform: 'translateZ(0)'
}}

// Thumbnail container
style={{
  aspectRatio: '16/9',
  contain: 'layout style'
}}

// Action bar
style={{
  contain: 'layout style',
  willChange: 'transform'
}}
```

### Image Optimization
```jsx
<img
  loading="lazy"              // ✅ Native lazy load
  style={{ aspectRatio }}     // ✅ Prevent layout shift
  onError={handleImageError}  // ✅ Fallback
/>
```

### Event Handler Memoization
```jsx
// ✅ All handlers wrapped in useCallback
const handleLike = useCallback(async (e) => {
  // Prevent double-click
  if (isLiking) return;
  
  // Optimistic update
  setIsLiked(!isLiked);
  
  // API call with rollback
  try {
    await api.post(`/api/assets/${id}/like`);
  } catch (error) {
    setIsLiked(isLiked); // Rollback
  }
}, [isLiking, isLiked, id]);
```

---

## ♿ Accessibility Checklist

### Keyboard Navigation
- [x] `role="button"` no card
- [x] `tabIndex={0}` para focável
- [x] `onKeyDown` (Enter/Space)
- [x] Focus states visíveis

### ARIA Labels
```jsx
// Card
aria-label="View details for {title} by {author}"
aria-expanded={showModal}

// Buttons
aria-label="Download {title}"
aria-label={isLiked ? "Unlike {title}" : "Like {title}"}
aria-label={isBookmarked ? "Remove from bookmarks" : "Bookmark {title}"}
```

### Tooltips
```jsx
// Native tooltips
title="Download asset (Ctrl+D)"
title={isLiked ? 'Unlike' : 'Like'}
title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
title="Save to collection"
```

### Focus Management
```jsx
useEffect(() => {
  if (showModal && cardRef.current) {
    cardRef.current.setAttribute('aria-expanded', 'true');
  }
}, [showModal]);
```

---

## 🔄 State Management

### Loading States
```jsx
const [isLiking, setIsLiking] = useState(false);
const [isBookmarking, setIsBookmarking] = useState(false);
const [isDownloading, setIsDownloading] = useState(false);

// Visual feedback
{isDownloading ? (
  <Loader2 className="animate-spin" />
) : (
  <Download />
)}
```

### Optimistic Updates
```jsx
// 1. Save previous state
const previousLiked = isLiked;

// 2. Update UI immediately
setIsLiked(!isLiked);

try {
  // 3. API call
  await api.post('/like');
} catch (error) {
  // 4. Rollback on error
  setIsLiked(previousLiked);
}
```

---

## 📱 Mobile Considerations

### Touch Targets
```jsx
// Minimum 44x44px
<button className="p-2"> {/* 8px + 16px icon + borders = ~48px */}
  <Icon size={16} />
</button>
```

### Hover Alternatives
```jsx
// Desktop: Hover-only
// Mobile: Always visible
className="sm:opacity-0 sm:group-hover:opacity-100"

// Action bar
className="translate-y-full sm:group-hover:translate-y-0"
```

---

## 🐛 Common Issues

### Issue: Action bar não aparece no mobile
```jsx
// ❌ ERRADO: Apenas hover
className="group-hover:translate-y-0"

// ✅ CORRETO: Mobile sempre visível
className="translate-y-full sm:group-hover:translate-y-0"
```

### Issue: Layout shift nas imagens
```jsx
// ❌ ERRADO: Sem aspect ratio
<img className="h-40" />

// ✅ CORRETO: Com aspect ratio
<img style={{ aspectRatio: '16/9' }} className="h-full" />
```

### Issue: FPS baixo no scroll
```jsx
// ❌ ERRADO: Sem containment
<article className="card">

// ✅ CORRETO: Com containment
<article style={{
  contain: 'layout style paint',
  transform: 'translateZ(0)'
}}>
```

### Issue: Duplo clique em actions
```jsx
// ❌ ERRADO: Sem guard
const handleLike = () => {
  setIsLiked(!isLiked);
};

// ✅ CORRETO: Com loading guard
const handleLike = async () => {
  if (isLiking) return; // Prevent double-click
  setIsLiking(true);
  // ... API call
  setIsLiking(false);
};
```

---

## 🎯 Testing Checklist

### Visual Testing
- [ ] Thumbnail carrega corretamente
- [ ] Gradient overlay aparece no hover (desktop)
- [ ] Action bar slide-up funciona
- [ ] Loading spinners aparecem
- [ ] Estados hover/active/focus funcionam

### Functional Testing
- [ ] Like toggle funciona (API + UI)
- [ ] Bookmark toggle funciona
- [ ] Download inicia corretamente
- [ ] Modal abre ao clicar no card
- [ ] Dropdown de collection abre
- [ ] Clicks não propagam incorretamente

### Accessibility Testing
- [ ] Tab navigation funciona
- [ ] Enter/Space abrem modal
- [ ] Screen reader lê labels corretos
- [ ] Focus visible em todos os elementos
- [ ] Tooltips aparecem em hover/focus

### Performance Testing
- [ ] 60 FPS em scroll (Chrome DevTools)
- [ ] Sem layout shifts (Lighthouse CLS)
- [ ] Lazy load funciona
- [ ] GPU layers corretos (Layers panel)

### Mobile Testing
- [ ] Touch targets ≥ 44px
- [ ] Action bar sempre visível
- [ ] Gradient sempre visível
- [ ] Pinch-zoom não quebra layout

---

## 🚀 Migration Guide

### Upgrading from Old AssetCard

#### 1. Import Changes
```jsx
// Adicione novos ícones
import { 
  BookmarkCheck,    // Novo
  FolderPlus,       // Novo
  Loader2           // Novo
} from 'lucide-react';
```

#### 2. Props Changes
```jsx
// Antes
<AssetCard asset={asset} />

// Depois (mesma interface)
<AssetCard asset={asset} showStatus={isMyAssets} />
```

#### 3. Asset Object Requirements
```jsx
// Certifique-se que asset tem:
{
  id: string,
  title: string,
  thumbnail: string,
  category: string,
  author: {
    name: string,
    avatarUrl?: string
  },
  likes: number,
  downloads: number,
  comments?: number,
  uploadedAt: string,
  isLiked?: boolean,      // Novo (opcional)
  isBookmarked?: boolean, // Novo (opcional)
  status?: 'pending' | 'published' | 'draft' // Para showStatus
}
```

#### 4. Backend Integration
```jsx
// Implemente endpoints:
POST /api/assets/:id/like
POST /api/assets/:id/bookmark
POST /api/assets/:id/download

// Response format:
{
  success: boolean,
  data: {
    liked?: boolean,
    bookmarked?: boolean,
    totalLikes?: number,
    downloadUrl?: string
  }
}
```

---

**Version**: 2.0  
**Last Updated**: November 9, 2025  
**Status**: ✅ Production Ready
