import { useState, useCallback, useMemo } from 'react';

const MONTH_NAMES_PT = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

interface MonthNavigationReturn {
  currentMonth: string;
  displayLabel: string;
  goToPrevious: () => void;
  goToNext: () => void;
  canGoNext: boolean;
  setCurrentMonth: (month: string) => void;
}

function getCurrentMonth(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function parseMonth(monthStr: string): { year: number; month: number } {
  const [yearStr, monthStr2] = monthStr.split('-');
  return { year: parseInt(yearStr, 10), month: parseInt(monthStr2, 10) };
}

function formatMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function useMonthNavigation(): MonthNavigationReturn {
  const [currentMonth, setCurrentMonth] = useState<string>(getCurrentMonth);

  const displayLabel = useMemo(() => {
    const { year, month } = parseMonth(currentMonth);
    return `${MONTH_NAMES_PT[month - 1]} ${year}`;
  }, [currentMonth]);

  const canGoNext = useMemo(() => {
    return currentMonth !== getCurrentMonth();
  }, [currentMonth]);

  const goToPrevious = useCallback(() => {
    setCurrentMonth((prev) => {
      const { year, month } = parseMonth(prev);
      if (month === 1) {
        return formatMonth(year - 1, 12);
      }
      return formatMonth(year, month - 1);
    });
  }, []);

  const goToNext = useCallback(() => {
    setCurrentMonth((prev) => {
      const current = getCurrentMonth();
      if (prev === current) {
        return prev;
      }
      const { year, month } = parseMonth(prev);
      if (month === 12) {
        return formatMonth(year + 1, 1);
      }
      return formatMonth(year, month + 1);
    });
  }, []);

  const setMonth = useCallback((month: string) => {
    setCurrentMonth(month);
  }, []);

  return {
    currentMonth,
    displayLabel,
    goToPrevious,
    goToNext,
    canGoNext,
    setCurrentMonth: setMonth,
  };
}
