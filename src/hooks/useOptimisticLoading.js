import { useState, useEffect, useRef } from 'react';

/**
 * Hook para loading otimista com delay mínimo
 * 
 * Comportamento:
 * - Cache hit (< 100ms): Não mostra skeleton, transição suave
 * - Network request (> 100ms): Mostra skeleton após delay
 * - Previne "flash of loading" em cache hits
 * 
 * @param {boolean} isLoading - Estado de loading do fetch
 * @param {boolean} isCached - Se os dados vieram do cache
 * @param {number} minDelay - Delay mínimo antes de mostrar skeleton (default: 150ms)
 * @returns {boolean} shouldShowSkeleton
 */
export const useOptimisticLoading = (isLoading, isCached = false, minDelay = 150) => {
  const [shouldShowSkeleton, setShouldShowSkeleton] = useState(false);
  const timeoutRef = useRef(null);
  const loadingStartTime = useRef(null);

  useEffect(() => {
    // Início do loading
    if (isLoading && !loadingStartTime.current) {
      loadingStartTime.current = Date.now();

      // Se for cache hit, não mostra skeleton
      if (isCached) {
        setShouldShowSkeleton(false);
        return;
      }

      // Aguarda delay mínimo antes de mostrar skeleton
      timeoutRef.current = setTimeout(() => {
        // Só mostra skeleton se ainda estiver loading
        if (isLoading) {
          setShouldShowSkeleton(true);
        }
      }, minDelay);
    }

    // Fim do loading
    if (!isLoading) {
      // Limpar timeout se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      const loadingDuration = loadingStartTime.current 
        ? Date.now() - loadingStartTime.current 
        : 0;

      // Se foi muito rápido (< 100ms), não mostrou skeleton
      if (loadingDuration < 100) {
        setShouldShowSkeleton(false);
      } else {
        // Manter skeleton por mais 50ms para transição suave
        setTimeout(() => {
          setShouldShowSkeleton(false);
        }, 50);
      }

      loadingStartTime.current = null;
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isLoading, isCached, minDelay]);

  return shouldShowSkeleton;
};

/**
 * Hook para animações staggered (escalonadas)
 * Retorna index-based delay para animações em cascata
 * 
 * @param {number} totalItems - Total de items a animar
 * @param {number} delayIncrement - Incremento de delay por item (ms)
 * @returns {Function} getDelay(index) - Função que retorna delay para index
 */
export const useStaggeredAnimation = (totalItems, delayIncrement = 50) => {
  const getDelay = (index) => {
    // Limitar delay máximo para não ficar muito lento
    const maxDelay = 500;
    const delay = Math.min(index * delayIncrement, maxDelay);
    return delay;
  };

  return { getDelay };
};
