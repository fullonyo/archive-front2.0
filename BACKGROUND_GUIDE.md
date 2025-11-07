# Background Animado - Guia de Customização

Este projeto possui **2 opções de background animado**:
1. **PixelBlast** - Partículas pixeladas animadas com efeito líquido
2. **GridScan** - Grade 3D com efeito de scan cyberpunk

## 📁 Estrutura de Arquivos (Melhores Práticas)

```
src/
├── config/
│   ├── index.js                     # 📦 Export central (barrel file)
│   ├── backgrounds.js               # 🎯 Seletor de background ativo
│   ├── pixelBlast.config.js         # ⚙️ Config PixelBlast
│   └── gridScan.config.js           # ⚙️ Config GridScan
├── components/
│   ├── common/
│   │   ├── PixelBlast.jsx            # Componente PixelBlast
│   │   ├── PixelBlast.css            # Estilos PixelBlast
│   │   ├── GridScan.jsx              # Componente GridScan
│   │   └── GridScan.css              # Estilos GridScan
│   └── layout/
│       └── MainLayout.jsx            # Onde os backgrounds são usados
```

**Princípios aplicados:**
- ✅ **Separation of Concerns** - Cada config em seu arquivo
- ✅ **Single Responsibility** - Um arquivo, uma responsabilidade
- ✅ **Barrel Export** - Import centralizado via index.js
- ✅ **Maintainability** - Fácil localizar e editar configs

## 🔄 Como Trocar Entre Backgrounds

### Método Rápido (Recomendado)

Abra `/src/config/backgrounds.js`:

```javascript
// Troque entre 'pixelblast' e 'gridscan'
export const activeBackground = 'pixelblast'; // ou 'gridscan'
```

**Opções disponíveis:**
- `'pixelblast'` - Partículas animadas (padrão)
- `'gridscan'` - Grade 3D cyberpunk

## 🎨 Customizar PixelBlast

### Arquivo: `/src/config/pixelBlast.config.js`

```javascript
export const pixelBlastConfig = {
  color: '#2563eb',        // 👈 Troque a cor aqui
  pixelSize: 6,           // 👈 Ajuste o tamanho
  speed: 0.6,             // 👈 Mude a velocidade
  // ... outros parâmetros
};
```

### Usar Presets Prontos (PixelBlast)

No arquivo `/src/config/pixelBlast.config.js`:

**Presets disponíveis:**
- `default` - Configuração atual (sutil e elegante)
- `intense` - Mais intenso e chamativo
- `minimal` - Minimalista e calmo
- `performance` - Otimizado para performance
- `retro` - Visual retrô com pixels quadrados

**Como usar:**
```javascript
// Copie o preset desejado para pixelBlastConfig
export const pixelBlastConfig = {
  ...pixelBlastPresets.intense  // Troque 'intense' pelo preset desejado
};
```

## 🌐 Customizar GridScan

### Arquivo: `/src/config/gridScan.config.js`

```javascript
export const gridScanConfig = {
  linesColor: '#392e4e',   // 👈 Cor das linhas da grade
  scanColor: '#FF9FFC',    // 👈 Cor do scan (onda)
  gridScale: 0.1,          // 👈 Densidade da grade
  scanDuration: 2.0,       // 👈 Velocidade do scan
  // ... outros parâmetros
};
```

### Presets GridScan

**Presets disponíveis:**
- `default` - Cyberpunk rosa (padrão)
- `matrix` - Tema Matrix verde
- `tron` - Tema Tron azul ciano
- `cyberpunk` - Roxo/rosa intenso
- `minimal` - Sutil e discreto
- `performance` - Otimizado

**Como usar:**
```javascript
export const gridScanConfig = {
  ...gridScanPresets.matrix  // Tema Matrix
};
```

## 📋 Parâmetros Importantes

### PixelBlast

