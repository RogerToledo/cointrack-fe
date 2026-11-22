import type { PurchaseType } from '@cointrack/types';
import { useCRUD } from './useCRUD';
import { purchaseTypeService } from '../services/api';

export function usePurchaseTypes() {
  return useCRUD<PurchaseType>({
    fetchFn: () => purchaseTypeService.getAll(),
    deleteFn: (id) => purchaseTypeService.delete(id),
  });
}
