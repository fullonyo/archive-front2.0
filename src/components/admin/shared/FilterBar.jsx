import React, { useState, useCallback } from 'react';
import { Search, X, Filter, ChevronDown } from 'lucide-react';

/**
 * FilterBar - Barra de filtros e busca reutilizável
 * Usado em: Users, Assets, Reports, Logs
 */
const FilterBar = ({ 
  searchPlaceholder = 'Search...',
  onSearchChange,
  filters = [], // [{ key: 'role', label: 'Role', options: [...] }]
  activeFilters = {},
  onFilterChange,
  onClearFilters,
  showClearButton = true,
  className = ''
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [openDropdown, setOpenDropdown] = useState(null);

  const handleSearchChange = useCallback((e) => {
    const value = e.target.value;
    setSearchValue(value);
    onSearchChange?.(value);
  }, [onSearchChange]);

  const handleClearSearch = useCallback(() => {
    setSearchValue('');
    onSearchChange?.('');
  }, [onSearchChange]);

  const handleFilterSelect = useCallback((filterKey, value) => {
    onFilterChange?.(filterKey, value);
    setOpenDropdown(null);
  }, [onFilterChange]);

  const toggleDropdown = useCallback((filterKey) => {
    setOpenDropdown(prev => prev === filterKey ? null : filterKey);
  }, []);

  const hasActiveFilters = Object.values(activeFilters).some(v => v !== null && v !== undefined && v !== '');

  return (
    <div className={`bg-surface-float border border-white/10 rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search Input */}
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" size={16} />
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full h-10 pl-10 pr-10 bg-surface-float2 border border-white/5 rounded-lg text-sm 
              focus:outline-none focus:border-theme-active/50 transition-colors placeholder:text-text-tertiary"
          />
          {searchValue && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => {
          const activeValue = activeFilters[filter.key];
          const selectedOption = filter.options?.find(opt => opt.value === activeValue);
          
          return (
            <div key={filter.key} className="relative">
              <button
                onClick={() => toggleDropdown(filter.key)}
                className={`
                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                  ${activeValue 
                    ? 'bg-theme-active text-white' 
                    : 'bg-surface-float2 text-text-secondary hover:text-text-primary hover:bg-surface-float2/80'
                  }
                `}
              >
                {filter.icon && <filter.icon size={14} />}
                <span>{selectedOption?.label || filter.label}</span>
                <ChevronDown 
                  size={14} 
                  className={`transition-transform ${openDropdown === filter.key ? 'rotate-180' : ''}`} 
                />
              </button>

              {/* Dropdown Menu */}
              {openDropdown === filter.key && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setOpenDropdown(null)}
                  />
                  <div className="absolute top-full mt-2 left-0 z-20 min-w-[180px] bg-surface-float border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <div className="max-h-[300px] overflow-y-auto">
                      {/* All/Clear option */}
                      <button
                        onClick={() => handleFilterSelect(filter.key, null)}
                        className={`
                          w-full px-4 py-2 text-left text-sm transition-colors
                          ${!activeValue 
                            ? 'bg-theme-active/20 text-theme-active' 
                            : 'hover:bg-surface-float2 text-text-secondary'
                          }
                        `}
                      >
                        All {filter.label}
                      </button>

                      {/* Options */}
                      {filter.options?.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => handleFilterSelect(filter.key, option.value)}
                          className={`
                            w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2
                            ${activeValue === option.value 
                              ? 'bg-theme-active/20 text-theme-active' 
                              : 'hover:bg-surface-float2 text-text-primary'
                            }
                          `}
                        >
                          {option.icon && <option.icon size={14} />}
                          <span>{option.label}</span>
                          {option.count !== undefined && (
                            <span className="ml-auto text-xs text-text-tertiary">
                              {option.count}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}

        {/* Clear All Filters Button */}
        {showClearButton && hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-text-primary bg-surface-float2 hover:bg-surface-float2/80 transition-colors"
          >
            <X size={14} />
            Clear Filters
          </button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/5">
          <span className="text-xs text-text-tertiary">Active filters:</span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(activeFilters).map(([key, value]) => {
              if (!value) return null;
              
              const filter = filters.find(f => f.key === key);
              const option = filter?.options?.find(opt => opt.value === value);
              
              return (
                <button
                  key={key}
                  onClick={() => handleFilterSelect(key, null)}
                  className="inline-flex items-center gap-1.5 px-2 py-1 bg-theme-active/20 text-theme-active rounded-md text-xs font-medium hover:bg-theme-active/30 transition-colors"
                >
                  <span>{filter?.label}: {option?.label || value}</span>
                  <X size={12} />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
