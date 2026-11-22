import { purchaseService } from './api';

export type {
  Purchase,
  PurchaseResponse,
  PurchasesResponse,
  PurchasesPaginatedResponse,
} from '@cointrack/types';

export const createPurchase = purchaseService.create;
export const updatePurchase = purchaseService.update;
export const deletePurchase = purchaseService.delete;
export const getPurchase = purchaseService.getById;
export const getPurchases = purchaseService.getAll;
