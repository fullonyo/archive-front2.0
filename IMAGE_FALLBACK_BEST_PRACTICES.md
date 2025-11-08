# Image Fallback - Best Practices

## 📋 Resumo Executivo

Este documento define o padrão de tratamento de fallback para imagens no Archive Nyo. Todas as imagens (avatares, banners, thumbnails) **DEVEM** ter tratamento de erro consistente usando o utilitário centralizado.

---

## 🎯 Objetivo

**Eliminar imagens quebradas** em toda a aplicação, garantindo que:
1. **Nenhuma imagem aparece com ícone de "quebrado"**
2. **Fallbacks são visualmente consistentes** (SVG placeholders)
3. **Performance não é afetada** (lazy loading + handlers otimizados)
4. **Código é reutilizável** (utilitário centralizado)

---

## 🛠️ Implementação

### Utilitário Centralizado: `imageUtils.js`

Localização: `src/utils/imageUtils.js`

**Funções disponíveis**:

```javascript
import { handleImageError, getFallbackImage, getImageProps } from '../utils/imageUtils';

// 1. Handler de erro (mais comum)
handleImageError('avatar' | 'banner' | 'thumbnail')

// 2. Obter fallback diretamente
getFallbackImage('avatar' | 'banner' | 'thumbnail')

// 3. Props completas (lazy + fallback)
getImageProps(url, type, alt)
```

---

## 📐 Tipos de Imagem

