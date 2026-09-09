import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface PurchaseType {
  id: string;
  name: string;
}

export function usePurchaseTypes() {
  return useCRUD<PurchaseType>({
    fetchFn: () => apiClient.get('/v1/purchaseTypes').then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/purchaseTypes/${id}`),
  });
}
