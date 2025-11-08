import React, { useState, useCallback } from 'react';
import { ChevronDown, ChevronUp, Loader, MoreVertical } from 'lucide-react';

/**
 * DataTable - Componente de tabela de dados reutilizável
 * Features: Sorting, Selection, Actions, Loading states, Empty states
 * Usado em: Users, Assets, Reports, Logs
 */
const DataTable = ({
  columns = [], // [{ key, label, sortable, render, width }]
  data = [],
  loading = false,
  emptyState,
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  actions, // [{ label, icon, onClick, variant }]
  onRowClick,
  sortBy,
  sortOrder = 'asc',
  onSort,
  className = ''
}) => {
  const [expandedActions, setExpandedActions] = useState(null);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedRows.length === data.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(data.map((_, index) => index));
    }
  }, [selectedRows.length, data, onSelectionChange]);

  // Handle individual row selection
  const handleSelectRow = useCallback((index) => {
    const newSelection = selectedRows.includes(index)
      ? selectedRows.filter(i => i !== index)
      : [...selectedRows, index];
    onSelectionChange?.(newSelection);
  }, [selectedRows, onSelectionChange]);

  // Handle sort
  const handleSort = useCallback((columnKey) => {
    if (!onSort) return;
    
    const newOrder = sortBy === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newOrder);
  }, [sortBy, sortOrder, onSort]);

  // Toggle actions menu
  const toggleActions = useCallback((index) => {
    setExpandedActions(prev => prev === index ? null : index);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={`bg-surface-float border border-white/10 rounded-xl overflow-hidden ${className}`}>
        <div className="p-12 text-center">
          <Loader size={32} className="animate-spin text-theme-active mx-auto mb-4" />
          <p className="text-text-secondary">Loading data...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!data || data.length === 0) {
    return (
      <div className={`bg-surface-float border border-white/10 rounded-xl overflow-hidden ${className}`}>
        <div className="p-12 text-center">
          {emptyState || (
            <>
              <p className="text-lg font-semibold text-text-primary mb-2">No data found</p>
              <p className="text-text-secondary">Try adjusting your filters</p>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-float border border-white/10 rounded-xl overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-float2 border-b border-white/10">
            <tr>
              {/* Selection Column */}
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === data.length && data.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-white/20 bg-surface-float text-theme-active focus:ring-2 focus:ring-theme-active"
                  />
                </th>
              )}

              {/* Data Columns */}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`
                    px-4 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider
                    ${column.sortable ? 'cursor-pointer hover:text-text-primary transition-colors' : ''}
                    ${column.width ? column.width : ''}
                  `}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          size={12} 
                          className={sortBy === column.key && sortOrder === 'asc' ? 'text-theme-active' : 'text-text-tertiary'}
                        />
                        <ChevronDown 
                          size={12} 
                          className={`-mt-1 ${sortBy === column.key && sortOrder === 'desc' ? 'text-theme-active' : 'text-text-tertiary'}`}
                        />
                      </div>
                    )}
                  </div>
                </th>
              ))}

              {/* Actions Column */}
              {actions && actions.length > 0 && (
                <th className="w-16 px-4 py-3"></th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-white/5">
            {data.map((row, rowIndex) => {
              const isSelected = selectedRows.includes(rowIndex);

              return (
                <tr
                  key={rowIndex}
                  className={`
                    transition-colors
                    ${onRowClick ? 'cursor-pointer hover:bg-surface-float2' : ''}
                    ${isSelected ? 'bg-theme-active/10' : ''}
                  `}
                  onClick={() => onRowClick?.(row, rowIndex)}
                >
                  {/* Selection Cell */}
                  {selectable && (
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(rowIndex)}
                        className="w-4 h-4 rounded border-white/20 bg-surface-float text-theme-active focus:ring-2 focus:ring-theme-active"
                      />
                    </td>
                  )}

                  {/* Data Cells */}
                  {columns.map((column) => (
                    <td key={column.key} className="px-4 py-3 text-sm">
                      {column.render 
                        ? column.render(row, rowIndex) 
                        : row[column.key]}
                    </td>
                  ))}

                  {/* Actions Cell */}
                  {actions && actions.length > 0 && (
                    <td className="px-4 py-3 relative" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => toggleActions(rowIndex)}
                        className="p-1.5 rounded-lg hover:bg-surface-float2 transition-colors"
                      >
                        <MoreVertical size={16} className="text-text-secondary" />
                      </button>

                      {/* Actions Menu */}
                      {expandedActions === rowIndex && (
                        <>
                          <div 
                            className="fixed inset-0 z-10" 
                            onClick={() => setExpandedActions(null)}
                          />
                          <div className="absolute right-0 top-full mt-1 z-20 min-w-[160px] bg-surface-float border border-white/10 rounded-lg shadow-xl overflow-hidden">
                            {actions.map((action, actionIndex) => {
                              const Icon = action.icon;
                              const variant = action.variant || 'default';
                              
                              return (
                                <button
                                  key={actionIndex}
                                  onClick={() => {
                                    action.onClick?.(row, rowIndex);
                                    setExpandedActions(null);
                                  }}
                                  disabled={action.disabled?.(row)}
                                  className={`
                                    w-full px-4 py-2 text-left text-sm transition-colors flex items-center gap-2
                                    ${variant === 'danger' 
                                      ? 'hover:bg-red-500/10 text-red-400' 
                                      : 'hover:bg-surface-float2 text-text-primary'
                                    }
                                    ${action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : ''}
                                  `}
                                >
                                  {Icon && <Icon size={14} />}
                                  <span>{action.label}</span>
                                </button>
                              );
                            })}
                          </div>
                        </>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
