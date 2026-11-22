import type { CreditCard } from '@cointrack/types';
import { useCRUD } from './useCRUD';
import { creditCardService } from '../services/api';

export function useCreditCards() {
  return useCRUD<CreditCard>({
    fetchFn: () => creditCardService.getAll(),
    deleteFn: (id) => creditCardService.delete(id),
  });
}
