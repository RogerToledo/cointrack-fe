import { useCallback, useEffect, useState } from 'react';

import { useToast } from '../contexts/ToastContext';
import { extractErrorMessage } from '../utils/errorMessage';

interface CRUDState<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  page: number;
  totalPages: number;
  total: number;
}

interface CRUDActions {
  refresh: () => Promise<void>;
  remove: (id: string) => Promise<boolean>;
  goToPage: (page: number) => void;
  nextPage: () => void;
  prevPage: () => void;
}

export type UseCRUDReturn<T> = CRUDState<T> & CRUDActions;

type PaginatedResponse<T> = {
  message: { responses: T[]; page: number; limit: number; total_pages: number; total: number };
  statusCode: number;
};

type LegacyResponse<T> = {
  message: T[];
  statusCode: number;
};

interface UseCRUDOptions<T> {
  fetchFn: (page: number, limit: number) => Promise<PaginatedResponse<T> | LegacyResponse<T>>;
  deleteFn: (id: string) => Promise<unknown>;
  deps?: unknown[];
  limit?: number;
  paginated?: boolean;
}

function isPaginated<T>(data: unknown): data is PaginatedResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as any).message === 'object' &&
    'responses' in (data as any).message
  );
}

export function useCRUD<T extends { id: string }>(
  options: UseCRUDOptions<T>,
): UseCRUDReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const toast = useToast();
  const limit = options.limit ?? 20;
  const paginated = options.paginated ?? false;

  const fetchData = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await options.fetchFn(targetPage, limit);
        if (paginated && isPaginated<T>(response)) {
          const msg = response.message;
          setData(msg.responses);
          setPage(msg.page);
          setTotalPages(msg.total_pages);
          setTotal(msg.total);
        } else {
          setData(response.message as T[]);
          setPage(1);
          setTotalPages(1);
          setTotal((response.message as T[]).length);
        }
      } catch (err) {
        setError(extractErrorMessage(err, 'Erro ao carregar dados'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [options.fetchFn, limit, paginated],
  );

  useEffect(() => {
    setPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, options.deps ?? []);

  const refresh = useCallback(() => fetchData(page, true), [fetchData, page]);

  const goToPage = useCallback(
    (targetPage: number) => {
      if (targetPage >= 1 && targetPage <= totalPages) {
        setPage(targetPage);
        fetchData(targetPage);
      }
    },
    [fetchData, totalPages],
  );

  const nextPage = useCallback(() => goToPage(page + 1), [goToPage, page]);
  const prevPage = useCallback(() => goToPage(page - 1), [goToPage, page]);

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

  return { data, loading, error, refreshing, page, totalPages, total, refresh, remove, goToPage, nextPage, prevPage };
}
