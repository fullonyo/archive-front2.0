# Image Fallback - Quick Reference Card

## 🚀 TL;DR - Use isso em TODA tag `<img>`

```jsx
import { handleImageError } from '../utils/imageUtils';

<img 
  src={url}
  alt="descriptive text"
  loading="lazy"
  onError={handleImageError('avatar' | 'banner' | 'thumbnail')}
/>
```

---

## ✅ Checklist (Copy-Paste)

### Avatar (Foto de perfil):
```jsx
{user.avatarUrl ? (
  <img 
    src={user.avatarUrl}
    alt={user.username}
    className="w-10 h-10 rounded-full"
    loading="lazy"
    onError={handleImageError('avatar')}
  />
) : (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
    <span className="text-white font-semibold text-sm">
      {user.username[0]?.toUpperCase() || 'U'}
    </span>
  </div>
)}
```

### Banner (Capa de perfil):
```jsx
{user.bannerUrl && (
  <img 
    src={user.bannerUrl}
    alt="Banner do perfil"
    className="w-full h-48 object-cover"
    onError={handleImageError('banner')}
  />
)}
```

### Thumbnail (Preview de asset):
```jsx
<img 
  src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
  alt={asset.title}
  className="w-full h-40 object-cover"
  loading="lazy"
  onError={handleImageError('thumbnail')}
/>
```

---

## 📋 Pre-Commit Checklist

Antes de fazer commit, verificar:

- [ ] Todas as `<img>` têm `onError={handleImageError('type')}`
- [ ] Todas as `<img>` abaixo da dobra têm `loading="lazy"`
- [ ] Todas as `<img>` têm `alt` descritivo
- [ ] Importei `handleImageError` de `utils/imageUtils`
- [ ] Testei com URL inválida (console: `img.src = 'broken.jpg'`)

---

## 🎯 Tipos de Imagem

| Tipo | Uso | Dimensões | Handler |
|------|-----|-----------|---------|
| **avatar** | Foto usuário | 200x200 | `handleImageError('avatar')` |
| **banner** | Capa perfil | 1200x300 | `handleImageError('banner')` |
| **thumbnail** | Preview asset | 400x225 | `handleImageError('thumbnail')` |

---

## ⚡ Performance Tips

```jsx
// ✅ BOM: Lazy loading abaixo da dobra
<img loading="lazy" />

// ✅ BOM: Fallback inline para carregamento imediato
<img src={url || PLACEHOLDER_IMAGES.AVATAR} />

// ✅ BOM: Handler reutilizado
import { handleImageError } from '../utils/imageUtils';
<img onError={handleImageError('avatar')} />

// ❌ RUIM: Closure inline
<img onError={(e) => e.target.src = '/placeholder.png'} />

// ❌ RUIM: Sem lazy loading
<img src={url} /> // Carrega tudo de uma vez

// ❌ RUIM: Hardcoded path
<img src={url || '/default-avatar.png'} /> // Depende de arquivo estático
```

---

## 🔧 Imports Necessários

```jsx
// Para handlers de erro
import { handleImageError } from '../utils/imageUtils';

// Para placeholders inline
import { PLACEHOLDER_IMAGES } from '../constants';
```

---

## 🐛 Troubleshooting

**Problema**: Fallback não aparece  
**Solução**: Verificar se `onError` está presente e URL realmente falha

**Problema**: Infinite loop de onError  
**Solução**: `handleImageError` já previne isso, usar função do utils

**Problema**: Performance ruim  
**Solução**: Adicionar `loading="lazy"` em imagens abaixo da dobra

---

## 📖 Documentação Completa

- **Best Practices**: `IMAGE_FALLBACK_BEST_PRACTICES.md`
- **Implementação**: `IMAGE_FALLBACK_SUMMARY.md`
- **Código**: `src/utils/imageUtils.js`

---

**Última atualização**: 08/11/2025
