import {
  createApiClient,
  createAuthService,
  createCreditCardService,
  createDashboardService,
  createEarningService,
  createExpenseService,
  createFamilyService,
  createInstallmentService,
  createInvestmentService,
  createInvoiceService,
  createPaymentTypeService,
  createPersonService,
  createPurchaseService,
  createPurchaseTypeService,
} from '@cointrack/services';

const webStorageAdapter = {
  getToken: () => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('token');
  },
  removeToken: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiration');
  },
  removeUser: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('user');
    localStorage.removeItem('selectedFamilyId');
  },
};

export const apiClient = createApiClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8180',
  storage: webStorageAdapter,
  onUnauthorized: () => {
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  },
});

export const authService = createAuthService(apiClient);
export const dashboardService = createDashboardService(apiClient);
export const creditCardService = createCreditCardService(apiClient);
export const purchaseService = createPurchaseService(apiClient);
export const expenseService = createExpenseService(apiClient);
export const earningService = createEarningService(apiClient);
export const investmentService = createInvestmentService(apiClient);
export const invoiceService = createInvoiceService(apiClient);
export const installmentService = createInstallmentService(apiClient);
export const familyService = createFamilyService(apiClient);
export const personService = createPersonService(apiClient);
export const paymentTypeService = createPaymentTypeService(apiClient);
export const purchaseTypeService = createPurchaseTypeService(apiClient);
