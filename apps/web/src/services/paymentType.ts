import { paymentTypeService } from './api';

export type {
  PaymentType,
  PaymentTypeResponse,
  PaymentTypesResponse,
} from '@cointrack/types';

export const createPaymentType = paymentTypeService.create;
export const updatePaymentType = paymentTypeService.update;
export const deletePaymentType = paymentTypeService.delete;
export const getPaymentType = paymentTypeService.getById;
export const getPaymentTypes = paymentTypeService.getAll;
