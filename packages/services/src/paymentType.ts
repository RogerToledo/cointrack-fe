import { AxiosInstance } from 'axios';
import { PaymentTypeResponse, PaymentTypesResponse } from '@cointrack/types';

export function createPaymentTypeService(client: AxiosInstance) {
  return {
    create: async (name: string, spotPayment: number) => {
      const response = await client.post('/v1/paymentTypes', {
        name,
        spot_payment: spotPayment,
      });
      return response.data;
    },

    update: async (id: string, name: string, spotPayment: number) => {
      const response = await client.put('/v1/paymentTypes', {
        id,
        name,
        spot_payment: spotPayment,
      });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/paymentTypes/${id}`);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<PaymentTypeResponse>(
        `/v1/paymentTypes/${id}`
      );
      return response.data;
    },

    getAll: async () => {
      const response = await client.get<PaymentTypesResponse>('/v1/paymentTypes');
      return response.data;
    },
  };
}
