import { useCallback, useEffect, useState } from 'react';

import { apiClient } from '../services/api';
import { extractErrorMessage } from '../utils/errorMessage';

export interface InvoicePurchase {
  id: string;
  description: string;
  amount: number;
  date: string;
  installment_number: number;
  installment_value: number;
  place: string;
  paid: boolean;
  person: string;
  credit_card: string;
  purchase_type: string;
}

export interface UseInvoicesReturn {
  data: InvoicePurchase[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  refresh: () => void;
}

export function useInvoices(month: string, creditCardId: string): UseInvoicesReturn {
  const [data, setData] = useState<InvoicePurchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(
    async (isRefresh = false) => {
      if (!creditCardId) {
        setLoading(false);
        return;
      }

      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      try {
        const response = await apiClient.get(
          `/v1/invoices?month=${month}&credit_card_id=${creditCardId}`,
        );
        const items = response.data?.message;
        setData(Array.isArray(items) ? items : []);
      } catch (err) {
        setError(extractErrorMessage(err, 'Erro ao carregar fatura'));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [month, creditCardId],
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = useCallback(() => {
    fetchData(true);
  }, [fetchData]);

  return { data, loading, error, refreshing, refresh };
}
