import type { Purchase } from '@cointrack/types';
import { useCRUD } from './useCRUD';
import { purchaseService } from '../services/api';

export function usePurchases(month: string) {
  return useCRUD<Purchase>({
    fetchFn: (page, limit) => purchaseService.getAll(month, page, limit),
    deleteFn: (id) => purchaseService.delete(id),
    deps: [month],
    paginated: true,
  });
}
