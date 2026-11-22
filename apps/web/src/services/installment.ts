import { installmentService } from './api';

export type {
  Installment,
  InstallmentResponse,
  InstallmentPayResponse,
} from '@cointrack/types';

export const getPurchasesInstallments = installmentService.getByPurchase;
export const payInstallment = installmentService.pay;
