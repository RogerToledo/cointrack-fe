import { useCRUD } from './useCRUD';
import { apiClient } from '../services/api';

interface Earning {
  id: string;
  description: string;
  amount: number;
  date: string;
  active: boolean;
  is_monthly: boolean;
  person_id: string;
  person_name: string;
  net_salary: number;
}

export function useEarnings(month: string) {
  return useCRUD<Earning>({
    fetchFn: () => apiClient.get(`/v1/earnings?month=${month}`).then((r) => r.data),
    deleteFn: (id) => apiClient.delete(`/v1/earnings/${id}`),
    deps: [month],
  });
}
