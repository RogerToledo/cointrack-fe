import React from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { getCurrentMonth, shiftMonth } from '@cointrack/utils';

interface MonthNavigatorProps {
  value: string;
  onChange: (month: string) => void;
  disableFuture?: boolean;
  className?: string;
}

export function MonthNavigator({
  value,
  onChange,
  disableFuture = false,
  className = '',
}: MonthNavigatorProps) {
  const currentMonth = getCurrentMonth();
  const isNextDisabled = disableFuture && value >= currentMonth;

  return (
    <div
      className={`inline-flex items-center gap-1 bg-card border border-border rounded-xl p-1 shadow-[var(--shadow-xs)] ${className}`}
    >
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value || currentMonth, -1))}
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="relative flex items-center">
        <Calendar className="w-4 h-4 text-accent pointer-events-none ml-2 hidden sm:block" />
        <input
          type="month"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent px-2.5 py-1.5 text-sm font-medium text-foreground focus:outline-none cursor-pointer"
          aria-label="Selecionar mês"
        />
      </div>
      <button
        type="button"
        onClick={() => onChange(shiftMonth(value || currentMonth, 1))}
        disabled={isNextDisabled}
        className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent"
        aria-label="Próximo mês"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}

export default MonthNavigator;
