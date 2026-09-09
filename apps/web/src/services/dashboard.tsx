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

export const getDashboard = async (month: string) => {
    const response = await instance.get<DashboardResponse>('/v1/summary', {
        params: { month }
    });

    return response.data;
};
