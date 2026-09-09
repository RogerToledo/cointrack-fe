import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface Purchase {
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
}

export function usePurchases(month: string) {
  return useCRUD<Purchase>({
    fetchFn: (page, limit) =>
      apiClient
        .get(`/v1/purchases?month=${month}&page=${page}&limit=${limit}`)
        .then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/purchases/${id}`),
    deps: [month],
    paginated: true,
  });
}
