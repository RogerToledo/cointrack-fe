const SHORT_MONTH_NAMES_PT = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
];

export function getCurrentYearMonth(): { year: number; month: number } {
    const now = new Date();
    return {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
    };
}

export function formatYearMonthString(year: number, month: number): string {
    return `${year}-${String(month).padStart(2, '0')}`;
}

export function formatMonthLabel(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
}

export function formatShortCompetence(year: number, month: number): string {
    const label = SHORT_MONTH_NAMES_PT[month - 1] ?? String(month).padStart(2, '0');
    return `${label}/${year}`;
}

export function parseMonthFromQuery(query: {
    month?: string | string[];
    year?: string | string[];
}): string | null {
    const rawMonth = Array.isArray(query.month) ? query.month[0] : query.month;
    const rawYear = Array.isArray(query.year) ? query.year[0] : query.year;

    if (!rawMonth || !rawYear) return null;

    const month = Number(rawMonth);
    const year = Number(rawYear);

    if (
        Number.isInteger(month) &&
        month >= 1 &&
        month <= 12 &&
        Number.isInteger(year) &&
        year >= 1900 &&
        year <= 2100
    ) {
        return formatYearMonthString(year, month);
    }

    return null;
}