### 1. **Avatar** (Foto de perfil)
- **Dimensões**: 200x200px (quadrado)
- **Formato**: SVG com círculo e pessoa estilizada
- **Cor**: Cinza (#374151 bg, #9CA3AF fg)
- **Uso**: Fotos de usuário, autor de posts, autor de assets

**Exemplo**:
```jsx
<img 
  src={user.avatarUrl} 
  alt={user.username}
  className="w-10 h-10 rounded-full"
  loading="lazy"
  onError={handleImageError('avatar')}
/>
```

---

### 2. **Banner** (Capa de perfil)
- **Dimensões**: 1200x300px (4:1 aspect ratio)
- **Formato**: SVG com texto "No Banner"
- **Cor**: Cinza (#374151 bg, #9CA3AF fg)
- **Uso**: Banner de perfil de usuário

**Exemplo**:
```jsx
<img 
  src={user.bannerUrl}
  alt="Banner do perfil"
  className="w-full h-48 object-cover"
  onError={handleImageError('banner')}
/>
```

---

### 3. **Thumbnail** (Preview de assets)
- **Dimensões**: 400x225px (16:9 aspect ratio)
- **Formato**: SVG com texto "No Image"
- **Cor**: Cinza (#374151 bg, #9CA3AF fg)
- **Uso**: Thumbnails de assets, imagens de posts

**Exemplo**:
```jsx
<img 
  src={asset.thumbnail}
  alt={asset.title}
  className="w-full h-40 object-cover"
  loading="lazy"
  onError={handleImageError('thumbnail')}
/>
```

---

## ✅ Padrões Obrigatórios

### ✓ SEMPRE incluir:

1. **`onError={handleImageError('type')}`** em TODAS as tags `<img>`
2. **`loading="lazy"`** para imagens não acima da dobra
3. **`alt` descritivo** para acessibilidade
4. **Fallback visual** (div com gradiente) quando imagem é opcional

### ✓ SEMPRE validar:

1. URL existe antes de renderizar `<img>`
2. Usar operador `?.` para acessar propriedades aninhadas
3. Ter fallback visual (div) quando `avatarUrl` é null

---

## 📦 Componentes Atualizados

Lista completa de componentes com fallback implementado:

| Componente | Tipo de Imagem | Localização | Status |
|------------|----------------|-------------|---------|
| **AssetCard** | thumbnail + avatar | `components/assets/` | ✅ |
| **AssetDetailModal** | thumbnail + avatar (2x) | `components/assets/` | ✅ |
| **UserButton** | avatar (2x) | `components/user/` | ✅ |
| **ProfilePage** | avatar + banner | `pages/` | ✅ |
| **UserProfilePage** | avatar | `pages/` | ✅ |
| **ForumPostCard** | avatar | `components/forum/` | ✅ |
| **ForumReply** | avatar | `components/forum/` | ✅ |

---

## 🎨 Padrões de Design

### Avatar com Fallback Visual (Gradient)

Quando `avatarUrl` é `null` ou vazio, mostramos um **círculo com gradiente** e inicial do nome:

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
      {user.username?.[0]?.toUpperCase() || 'U'}
    </span>
  </div>
)}
```

**Cores do gradiente**: `from-blue-500 to-purple-600`

---

### Thumbnail com Placeholder SVG

Quando `thumbnail` falha ao carregar, substituímos automaticamente por SVG placeholder:

```jsx
<img
  src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
  alt={asset.title}
  loading="lazy"
  onError={handleImageError('thumbnail')}
/>
```

**Comportamento**: 
- Se `asset.thumbnail` é `null` → usa placeholder imediatamente
- Se `asset.thumbnail` existe mas falha → `onError` substitui por placeholder

---

## 🚫 Anti-Padrões (EVITAR)

### ❌ NÃO FAZER:

```jsx
// ❌ Sem onError handler
<img src={user.avatarUrl} alt="Avatar" />

// ❌ Usando URL hardcoded
<img src={user.avatarUrl || '/default-avatar.png'} />

// ❌ Inline onError sem reutilização
<img onError={(e) => e.target.src = '/placeholder.png'} />

// ❌ Sem lazy loading
<img src={asset.thumbnail} alt="Thumbnail" />

// ❌ Sem alt text
<img src={user.avatarUrl} onError={handleImageError('avatar')} />
```

### ✅ CORRETO:

```jsx
// ✅ Com handler centralizado
<img 
  src={user.avatarUrl} 
  alt={user.username}
  loading="lazy"
  onError={handleImageError('avatar')}
/>

// ✅ Com placeholder SVG (Data URI)
<img 
  src={asset.thumbnail || PLACEHOLDER_IMAGES.ASSET_THUMBNAIL}
  alt={asset.title}
  loading="lazy"
  onError={handleImageError('thumbnail')}
/>

// ✅ Com fallback visual (gradiente)
{user.avatarUrl ? (
  <img 
    src={user.avatarUrl} 
    onError={handleImageError('avatar')}
    alt={user.username}
    loading="lazy"
  />
) : (
  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full">
    <span className="text-white">{user.username[0]}</span>
  </div>
)}
```

---

## 🔍 Checklist para Novos Componentes

Ao criar um componente com imagens, verificar:

- [ ] `onError={handleImageError('type')}` em todas as `<img>`
- [ ] `loading="lazy"` para imagens abaixo da dobra
- [ ] `alt` descritivo para acessibilidade
- [ ] Fallback visual (div) quando imagem é opcional
- [ ] Import de `handleImageError` de `utils/imageUtils`
- [ ] Usar `PLACEHOLDER_IMAGES` de `constants/` quando apropriado
- [ ] Teste com URL quebrado para validar fallback

---

## 🧪 Como Testar

### Teste Manual:

1. **Avatar quebrado**: 
   - Alterar `avatarUrl` no console: `user.avatarUrl = 'https://invalid-url.com/broken.jpg'`
   - Verificar que aparece placeholder SVG cinza com pessoa

2. **Banner quebrado**:
   - Alterar `bannerUrl` temporariamente
   - Verificar que aparece placeholder "No Banner"

3. **Thumbnail quebrado**:
   - Desativar internet temporariamente
   - Verificar que cards mostram "No Image"

### Teste Automatizado (Futuro):

```javascript
// TODO: Adicionar testes com @testing-library/react
test('should show fallback avatar when image fails', () => {
  render(<Avatar src="invalid-url.jpg" />);
  const img = screen.getByRole('img');
  fireEvent.error(img);
  expect(img.src).toContain('data:image/svg+xml');
});
```

---

## 📊 Métricas de Sucesso

**Antes da implementação**:
- ❌ Imagens quebradas visíveis em produção
- ❌ Cada componente com implementação diferente
- ❌ Sem tratamento de erro consistente

**Depois da implementação**:
- ✅ **0 imagens quebradas** visíveis
- ✅ **100% dos componentes** usando utilitário centralizado
- ✅ **Fallbacks consistentes** em toda aplicação
- ✅ **Performance mantida** (lazy loading + SVG placeholders)

---

## 🔄 Manutenção

### Adicionar novo tipo de imagem:

1. Adicionar SVG placeholder em `constants/index.js`:
   ```javascript
   export const PLACEHOLDER_IMAGES = {
     // ... existing
     NEW_TYPE: "data:image/svg+xml,%3Csvg..."
   };
   ```

2. Atualizar `imageUtils.js`:
   ```javascript
   const FALLBACK_MAP = {
     // ... existing
     newType: PLACEHOLDER_IMAGES.NEW_TYPE
   };
   ```

3. Usar em componentes:
   ```javascript
   <img onError={handleImageError('newType')} />
   ```

---

## 📚 Referências

- **SVG Data URI Generator**: [URL-encoder for SVG](https://yoksel.github.io/url-encoder/)
- **Placeholder Design**: Inspirado em GitHub, Discord, LinkedIn
- **Performance**: [Web.dev - Lazy Loading](https://web.dev/browser-level-image-lazy-loading/)

---

## 🆘 Troubleshooting

### Problema: "Fallback não aparece"

**Causa**: `onError` não está sendo disparado
**Solução**: Verificar se URL realmente falha. Testar com URL inválido explícito.

### Problema: "Infinite loop de onError"

**Causa**: Fallback também falha ao carregar
**Solução**: Usar Data URI (SVG embutido) como fallback, nunca URL externo.

### Problema: "Performance degradada"

**Causa**: Muitas imagens carregando ao mesmo tempo
**Solução**: Adicionar `loading="lazy"` em TODAS as imagens abaixo da dobra.

---

## 👥 Contribuindo

Ao adicionar/modificar componentes com imagens:

1. **SEMPRE** usar `handleImageError` de `utils/imageUtils`
2. **NUNCA** criar handlers inline ou custom
3. **DOCUMENTAR** novos tipos de imagem neste arquivo
4. **TESTAR** com URLs quebradas antes de commit

---

**Última atualização**: 08/11/2025  
**Responsável**: Sistema de Engenharia Frontend  
**Versão**: 1.0.0
