/**
 * GridScan Background Configuration
 * 
 * Configurações do background de grade 3D cyberpunk.
 */

export const gridScanConfig = {
  // ============================================
  // CONFIGURAÇÕES DE GRADE
  // ============================================
  
  /**
   * Sensibilidade do movimento (0-1)
   * 0.55 = sensibilidade média
   */
  sensitivity: 0.55,
  
  /**
   * Espessura das linhas da grade (0.5-3)
   */
  lineThickness: 1,
  
  /**
   * Cor das linhas da grade
   * Use cores HEX
   */
  linesColor: '#392e4e',
  
  /**
   * Escala da grade (0.05-0.5)
   * Valores menores = grade mais densa
   */
  gridScale: 0.1,
  
  /**
   * Estilo das linhas
   * Opções: 'solid', 'dashed', 'dotted'
   */
  lineStyle: 'solid',
  
  /**
   * Trepidação das linhas (0-1)
   * 0 = linhas estáticas
   * 1 = máxima trepidação
   */
  lineJitter: 0.1,
  
  // ============================================
  // CONFIGURAÇÕES DE SCAN
  // ============================================
  
  /**
   * Cor do scan (onda que percorre)
   */
  scanColor: '#FF9FFC',
  
  /**
   * Opacidade do scan (0-1)
   */
  scanOpacity: 0.4,
  
  /**
   * Direção do scan
   * Opções: 'forward', 'backward', 'pingpong'
   */
  scanDirection: 'pingpong',
  
  /**
   * Duração do scan em segundos
   */
  scanDuration: 2.0,
  
  /**
   * Delay entre scans em segundos
   */
  scanDelay: 2.0,
  
  /**
   * Brilho do scan (0.1-2)
   */
  scanGlow: 0.5,
  
  /**
   * Suavidade do scan (0.5-5)
   */
  scanSoftness: 2,
  
  /**
   * Taper da fase do scan (0-0.49)
   * Controla o fade in/out
   */
  scanPhaseTaper: 0.9,
  
  /**
   * Scan ao clicar
   */
  scanOnClick: false,
  
  // ============================================
  // EFEITOS PÓS-PROCESSAMENTO
  // ============================================
  
  /**
   * Ativar efeitos de pós-processamento
   */
  enablePost: true,
  
  /**
   * Intensidade do bloom (0-2)
   */
  bloomIntensity: 0.6,
  
  /**
   * Threshold do bloom (0-1)
   */
  bloomThreshold: 0,
  
  /**
   * Suavização do bloom (0-1)
   */
  bloomSmoothing: 0,
  
  /**
   * Aberração cromática (0-0.01)
   * Efeito de separação de cores
   */
  chromaticAberration: 0.002,
  
  /**
   * Intensidade do ruído (0-0.1)
   */
  noiseIntensity: 0.01,
  
  // ============================================
  // PERFORMANCE
  // ============================================
  
  /**
   * Delay para voltar ao centro (ms)
   */
  snapBackDelay: 250,
};

/**
 * PRESETS GRIDSCAN
 */
export const gridScanPresets = {
  // Configuração padrão (cyberpunk rosa)
  default: {
    ...gridScanConfig
  },
  
  // Tema Matrix (verde)
  matrix: {
    ...gridScanConfig,
    linesColor: '#003300',
    scanColor: '#00ff00',
    lineJitter: 0.2,
    scanGlow: 1,
  },
  
  // Tema Tron (azul ciano)
  tron: {
    ...gridScanConfig,
    linesColor: '#001a33',
    scanColor: '#00d9ff',
    gridScale: 0.15,
    bloomIntensity: 1,
  },
  
  // Tema Cyberpunk (roxo/rosa)
  cyberpunk: {
    ...gridScanConfig,
    linesColor: '#1a0033',
    scanColor: '#ff00ff',
    lineJitter: 0.15,
    scanGlow: 0.8,
    chromaticAberration: 0.004,
  },
  
  // Minimalista (sutil)
  minimal: {
    ...gridScanConfig,
    linesColor: '#1a1a2e',
    scanColor: '#6c63ff',
    scanOpacity: 0.2,
    bloomIntensity: 0.3,
    lineJitter: 0,
  },
  
  // Performance otimizada
  performance: {
    ...gridScanConfig,
    enablePost: false,
    lineJitter: 0,
    scanGlow: 0.3,
  },
};

export default gridScanConfig;
