import { useCallback, useEffect, useRef, useState } from 'react';
import { extractErrorMessage } from '@cointrack/utils';

import { useToast } from '../contexts/ToastContext';

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
  if (typeof data !== 'object' || data === null || !('message' in data)) {
    return false;
  }
  const msg = (data as { message: unknown }).message;
  return typeof msg === 'object' && msg !== null && 'responses' in msg;
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

  const fetchFnRef = useRef(options.fetchFn);
  fetchFnRef.current = options.fetchFn;

  const deleteFnRef = useRef(options.deleteFn);
  deleteFnRef.current = options.deleteFn;

  const fetchData = useCallback(
    async (targetPage: number, isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await fetchFnRef.current(targetPage, limit);
        if (paginated && isPaginated<T>(response)) {
          const msg = response.message;
          setData(msg.responses);
          setPage(msg.page);
          setTotalPages(msg.total_pages);
          setTotal(msg.total);
        } else {
          const list = Array.isArray(response.message) ? (response.message as T[]) : [];
          setData(list);
          setPage(1);
          setTotalPages(1);
          setTotal(list.length);
        }
      } catch (err) {
        setError(extractErrorMessage(err, 'Erro ao carregar dados'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [limit, paginated],
  );

  useEffect(() => {
    setPage(1);
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData, ...(options.deps ?? [])]);

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
        await deleteFnRef.current(id);
        setData((prev) => prev.filter((item) => item.id !== id));
        toast.show('Item removido com sucesso', 'success');
        return true;
      } catch (err) {
        toast.show(extractErrorMessage(err, 'Erro ao remover item'), 'error');
        return false;
      }
    },
    [toast],
  );

  return { data, loading, error, refreshing, page, totalPages, total, refresh, remove, goToPage, nextPage, prevPage };
}
