import { useRef, useEffect, useLayoutEffect, useState, useMemo, memo } from 'react';
import AssetCardMasonry from './AssetCardMasonry';

/**
 * MasonryGrid - Layout CSS columns otimizado para 60 FPS
 * 
 * Usa CSS columns property ao invés de JavaScript positioning:
 * - Melhor performance (GPU-accelerated)
 * - Responsivo nativamente
 * - Sem dependências externas (GSAP)
 * - CSS containment para scroll suave
 * 
 * Breakpoints customizados seguindo padrão do projeto:
 * - Mobile: 1 coluna
 * - Tablet (640px): 2 colunas
 * - Desktop (1024px): 3 colunas
 * - Large (1280px): 4 colunas
 * - XL (1536px): 5 colunas
 */
const MasonryGrid = memo(({ assets = [], loading = false }) => {
  const containerRef = useRef(null);
  const [columnCount, setColumnCount] = useState(1);

  // Responsive columns baseado em media queries
  useLayoutEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColumnCount(5); // 2xl
      else if (width >= 1280) setColumnCount(4); // xl
      else if (width >= 1024) setColumnCount(3); // lg
      else if (width >= 640) setColumnCount(2); // sm
      else setColumnCount(1); // mobile
    };

    updateColumns();
    window.addEventListener('resize', updateColumns);
    return () => window.removeEventListener('resize', updateColumns);
  }, []);

  // Calcular alturas dinâmicas para cada imagem
  // Simula aspect ratios variados para efeito masonry natural
  const assetHeights = useMemo(() => {
    return assets.map((asset, index) => {
      // Usa aspect ratio da imagem se disponível, senão gera altura variável
      const baseHeight = 240; // ~h-60 base
      const variation = [0.8, 1, 1.2, 0.9, 1.1]; // Variações de altura
      const factor = variation[index % variation.length];
      return Math.floor(baseHeight * factor);
    });
  }, [assets]);

  // Log para debug em dev
  useEffect(() => {
    if (import.meta.env.DEV && assets.length > 0) {
      console.log(`[MasonryGrid] Rendering ${assets.length} assets in ${columnCount} columns`);
    }
  }, [assets.length, columnCount]);

  if (loading) {
    return (
      <div 
        className="masonry-skeleton"
        style={{
          columns: columnCount,
          columnGap: '16px',
          contain: 'layout style paint'
        }}
      >
        {[...Array(15)].map((_, i) => (
          <div 
            key={i}
            className="break-inside-avoid mb-4 rounded-xl bg-surface-float2 overflow-hidden"
            style={{
              height: `${assetHeights[i] || 240}px`,
              opacity: 0.7,
              animation: `stagger-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.03}s backwards`
            }}
          >
            {/* Shimmer effect */}
            <div className="relative h-full overflow-hidden">
              <div 
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-shimmer-smooth"
                style={{ transform: 'translateX(-100%)' }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (assets.length === 0) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className="masonry-container"
      style={{
        // PERFORMANCE: CSS columns para layout masonry nativo
        columns: columnCount,
        columnGap: '16px',
        // CRITICAL: CSS containment para scroll 60 FPS
        contain: 'layout style paint',
        willChange: 'contents',
        // iOS smooth scrolling
        WebkitOverflowScrolling: 'touch',
        // Transição suave ao mudar número de colunas
        transition: 'columns 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
      }}
    >
      {assets.map((asset, index) => (
        <div
          key={asset.id}
          style={{
            // Animação stagger individual para cada card
            animation: `masonry-fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.04}s backwards`,
            willChange: 'transform, opacity'
          }}
        >
          <AssetCardMasonry 
            asset={asset}
            height={assetHeights[index]}
          />
        </div>
      ))}
    </div>
  );
});

MasonryGrid.displayName = 'MasonryGrid';

export default MasonryGrid;
