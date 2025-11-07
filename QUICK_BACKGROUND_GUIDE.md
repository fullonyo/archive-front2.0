# 🎨 Guia Rápido: Como Trocar o Background

## ⚡ Troca Rápida (1 minuto)

Abra: `/src/config/backgrounds.js`

**Linha 8** - Troque aqui:
```javascript
export const activeBackground = 'gridscan'; // 'pixelblast' ou 'gridscan'
```

## 📁 Estrutura de Configuração

```
src/config/
├── index.js              # Export central (use este para imports)
├── backgrounds.js        # Seletor de background ativo
├── pixelBlast.config.js  # Config PixelBlast + presets
└── gridScan.config.js    # Config GridScan + presets
```

## 🎯 Backgrounds Disponíveis

### 1. PixelBlast (Padrão)
- Partículas animadas pixeladas
- Efeito líquido interativo
- Ondas ao clicar
- **Melhor para**: Visual moderno e clean

### 2. GridScan
- Grade 3D perspectiva
- Scan animado percorrendo
- Efeito cyberpunk
- **Melhor para**: Visual futurista/cyberpunk

## 🎨 Customização Rápida

### PixelBlast - Trocar Cor
Arquivo: `/src/config/pixelBlast.config.js`
```javascript
// Linha ~33
color: '#8b5cf6', // Roxo vibrante
```

Cores sugeridas:
- `#2563eb` - Azul (padrão)
- `#8b5cf6` - Roxo
- `#10b981` - Verde
- `#ec4899` - Rosa

### GridScan - Trocar Tema
Arquivo: `/src/config/gridScan.config.js`
```javascript
// Linha ~140
export const gridScanConfig = {
  ...gridScanPresets.matrix  // matrix, tron, cyberpunk, minimal
};
```

Temas disponíveis:
- `default` - Rosa cyberpunk (padrão)
- `matrix` - Verde Matrix
- `tron` - Azul ciano Tron
- `cyberpunk` - Roxo/rosa intenso
- `minimal` - Sutil e discreto

## 📝 Exemplo Completo

Para usar GridScan tema Matrix:

1. Abra `/src/config/backgrounds.js`
2. Linha 8: `export const activeBackground = 'gridscan';`
3. Abra `/src/config/gridScan.config.js`
4. Linha ~140: `export const gridScanConfig = { ...gridScanPresets.matrix };`
5. Salve e veja a mudança!

## 🔧 Ajustes Finos

### PixelBlast
```javascript
pixelBlastConfig = {
  pixelSize: 6,      // 3-10 (menor = mais detalhes)
  speed: 0.6,        // 0.1-2 (velocidade animação)
  liquid: true,      // true/false (efeito líquido)
  enableRipples: true, // true/false (ondas ao clicar)
}
```

### GridScan
```javascript
gridScanConfig = {
  scanDuration: 2.0,   // 1-5 (velocidade do scan)
  bloomIntensity: 0.6, // 0-2 (brilho)
  lineJitter: 0.1,     // 0-1 (trepidação)
  gridScale: 0.1,      // 0.05-0.5 (densidade)
}
```

## 📱 Performance

Para melhorar performance (mobile):

**PixelBlast:**
```javascript
export const pixelBlastConfig = {
  ...pixelBlastPresets.performance
};
```

**GridScan:**
```javascript
export const gridScanConfig = {
  ...gridScanPresets.performance
};
```

## 💡 Dica Pro

Teste combinações! Você pode misturar presets:

```javascript
export const gridScanConfig = {
  ...gridScanPresets.tron,    // Base Tron
  scanDuration: 3.0,          // Mais lento
  bloomIntensity: 1.5,        // Mais brilho
};
```

---

📖 **Documentação completa**: `BACKGROUND_GUIDE.md`
