import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const Breadcrumb = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex items-center gap-2 text-sm">
        {/* Home */}
        <li>
          <Link
            to="/"
            className="flex items-center gap-1.5 text-text-tertiary hover:text-text-primary transition-colors group"
          >
            <Home size={14} className="group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Início</span>
          </Link>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={index} className="flex items-center gap-2">
              {/* Separator */}
              <ChevronRight size={14} className="text-text-tertiary/50" />
              
              {/* Item */}
              {isLast ? (
                <span className="text-text-primary font-medium max-w-[200px] sm:max-w-md truncate">
                  {item.label}
                </span>
              ) : (
                <Link
                  to={item.path}
                  className="text-text-tertiary hover:text-text-primary transition-colors max-w-[150px] sm:max-w-xs truncate"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
