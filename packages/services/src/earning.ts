import { AxiosInstance } from 'axios';
import {
  EarningDefinitionPayload,
  EarningPayload,
  EarningRecordPayload,
  EarningResponse,
  EarningsResponse,
} from '@cointrack/types';

export function createEarningService(client: AxiosInstance) {
  return {
    createDefinition: async (payload: EarningDefinitionPayload) => {
      const response = await client.post('/v1/earnings', payload);
      return response.data;
    },

    createRecord: async (payload: EarningRecordPayload) => {
      const response = await client.post('/v1/earnings/records', payload);
      return response.data;
    },

    update: async (id: string, payload: EarningPayload) => {
      const response = await client.put('/v1/earnings', { id, ...payload });
      return response.data;
    },

    delete: async (id: string, keepHistory = false) => {
      const response = await client.delete(`/v1/earnings/${id}`, {
        params: { keepHistory },
      });
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<EarningResponse>(`/v1/earnings/${id}`);
      return response.data;
    },

    getAll: async (year?: number, month?: number, idUser?: string) => {
      const params = new URLSearchParams();
      if (year) params.append('year', String(year));
      if (month) params.append('month', String(month));
      if (idUser) params.append('idUser', idUser);
      const url = params.toString() ? `/v1/earnings?${params.toString()}` : '/v1/earnings';
      const response = await client.get<EarningsResponse>(url);
      return response.data;
    },

    getAllWithRecords: async (year?: number, month?: number, idUser?: string) => {
      const params = new URLSearchParams();
      if (year) params.append('year', String(year));
      if (month) params.append('month', String(month));
      if (idUser) params.append('idUser', idUser);
      const url = params.toString()
        ? `/v1/earnings/with-records?${params.toString()}`
        : '/v1/earnings/with-records';
      const response = await client.get<EarningsResponse>(url);
      return response.data;
    },
  };
}
