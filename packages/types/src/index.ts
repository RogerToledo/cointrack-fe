// Generic API wrappers
export interface ApiResponse<T> {
  message: T;
  statusCode: number;
}

export interface PaginatedPayload<T> {
  responses: T[];
  quantity?: number;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export type PaginatedResponse<T> = ApiResponse<PaginatedPayload<T>>;

export interface ApiError {
  response?: {
    data?: {
      message?: string;
    };
    status?: number;
  };
  message?: string;
}

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

export type DashboardResponse = ApiResponse<DashboardData>;

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

export type CreditCardResponse = ApiResponse<CreditCard>;
export type CreditCardsResponse = ApiResponse<CreditCard[]>;

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

// Purchase types
export interface Purchase {
  id: string;
  description: string;
  amount: number;
  date: string;
  installment_number: number;
  place: string;
  paid: boolean;
  payment_type_id: string;
  credit_card_id: string;
  purchase_type_id: string;
  person_id: string;
  payment_type: string;
  credit_card: string;
  purchase_type: string;
  person: string;
  installment_id?: string;
  installment_info?: string;
}

export type PurchaseResponse = ApiResponse<Purchase>;
export type PurchasesResponse = ApiResponse<Purchase[]>;
export type PurchasesPaginatedResponse = PaginatedResponse<Purchase>;

// Installment types
export interface Installment {
  id: string;
  description: string;
  number: number;
  value: number;
  due_date: string;
  paid: boolean;
}

export type InstallmentResponse = ApiResponse<Installment | Installment[]>;
export type InstallmentPayResponse = ApiResponse<string>;

// Expense types
export interface Expense {
  id: string;
  description: string;
  frequency: string;
  amount: number;
  estimated_amount: number;
  due_date: string;
  payment_date: string;
  payment_type_id: string;
  payment_type: string;
  credit_card_id: string;
  active: boolean;
  paid: boolean;
}

export type ExpenseResponse = ApiResponse<Expense>;
export type ExpensesResponse = ApiResponse<Expense[]>;

// Earning types
export type EarningPeriodicity = 'MENSAL' | 'SEMESTRAL' | 'ANUAL' | 'SPOT';

export const PERIODICITIES: Array<{ value: EarningPeriodicity; label: string }> = [
  { value: 'MENSAL', label: 'Mensal' },
  { value: 'SEMESTRAL', label: 'Semestral' },
  { value: 'ANUAL', label: 'Anual' },
  { value: 'SPOT', label: 'Pontual' },
];

export const PERIODICITY_LABELS: Record<string, string> = {
  MENSAL: 'Mensal',
  SEMESTRAL: 'Semestral',
  ANUAL: 'Anual',
  SPOT: 'Pontual',
};

export interface EarningRecord {
  id: string;
  id_earning: string;
  date: string;
  gross_pay: number;
  net_pay: number;
  deduction: number;
}

export interface Earning {
  id: string;
  description: string;
  idUser: string;
  personName?: string;
  periodicity: string;
  record: EarningRecord;
}

export type EarningResponse = ApiResponse<Earning>;
export type EarningsResponse = ApiResponse<Earning[]>;

export interface EarningPayload {
  description: string;
  id_user: string;
  periodicity: string;
}

export type EarningDefinitionPayload = EarningPayload;

export interface EarningRecordPayload {
  id_earning: string;
  date: string;
  gross_pay: number;
  net_pay: number;
}

// Investment types
export interface InvestmentInstallment {
  id: string;
  number: number;
  value: number;
  due_date: string;
  paid: boolean;
}

export interface Investment {
  id: string;
  description: string;
  monthly_amount: number;
  installments: number;
  start_date: string;
  person_id: string;
  person: string;
  total: number;
  paid_amount: number;
  records?: InvestmentInstallment[];
}

export type InvestmentResponse = ApiResponse<Investment>;
export type InvestmentsPaginatedResponse = PaginatedResponse<Investment>;

// Invoice types
export interface InvoicePurchase {
  id: string;
  description: string;
  amount: number;
  date: string;
  installment_number: number;
  installment_value: number;
  place: string;
  paid: boolean;
  payment_type_id: string;
  credit_card_id: string;
  purchase_type_id: string;
  person_id: string;
  payment_type: string;
  credit_card: string;
  purchase_type: string;
  person: string;
}

export interface Invoice {
  invoice_date: string;
  purchases: InvoicePurchase[];
}

export type InvoiceResponse = ApiResponse<Invoice>;
export type InvoiceStatus = 'Aberta' | 'Pagar' | 'Pago';
export type InvoiceStatusResponse = ApiResponse<{ status: InvoiceStatus }>;

// Family types
export interface FamilyMember {
  id: string;
  family_id: string;
  person_id: string;
  role: string;
  status: string;
  invited_at: string;
  joined_at?: string;
  person_name: string;
  person_email: string;
  family_name: string;
}

export interface Family {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  members?: FamilyMember[];
}

export type FamiliesResponse = ApiResponse<Family | Family[]>;

export interface FamilyInvite {
  id: string;
  family_id: string;
  person_id: string;
  role: string;
  status: 'pending' | 'accepted' | 'rejected';
  invited_at: string;
  person_name: string;
  family_name: string;
}

export type InvitesResponse = ApiResponse<FamilyInvite[]>;
export type MembersResponse = ApiResponse<FamilyMember[]>;

// Person / Me types
export interface Person {
  id: string;
  name: string;
}

export type PersonResponse = ApiResponse<Person[]>;
export type PeopleResponse = ApiResponse<Person>;

export interface MeUser {
  id: string;
  name: string;
  email: string;
  level: string;
}

export interface MeResponse {
  message: {
    user: MeUser;
    families: unknown[];
  };
  statusCode: number;
}

// PaymentType & PurchaseType
export interface PaymentType {
  id: string;
  name: string;
  spot_payment: number;
}

export type PaymentTypeResponse = ApiResponse<PaymentType>;
export type PaymentTypesResponse = ApiResponse<PaymentType[]>;

export interface PurchaseType {
  id: string;
  name: string;
}

export type PurchaseTypeResponse = ApiResponse<PurchaseType>;
export type PurchaseTypesResponse = ApiResponse<PurchaseType[]>;

// Dashboard Summary (Spec 0002)
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
  overview?: DashboardOverview;
  items: DashboardSummaryItem[];
  categories_breakdown?: CategoryBreakdown[];
}

export type DashboardSummaryResponse = ApiResponse<DashboardSummaryData>;
