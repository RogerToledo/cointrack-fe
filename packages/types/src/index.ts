// Dashboard types
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

// Credit Card types
export interface CreditCard {
    id: string;
    owner_id: string;
    owner: string;
    final_card_num: string;
    type: string;
    invoice_closing_day: number;
    due_date: number;
    card_name?: string;
    physical_card_id?: string;
    parent_card_name?: string;
    physical_card_last4?: string;
}

export interface CreditCardResponse {
    message: CreditCard;
    statusCode: number;
}

export interface CreditCardsResponse {
    message: CreditCard[];
    statusCode: number;
}

// Auth types
export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    level?: string;
}

export interface AuthResponse {
    statusCode: number;
    message: {
        token: string;
    };
}

export interface UserResponse {
    id: string;
    name: string;
    email: string;
}
