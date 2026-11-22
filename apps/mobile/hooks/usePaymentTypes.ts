import type { PaymentType } from '@cointrack/types';
import { useCRUD } from './useCRUD';
import { paymentTypeService } from '../services/api';

export function usePaymentTypes() {
  return useCRUD<PaymentType>({
    fetchFn: () => paymentTypeService.getAll(),
    deleteFn: (id) => paymentTypeService.delete(id),
  });
}
