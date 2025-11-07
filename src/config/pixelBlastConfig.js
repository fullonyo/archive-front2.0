/**
 * PixelBlast Background Configuration
 * 
 * Este arquivo centraliza todas as configurações do background animado.
 * Para trocar ou ajustar o background, edite os valores abaixo.
 */

export const pixelBlastConfig = {
  // ============================================
  // CONFIGURAÇÕES DE APARÊNCIA
  // ============================================
  
  /**
   * Forma dos pixels
   * Opções: 'circle', 'square', 'triangle', 'diamond'
   */
  variant: 'circle',
  
  /**
   * Tamanho individual dos pixels (1-10)
   * Valores menores = mais detalhes, maior consumo
   */
  pixelSize: 6,
  
  /**
   * Cor principal do background
   * Use cores HEX do seu tema
   * Exemplos:
   * - '#2563eb' (azul tema atual)
   * - '#B19EEF' (roxo exemplo)
   * - '#10b981' (verde)
   */
  color: '#2563eb',
  
  // ============================================
  // CONFIGURAÇÕES DE PADRÃO
  // ============================================
  
  /**
   * Escala do padrão (1-5)
   * Valores maiores = padrão maior/mais espaçado
   */
  patternScale: 3,
  
  /**
   * Densidade do padrão (0-2)
   * 1.0 = padrão normal
   * >1.0 = mais denso
   * <1.0 = mais esparso
   */
  patternDensity: 1.2,
  
  /**
   * Variação aleatória de tamanho (0-1)
   * 0 = todos pixels iguais
   * 1 = máxima variação
   */
  pixelSizeJitter: 0.5,
  
  // ============================================
  // EFEITOS INTERATIVOS
  // ============================================
  
  /**
   * Ativar ondas ao clicar
   */
  enableRipples: true,
  
  /**
   * Velocidade das ondas (0.1-1)
   */
  rippleSpeed: 0.4,
  
  /**
   * Espessura das ondas (0.05-0.3)
   */
  rippleThickness: 0.12,
  
  /**
   * Intensidade das ondas (0.5-2)
   */
  rippleIntensityScale: 1.5,
  
  // ============================================
  // EFEITO LÍQUIDO
  // ============================================
  
  /**
   * Ativar efeito de distorção líquida
   */
  liquid: true,
  
  /**
   * Força da distorção (0.05-0.3)
   */
  liquidStrength: 0.12,
  
  /**
   * Raio do efeito líquido (0.5-2)
   */
  liquidRadius: 1.2,
  
  /**
   * Velocidade da ondulação (1-10)
   */
  liquidWobbleSpeed: 5,
  
  // ============================================
  // ANIMAÇÃO E PERFORMANCE
  // ============================================
  
  /**
   * Velocidade geral da animação (0.1-2)
   * 1.0 = velocidade normal
   */
  speed: 0.6,
  
  /**
   * Fade nas bordas (0-1)
   * 0 = sem fade
   * 0.5 = fade médio
   */
  edgeFade: 0.25,
  
  /**
   * Background transparente
   * true = mostra cor de fundo do tema
   * false = preto sólido
   */
  transparent: true,
  
  /**
   * Anti-aliasing (suavização)
   * true = mais qualidade, maior consumo
   * false = melhor performance
   */
  antialias: true,
  
  /**
   * Pausar quando fora da tela
   * true = economiza bateria/recursos
   */
  autoPauseOffscreen: true,
  
  /**
   * Quantidade de ruído (0-1)
   * 0 = sem ruído
   * 0.1 = ruído sutil
   */
  noiseAmount: 0,
};

/**
 * PRESETS PRÉ-CONFIGURADOS
 * Use estes como base ou para trocar rapidamente
 */
export const pixelBlastPresets = {
  // Configuração atual (sutil e elegante)
  default: {
    ...pixelBlastConfig
  },
  
  // Mais intenso e chamativo
  intense: {
    ...pixelBlastConfig,
    pixelSize: 4,
    patternDensity: 1.5,
    rippleIntensityScale: 2,
    liquidStrength: 0.2,
    speed: 1,
  },
  
  // Minimalista e calmo
  minimal: {
    ...pixelBlastConfig,
    pixelSize: 8,
    patternDensity: 0.8,
    rippleIntensityScale: 0.8,
    liquidStrength: 0.05,
    speed: 0.3,
    liquid: false,
  },
  
  // Performance otimizada
  performance: {
    ...pixelBlastConfig,
    pixelSize: 8,
    antialias: false,
    liquid: false,
    enableRipples: false,
    noiseAmount: 0,
  },
  
  // Visual retrô
  retro: {
    ...pixelBlastConfig,
    variant: 'square',
    pixelSize: 8,
    patternScale: 2,
    color: '#00ff00',
    liquid: false,
  },
};

export default pixelBlastConfig;
