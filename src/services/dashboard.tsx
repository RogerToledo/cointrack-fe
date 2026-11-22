import instance from "./config";

export interface DashboardOverview {
    total_income: number;
    total_expenses: number;
    available_balance: number;
    available_percentage: number;
}

export interface DashboardInstallments {
    active_purchases_count: number;
    total_installments_count: number;
    total_amount: number;
}

export interface CategoryBreakdown {
    category: string;
    amount: number;
    percentage: number;
}

export interface DashboardData {
    period: string;
    currency: string;
    overview: DashboardOverview;
    installments: DashboardInstallments;
    categories_breakdown: CategoryBreakdown[];
}

export interface DashboardResponse {
    message: DashboardData;
    statusCode: number;
}

export type DashboardSummaryType = 'PURCHASE' | 'EXPENSE' | 'INVESTMENT' | 'INVOICE';

export interface DashboardSummaryItem {
    type: DashboardSummaryType;
    description: string;
    total_amount: number;
    items_count: number;
    competence: string;
}

export interface DashboardSummaryData {
    total_month: number;
    competence: string;
    items: DashboardSummaryItem[];
}

export interface DashboardSummaryResponse {
    message: DashboardSummaryData;
    statusCode: number;
}

export const getDashboard = async (month: string) => {
    const response = await instance.get<DashboardResponse>('/v1/summary', {
        params: { month }
    });

    return response.data;
};

export const getDashboardSummary = async (
    month: number,
    year: number,
    personId?: string
): Promise<DashboardSummaryResponse> => {
    const params: Record<string, string | number> = { month, year };
    if (personId && personId !== 'all') {
        params.person_id = personId;
    }

    const response = await instance.get<DashboardSummaryResponse>('/v1/dashboard/summary', {
        params,
    });

    return response.data;
};
