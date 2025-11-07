/**
 * TextType Configuration
 * 
 * Configurações do componente de texto com efeito de digitação.
 */

export const textTypeConfig = {
  // ============================================
  // CONFIGURAÇÕES DE TEXTO
  // ============================================
  
  /**
   * Textos a serem exibidos
   * Array de strings que serão digitadas em sequência
   */
  texts: [
    "Welcome to Lhama Archive",
    "Your VRChat Assets Hub",
    "Discover Amazing Content"
  ],
  
  /**
   * Tag HTML do componente
   * Opções: 'h1', 'h2', 'h3', 'p', 'div', 'span'
   */
  as: 'h1',
  
  // ============================================
  // CONFIGURAÇÕES DE ANIMAÇÃO
  // ============================================
  
  /**
   * Velocidade de digitação em ms
   * Valores menores = mais rápido
   */
  typingSpeed: 75,
  
  /**
   * Delay inicial antes de começar (ms)
   */
  initialDelay: 0,
  
  /**
   * Pausa entre textos (ms)
   */
  pauseDuration: 1500,
  
  /**
   * Velocidade de apagar em ms
   * Valores menores = mais rápido
   */
  deletingSpeed: 30,
  
  /**
   * Loop infinito dos textos
   */
  loop: true,
  
  /**
   * Modo reverso (digita de trás pra frente)
   */
  reverseMode: false,
  
  /**
   * Iniciar apenas quando visível
   */
  startOnVisible: false,
  
  // ============================================
  // VELOCIDADE VARIÁVEL (OPCIONAL)
  // ============================================
  
  /**
   * Ativar velocidade variável
   * Descomente para usar velocidade aleatória
   */
  // variableSpeed: {
  //   min: 50,
  //   max: 150
  // },
  
  // ============================================
  // CONFIGURAÇÕES DO CURSOR
  // ============================================
  
  /**
   * Exibir cursor piscante
   */
  showCursor: true,
  
  /**
   * Caractere do cursor
   */
  cursorCharacter: '|',
  
  /**
   * Classes CSS adicionais do cursor
   */
  cursorClassName: 'text-theme-active',
  
  /**
   * Duração do piscar do cursor (segundos)
   */
  cursorBlinkDuration: 0.5,
  
  /**
   * Esconder cursor enquanto digita
   */
  hideCursorWhileTyping: false,
  
  // ============================================
  // CORES DOS TEXTOS
  // ============================================
  
  /**
   * Array de cores para cada texto
   * Usa cores CSS (RGB, HEX, var())
   */
  textColors: [
    'rgb(var(--text-primary))',
    'rgb(var(--theme-active))',
    'rgb(var(--theme-hover))'
  ],
  
  // ============================================
  // CLASSES CSS
  // ============================================
  
  /**
   * Classes CSS adicionais
   */
  className: 'text-5xl md:text-6xl lg:text-7xl font-bold'
};

// ============================================
// PRESETS
// ============================================

export const textTypePresets = {
  // Preset para títulos heroicos
  hero: {
    ...textTypeConfig,
    typingSpeed: 75,
    pauseDuration: 2000,
    className: 'text-6xl md:text-7xl lg:text-8xl font-black tracking-tight'
  },
  
  // Preset para subtítulos
  subtitle: {
    ...textTypeConfig,
    typingSpeed: 50,
    pauseDuration: 1500,
    showCursor: false,
    className: 'text-2xl md:text-3xl lg:text-4xl font-semibold'
  },
  
  // Preset para efeito rápido
  fast: {
    ...textTypeConfig,
    typingSpeed: 30,
    deletingSpeed: 15,
    pauseDuration: 1000,
    className: 'text-4xl md:text-5xl font-bold'
  },
  
  // Preset para efeito lento/dramático
  slow: {
    ...textTypeConfig,
    typingSpeed: 150,
    deletingSpeed: 75,
    pauseDuration: 3000,
    cursorBlinkDuration: 0.8,
    className: 'text-5xl md:text-6xl font-bold'
  },
  
  // Preset para texto único (sem loop)
  single: {
    ...textTypeConfig,
    loop: false,
    deletingSpeed: 0,
    texts: ["Welcome to Lhama Archive"],
    className: 'text-4xl md:text-5xl lg:text-6xl font-bold'
  }
};

export default textTypeConfig;
