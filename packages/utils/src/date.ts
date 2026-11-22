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
] as const;

export function getCurrentMonth(referenceDate: Date = new Date()): string {
  const year = referenceDate.getFullYear();
  const month = String(referenceDate.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function parseYearMonth(
  yearMonth: string
): [number | undefined, number | undefined] {
  if (!yearMonth || !/^\d{4}-\d{2}$/.test(yearMonth)) {
    return [undefined, undefined];
  }
  const [year, month] = yearMonth.split('-').map(Number);
  if (!year || !month || month < 1 || month > 12) {
    return [undefined, undefined];
  }
  return [year, month];
}

export function shiftMonth(yearMonth: string, delta: number): string {
  const [year, month] = parseYearMonth(yearMonth);
  if (!year || !month) return getCurrentMonth();
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(yearMonth: string): string {
  const [year, month] = parseYearMonth(yearMonth);
  if (!year || !month) return yearMonth;
  return `${MONTH_NAMES_PT[month - 1]} ${year}`;
}

export function formatDateBR(dateValue: string | Date | null | undefined): string {
  if (!dateValue) return '-';
  const date = typeof dateValue === 'string' ? new Date(dateValue) : dateValue;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
}
