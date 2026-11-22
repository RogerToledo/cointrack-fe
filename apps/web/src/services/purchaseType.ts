import { purchaseTypeService } from './api';

export type {
  PurchaseType,
  PurchaseTypeResponse,
  PurchaseTypesResponse,
} from '@cointrack/types';

export const createPurchaseType = purchaseTypeService.create;
export const updatePurchaseType = purchaseTypeService.update;
export const deletePurchaseType = purchaseTypeService.delete;
export const getPurchaseType = purchaseTypeService.getById;
export const getPurchaseTypes = purchaseTypeService.getAll;
