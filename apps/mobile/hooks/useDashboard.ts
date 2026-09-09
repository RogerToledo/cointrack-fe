import { useCallback, useEffect, useState } from 'react';

import { DashboardData } from '@cointrack/types';

import { dashboardService } from '../services/api';
import { extractErrorMessage } from '../utils/errorMessage';

export interface UseDashboardReturn {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => void;
}

export function useDashboard(month: string): UseDashboardReturn {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await dashboardService.getDashboard(month);
        setData(response.message);
      } catch (err) {
        setError(extractErrorMessage(err, 'Erro ao carregar dashboard'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refreshing, refresh };
}
