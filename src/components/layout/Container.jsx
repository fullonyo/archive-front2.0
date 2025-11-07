import PropTypes from 'prop-types';

/**
 * Container component - daily.dev inspired centralized layout
 * 
 * Variants:
 * - default: max-w-[1440px] - Para grids de assets (3 colunas em XL)
 * - narrow: max-w-[1024px] - Para conteúdo de leitura/detalhes
 * - full: sem max-width - Para conteúdo que precisa usar toda largura
 */
const Container = ({ 
  children, 
  variant = 'default',
  className = '',
  noPadding = false 
}) => {
  const variants = {
    default: 'max-w-[1600px]',
    narrow: 'max-w-[1024px]',
    wide: 'max-w-[1920px]',
    full: 'max-w-full'
  };

  const paddingClasses = noPadding 
    ? '' 
    : 'px-3 sm:px-4 lg:px-6 py-4 sm:py-5';

  return (
    <div className={`
      w-full mx-auto
      ${variants[variant]}
      ${paddingClasses}
      ${className}
    `}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'narrow', 'wide', 'full']),
  className: PropTypes.string,
  noPadding: PropTypes.bool
};

export default Container;
