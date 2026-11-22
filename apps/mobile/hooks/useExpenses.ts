import type { Expense } from '@cointrack/types';
import { parseYearMonth } from '@cointrack/utils';
import { useCRUD } from './useCRUD';
import { expenseService } from '../services/api';

export function useExpenses(month: string) {
  return useCRUD<Expense>({
    fetchFn: () => {
      const [year, m] = parseYearMonth(month);
      return expenseService.getAll(year, m);
    },
    deleteFn: (id) => expenseService.delete(id),
    deps: [month],
  });
}