| Parâmetro | Descrição | Valores | Impacto |
|-----------|-----------|---------|---------|
| `color` | Cor principal | HEX (#2563eb) | Visual |
| `pixelSize` | Tamanho dos pixels | 3-10 | Performance/Detalhe |
| `speed` | Velocidade animação | 0.1-2 | Visual |
| `liquid` | Efeito líquido | true/false | Performance |
| `enableRipples` | Ondas ao clicar | true/false | Interatividade |
| `antialias` | Suavização | true/false | Performance/Qualidade |

### GridScan

| Parâmetro | Descrição | Valores | Impacto |
|-----------|-----------|---------|---------|
| `linesColor` | Cor das linhas | HEX (#392e4e) | Visual |
| `scanColor` | Cor do scan | HEX (#FF9FFC) | Visual |
| `gridScale` | Densidade grade | 0.05-0.5 | Visual |
| `scanDuration` | Velocidade scan | 1-5 segundos | Animação |
| `lineStyle` | Estilo linhas | solid/dashed/dotted | Visual |
| `bloomIntensity` | Brilho | 0-2 | Performance/Visual |

## 🎯 Exemplos Rápidos

### PixelBlast Mais Sutil
```javascript
export const pixelBlastConfig = {
  pixelSize: 8,
  patternDensity: 0.8,
  speed: 0.3,
  liquid: false,
};
```

### PixelBlast Mais Intenso
```javascript
export const pixelBlastConfig = {
  pixelSize: 4,
  patternDensity: 1.8,
  speed: 1.2,
  liquidStrength: 0.25,
};
```

### GridScan Tema Matrix
```javascript
export const gridScanConfig = {
  linesColor: '#003300',
  scanColor: '#00ff00',
  lineJitter: 0.2,
  scanGlow: 1,
};
```

### GridScan Tema Tron
```javascript
export const gridScanConfig = {
  linesColor: '#001a33',
  scanColor: '#00d9ff',
  gridScale: 0.15,
  bloomIntensity: 1,
};
```

### Melhor Performance (Ambos)
```javascript
// PixelBlast
{
  pixelSize: 10,
  antialias: false,
  liquid: false,
  enableRipples: false,
}

// GridScan
{
  enablePost: false,
  lineJitter: 0,
  scanGlow: 0.3,
}
```

## 🎨 Combinações de Cores Recomendadas

### PixelBlast
- **Azul Tema**: `#2563eb` (padrão)
- **Roxo Vibrante**: `#8b5cf6`
- **Verde Neon**: `#10b981`
- **Rosa Cyberpunk**: `#ec4899`
- **Laranja Sunset**: `#f59e0b`

### GridScan
- **Cyberpunk Rosa**: linhas `#392e4e` + scan `#FF9FFC` (padrão)
- **Matrix**: linhas `#003300` + scan `#00ff00`
- **Tron**: linhas `#001a33` + scan `#00d9ff`
- **Blade Runner**: linhas `#1a0033` + scan `#ff00ff`
- **Neon Blue**: linhas `#001a2e` + scan `#00bfff`

## 📱 Performance em Mobile

Os backgrounds já estão otimizados, mas você pode:

1. **Trocar para preset de performance em mobile:**
```jsx
// Em MainLayout.jsx
const isMobile = window.innerWidth < 768;
const pixelConfig = isMobile ? pixelBlastPresets.performance : pixelBlastConfig;
const gridConfig = isMobile ? gridScanPresets.performance : gridScanConfig;
```

2. **Desativar completamente em mobile:**
```jsx
const [showBackground, setShowBackground] = useState(window.innerWidth > 768);

{showBackground && (
  <div className="absolute inset-0 z-0">
    {renderBackground()}
  </div>
)}
```

## 🔄 Trocar Background Dinamicamente

Para permitir usuário escolher:

```jsx
// Adicione estado
const [bgType, setBgType] = useState('pixelblast');

// Adicione botão de toggle
<button onClick={() => setBgType(bgType === 'pixelblast' ? 'gridscan' : 'pixelblast')}>
  Trocar Background
</button>

// Renderize condicionalmente
{bgType === 'gridscan' ? (
  <GridScan {...gridScanConfig} />
) : (
  <PixelBlast {...pixelBlastConfig} />
)}
```

## 🎮 Recursos Interativos

### PixelBlast
- **Clique**: Ondas ao clicar (se `enableRipples: true`)
- **Mouse**: Efeito líquido que segue o cursor (se `liquid: true`)

### GridScan
- **Mouse**: Grade se move seguindo o cursor (sempre ativo)
- **Clique**: Scan extra ao clicar (se `scanOnClick: true`)

## 🐛 Troubleshooting

### Background não aparece
1. Verifique se Three.js está instalado: `npm list three postprocessing`
2. Confira console do navegador por erros
3. Verifique se `activeBackground` está correto no config

### Performance ruim
1. Use presets de performance
2. Reduza `pixelSize` (PixelBlast) ou desative `enablePost` (GridScan)
3. Desative efeitos: `liquid: false`, `enableRipples: false`

### Cores não aparecem certas
- Certifique-se de usar formato HEX: `#2563eb` (não RGB)
- GridScan pode precisar ajustar `bloomIntensity` para cores mais vibrantes

## 📝 Checklist de Customização

- [ ] Escolhi qual background usar (`activeBackground`)
- [ ] Ajustei as cores principais
- [ ] Testei em diferentes tamanhos de tela
- [ ] Verifiquei performance
- [ ] Salvei preset favorito para reutilizar

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
