import { useCRUD } from './useCRUD';
import { creditCardService } from '../services/api';

interface CreditCard {
  id: string;
  owner: string;
  owner_id: string;
  final_card_num: string;
  type: string;
  invoice_closing_day: number;
  due_date: number;
  card_name?: string;
  physical_card_id?: string;
}

export function useCreditCards() {
  return useCRUD<CreditCard>({
    fetchFn: () => creditCardService.getAll(),
    deleteFn: (id) => creditCardService.delete(id),
  });
}
