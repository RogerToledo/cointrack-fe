import {
  createApiClient,
  createAuthService,
  createDashboardService,
  createCreditCardService,
  createPurchaseService,
  createExpenseService,
  createEarningService,
  createInvestmentService,
  createInvoiceService,
  createInstallmentService,
  createFamilyService,
  createPersonService,
  createPaymentTypeService,
  createPurchaseTypeService,
} from '@cointrack/services';
import { secureStorageAdapter } from '../utils/storage';
import { API_BASE_URL } from '../constants/config';

let onUnauthorizedCallback: (() => void) | null = null;

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

export const apiClient = createApiClient({
  baseURL: API_BASE_URL,
  storage: secureStorageAdapter,
  onUnauthorized: () => onUnauthorizedCallback?.(),
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
