# Background Animado - Guia de Customização

## 📁 Estrutura de Arquivos

```
src/
├── config/
│   └── pixelBlastConfig.js          # ⚙️ CONFIGURAÇÕES (EDITE AQUI)
├── components/
│   ├── common/
│   │   ├── PixelBlast.jsx            # Componente do background
│   │   └── PixelBlast.css            # Estilos do container
│   └── layout/
│       └── MainLayout.jsx            # Onde o background é usado
```

## 🎨 Como Customizar

### Método 1: Editar Configuração (Recomendado)

Abra `/src/config/pixelBlastConfig.js` e edite os valores:

```javascript
export const pixelBlastConfig = {
  color: '#2563eb',        // 👈 Troque a cor aqui
  pixelSize: 6,           // 👈 Ajuste o tamanho
  speed: 0.6,             // 👈 Mude a velocidade
  // ... outros parâmetros
};
```

### Método 2: Usar Presets Prontos

No mesmo arquivo, há presets pré-configurados:

```javascript
import { pixelBlastPresets } from './config/pixelBlastConfig';

// Em MainLayout.jsx, troque:
<PixelBlast {...pixelBlastConfig} />

// Por um preset:
<PixelBlast {...pixelBlastPresets.intense} />    // Mais intenso
<PixelBlast {...pixelBlastPresets.minimal} />    // Minimalista
<PixelBlast {...pixelBlastPresets.performance} /> // Performance
<PixelBlast {...pixelBlastPresets.retro} />      // Retrô
```

## 🔄 Como Trocar o Background Completamente

### Opção 1: Desativar Temporariamente

Em `MainLayout.jsx`:

```jsx
// Comente estas linhas:
{/* Background PixelBlast */}
{/* <div className="absolute inset-0 z-0">
  <PixelBlast {...pixelBlastConfig} />
</div> */}
```

### Opção 2: Trocar por Outro Componente

```jsx
// Substitua o PixelBlast por outro background:
<div className="absolute inset-0 z-0">
  <MeuOutroBackground />
</div>
```

### Opção 3: Background Estático Simples

```jsx
// Use apenas CSS:
<div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-900 to-purple-900" />
```

## 📋 Parâmetros Importantes

| Parâmetro | Descrição | Valores | Impacto |
|-----------|-----------|---------|---------|
| `color` | Cor principal | HEX (#2563eb) | Visual |
| `pixelSize` | Tamanho dos pixels | 3-10 | Performance/Detalhe |
| `speed` | Velocidade animação | 0.1-2 | Visual |
| `liquid` | Efeito líquido | true/false | Performance |
| `enableRipples` | Ondas ao clicar | true/false | Interatividade |
| `antialias` | Suavização | true/false | Performance/Qualidade |

## 🎯 Exemplos Rápidos

### Background Mais Sutil
```javascript
{
  pixelSize: 8,
  patternDensity: 0.8,
  speed: 0.3,
  liquid: false,
}
```

### Background Mais Intenso
```javascript
{
  pixelSize: 4,
  patternDensity: 1.8,
  speed: 1.2,
  liquidStrength: 0.25,
}
```

### Melhor Performance
```javascript
{
  pixelSize: 10,
  antialias: false,
  liquid: false,
  enableRipples: false,
}
```

## 🔧 Configuração por Tema

Para sincronizar com cores do Tailwind:

```javascript
// Em pixelBlastConfig.js
import resolveConfig from 'tailwindcss/resolveConfig';
import tailwindConfig from '../../tailwind.config.js';

const fullConfig = resolveConfig(tailwindConfig);

export const pixelBlastConfig = {
  color: fullConfig.theme.colors['theme'].active, // Usa cor do tema
  // ...
};
```

## 📱 Performance em Mobile

O background já está otimizado, mas você pode:

1. **Desativar em mobile:**
```jsx
const [showBackground, setShowBackground] = useState(window.innerWidth > 768);

{showBackground && (
  <div className="absolute inset-0 z-0">
    <PixelBlast {...pixelBlastConfig} />
  </div>
)}
```

2. **Usar preset de performance em mobile:**
```jsx
const isMobile = window.innerWidth < 768;
const config = isMobile ? pixelBlastPresets.performance : pixelBlastConfig;

<PixelBlast {...config} />
```

## 🎨 Cores Sugeridas do Tema

```javascript
// Azul atual (theme-active)
color: '#2563eb'

// Azul mais claro
color: '#3b82f6'

// Roxo
color: '#8b5cf6'

// Verde
color: '#10b981'

// Gradiente (não suportado diretamente, use múltiplos layers)
```

## ⚡ Troubleshooting

### Background muito lento?
- Aumente `pixelSize` para 8-10
- Desative `liquid` e `antialias`
- Use preset `performance`

### Background muito estático?
- Aumente `speed` para 1-1.5
- Aumente `patternDensity` para 1.5-2
- Ative `liquid` e `enableRipples`

### Quer remover completamente?
1. Delete `<PixelBlast />` do `MainLayout.jsx`
2. Mantenha apenas `bg-surface-base` no container
3. (Opcional) Desinstale: `npm uninstall three postprocessing`

## 📚 Documentação Completa

Todos os parâmetros estão documentados em `/src/config/pixelBlastConfig.js`

Componente original: [React Bits - PixelBlast](https://github.com/react-bits)
