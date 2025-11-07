/**
 * PageHeader component - Consistent page header across the application
 */
const PageHeader = ({ 
  title, 
  description, 
  action,
  icon: Icon,
  className = '' 
}) => {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {Icon && <Icon size={32} className="text-theme-active" />}
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
              {title}
            </h1>
          </div>
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
    </div>
  );
};

export default PageHeader;
