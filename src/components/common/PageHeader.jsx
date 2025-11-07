import PropTypes from 'prop-types';

/**
 * PageHeader component - Consistent page header across the application
 */
const PageHeader = ({ 
  title, 
  description, 
  action,
  className = '' 
}) => {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-text-primary">
          {title}
        </h1>
        {description && (
          <p className="text-text-secondary text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string
};

export default PageHeader;
