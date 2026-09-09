import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface Expense {
  id: string;
  description: string;
  frequency: string;
  amount: number;
  estimated_amount: number;
  due_date: string;
  payment_date: string;
  payment_type_id: string;
  credit_card_id: string;
  active: boolean;
  paid: boolean;
}

export function useExpenses(month: string) {
  return useCRUD<Expense>({
    fetchFn: () => apiClient.get(`/v1/expenses?month=${month}`).then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/expenses/${id}`),
    deps: [month],
  });
}
