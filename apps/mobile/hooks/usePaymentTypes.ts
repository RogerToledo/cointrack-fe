import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface PaymentType {
  id: string;
  name: string;
  spot_payment: number;
}

export function usePaymentTypes() {
  return useCRUD<PaymentType>({
    fetchFn: () => apiClient.get('/v1/paymentTypes').then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/paymentTypes/${id}`),
  });
}
