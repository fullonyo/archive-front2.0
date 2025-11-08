import React, { useState, useCallback } from 'react';
import { Calendar } from 'lucide-react';
import { format, subDays, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';

/**
 * Date Range Picker Component
 * @param {Object} props
 * @param {Function} props.onChange - Callback when date range changes
 * @param {Date} props.startDate - Initial start date
 * @param {Date} props.endDate - Initial end date
 */
const DateRangePicker = ({ onChange, startDate, endDate }) => {
  const [selectedRange, setSelectedRange] = useState('last30days');
  const [customStart, setCustomStart] = useState(
    startDate ? format(startDate, 'yyyy-MM-dd') : ''
  );
  const [customEnd, setCustomEnd] = useState(
    endDate ? format(endDate, 'yyyy-MM-dd') : ''
  );

  const presetRanges = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'lastMonth', label: 'Mês passado' },
    { value: 'last3months', label: 'Últimos 3 meses' },
    { value: 'thisYear', label: 'Este ano' },
    { value: 'custom', label: 'Customizado' }
  ];

  const getDateRange = useCallback((range) => {
    const now = new Date();
    let start, end;

    switch (range) {
      case 'today':
        start = end = now;
        break;
      case 'yesterday':
        start = end = subDays(now, 1);
        break;
      case 'last7days':
        start = subDays(now, 7);
        end = now;
        break;
      case 'last30days':
        start = subDays(now, 30);
        end = now;
        break;
      case 'thisMonth':
        start = startOfMonth(now);
        end = endOfMonth(now);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(now, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'last3months':
        start = subMonths(now, 3);
        end = now;
        break;
      case 'thisYear':
        start = startOfYear(now);
        end = endOfYear(now);
        break;
      default:
        return null;
    }

    return { start, end };
  }, []);

  const handleRangeChange = useCallback((range) => {
    setSelectedRange(range);

    if (range === 'custom') {
      // Wait for user to input custom dates
      return;
    }

    const dates = getDateRange(range);
    if (dates && onChange) {
      onChange(dates.start, dates.end);
    }
  }, [getDateRange, onChange]);

  const handleCustomDateChange = useCallback(() => {
    if (customStart && customEnd && onChange) {
      onChange(new Date(customStart), new Date(customEnd));
    }
  }, [customStart, customEnd, onChange]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} className="text-text-secondary" />
        <span className="text-sm font-medium text-text-primary">Período</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {presetRanges.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
              selectedRange === range.value
                ? 'bg-theme-active text-white border-theme-active'
                : 'bg-surface-float text-text-secondary border-white/5 hover:border-white/10 hover:bg-surface-float2'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {selectedRange === 'custom' && (
        <div className="flex items-center gap-3 p-3 bg-surface-float rounded-lg border border-white/5">
          <div className="flex-1">
            <label className="block text-xs text-text-tertiary mb-1">Data Inicial</label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 bg-surface-base text-text-primary text-sm rounded-lg border border-white/10 focus:border-theme-active focus:outline-none"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-text-tertiary mb-1">Data Final</label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 bg-surface-base text-text-primary text-sm rounded-lg border border-white/10 focus:border-theme-active focus:outline-none"
            />
          </div>
          <button
            onClick={handleCustomDateChange}
            disabled={!customStart || !customEnd}
            className="px-4 py-2 bg-theme-active text-white text-sm rounded-lg hover:bg-theme-hover disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            style={{ marginTop: '20px' }}
          >
            Aplicar
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(DateRangePicker);
