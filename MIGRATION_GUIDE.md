# 🔄 Guia de Migração - Arquivo Antigo

## ⚠️ Arquivo Deprecado

O arquivo `/src/config/pixelBlastConfig.js` foi **deprecado** e substituído pela nova estrutura modular.

## 🆕 Nova Estrutura

```
src/config/
├── index.js                  # Export central
├── backgrounds.js            # Seletor de background
├── pixelBlast.config.js      # Config PixelBlast
└── gridScan.config.js        # Config GridScan
```

## 📝 Como Migrar

### Se você editou pixelBlastConfig.js diretamente:

#### 1. Para trocar o background ativo:
**❌ Antes:**
```javascript
// pixelBlastConfig.js
export const activeBackground = 'gridscan';
```

**✅ Agora:**
```javascript
// backgrounds.js
export const activeBackground = 'gridscan';
```

#### 2. Para editar configurações do PixelBlast:
**❌ Antes:**
```javascript
// pixelBlastConfig.js (linha ~40)
export const pixelBlastConfig = {
  color: '#2563eb',
  // ...
};
```

**✅ Agora:**
```javascript
// pixelBlast.config.js (linha ~40)
export const pixelBlastConfig = {
  color: '#2563eb',
  // ...
};
```

#### 3. Para editar configurações do GridScan:
**❌ Antes:**
```javascript
// pixelBlastConfig.js (linha ~267)
export const gridScanConfig = {
  linesColor: '#392e4e',
  // ...
};
```

**✅ Agora:**
```javascript
// gridScan.config.js (linha ~20)
export const gridScanConfig = {
  linesColor: '#392e4e',
  // ...
};
```

### Se você fez imports do arquivo antigo:

#### Imports em componentes:
**❌ Antes:**
```javascript
import { activeBackground, pixelBlastConfig, gridScanConfig } from '../../config/pixelBlastConfig';
```

**✅ Agora:**
```javascript
import { activeBackground, pixelBlastConfig, gridScanConfig } from '../../config';
```

## 🗑️ Posso Deletar o Arquivo Antigo?

**Sim!** O arquivo `/src/config/pixelBlastConfig.js` pode ser deletado após a migração.

### Checklist antes de deletar:

- [ ] Todas as configurações foram migradas
- [ ] Todos os imports foram atualizados
- [ ] Aplicação está funcionando normalmente
- [ ] Sem erros no console

### Comando para remover:
```bash
rm src/config/pixelBlastConfig.js
```

## 🎯 Vantagens da Nova Estrutura

1. **Organização** - Cada config em seu arquivo
2. **Manutenibilidade** - Fácil localizar e editar
3. **Escalabilidade** - Adicionar novos backgrounds sem tocar nos existentes
4. **Clean Code** - Segue princípios SOLID

## 📚 Documentação Atualizada

- `BACKGROUND_GUIDE.md` - Guia completo de uso
- `QUICK_BACKGROUND_GUIDE.md` - Referência rápida
- `CONFIG_ARCHITECTURE.md` - Arquitetura detalhada
- `REFACTORING_SUMMARY.md` - Resumo da refatoração

## 🆘 Problemas?

Se encontrar problemas após a migração:

1. Verifique os imports nos componentes
2. Confira se está importando de `../../config` (não `../../config/pixelBlastConfig`)
3. Veja os exemplos nos guias atualizados
4. Verifique o console por erros

---

**Arquivo deprecado:** `/src/config/pixelBlastConfig.js`  
**Substituído por:** Estrutura modular (index.js + backgrounds.js + configs)  
**Data:** Novembro 2025
