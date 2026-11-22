import type { Earning } from '@cointrack/types';
import { parseYearMonth } from '@cointrack/utils';
import { useCRUD } from './useCRUD';
import { earningService } from '../services/api';

export function useEarnings(month: string) {
  return useCRUD<Earning>({
    fetchFn: () => {
      const [year, m] = parseYearMonth(month);
      return earningService.getAll(year, m);
    },
    deleteFn: (id) => earningService.delete(id),
    deps: [month],
  });
}
