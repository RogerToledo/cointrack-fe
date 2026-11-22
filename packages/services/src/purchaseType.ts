import { AxiosInstance } from 'axios';
import {
  PurchaseTypeResponse,
  PurchaseTypesResponse,
} from '@cointrack/types';

export function createPurchaseTypeService(client: AxiosInstance) {
  return {
    create: async (name: string) => {
      const response = await client.post('/v1/purchaseTypes', { name });
      return response.data;
    },

    update: async (id: string, name: string) => {
      const response = await client.put('/v1/purchaseTypes', { id, name });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/purchaseTypes/${id}`);
      return response.status;
    },

    getById: async (id: string): Promise<PurchaseTypeResponse> => {
      const response = await client.get<PurchaseTypeResponse>(
        `/v1/purchaseTypes/${id}`
      );
      return response.data;
    },

    getAll: async () => {
      const response = await client.get<PurchaseTypesResponse>(
        '/v1/purchaseTypes'
      );
      return response.data;
    },
  };
}
