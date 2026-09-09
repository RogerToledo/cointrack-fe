import { useCallback, useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage } from '../utils/errorMessage';

interface CRUDState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
}

interface CRUDActions {
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<boolean>;
}

export type UseCRUDReturn<T> = CRUDState<T> & CRUDActions;

interface UseCRUDOptions<T> {
  fetchFn: () => Promise<{ message: T[]; statusCode: number }>;
  deleteFn: (id: string) => Promise<unknown>;
  deps?: unknown[];
}

export function useCRUD<T extends { id: string }>(
  options: UseCRUDOptions<T>,
): UseCRUDReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const toast = useToast();

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await options.fetchFn();
        setData(response.message);
      } catch (err) {
        setError(extractErrorMessage(err, 'Erro ao carregar dados'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.fetchFn],
  );

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.deps ?? []);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  const remove = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await options.deleteFn(id);
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.show('Item removido com sucesso', 'success');
        return true;
      } catch (err) {
        toast.show(extractErrorMessage(err, 'Erro ao remover item'), 'error');
        return false;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.deleteFn, toast],
  );

  return { data, loading, error, refreshing, refresh, remove };
}
