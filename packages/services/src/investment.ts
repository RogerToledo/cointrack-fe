import { AxiosInstance } from 'axios';
import {
  InvestmentResponse,
  InvestmentsPaginatedResponse,
} from '@cointrack/types';

export function createInvestmentService(client: AxiosInstance) {
  return {
    create: async (
      description: string,
      monthly_amount: number,
      installments: number,
      start_date: string,
      person_id: string
    ) => {
      const response = await client.post('/v1/investments', {
        description,
        monthly_amount,
        installments,
        start_date,
        person_id,
      });
      return response.data;
    },

    update: async (
      id: string,
      description: string,
      monthly_amount: number,
      installments: number,
      start_date: string,
      person_id: string
    ) => {
      const response = await client.put('/v1/investments', {
        id,
        description,
        monthly_amount,
        installments,
        start_date,
        person_id,
      });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/investments/${id}`);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<InvestmentResponse>(`/v1/investments/${id}`);
      return response.data;
    },

    getAll: async (page = 1, limit = 20) => {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', String(limit));
      const response = await client.get<InvestmentsPaginatedResponse>(
        `/v1/investments?${params.toString()}`
      );
      return response.data;
    },

    payInstallment: async (id: string) => {
      const response = await client.put(`/v1/investments/installments/${id}/pay`);
      return response.data;
    },
  };
}
