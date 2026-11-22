import { AxiosInstance } from 'axios';
import { PurchaseResponse, PurchasesPaginatedResponse } from '@cointrack/types';

export function createPurchaseService(client: AxiosInstance) {
  return {
    create: async (
      description: string,
      amount: number,
      date: string,
      installment_number: number,
      place: string,
      paid: boolean,
      payment_type_id: string,
      credit_card_id: string,
      purchase_type_id: string,
      person_id: string
    ) => {
      const response = await client.post('/v1/purchases', {
        description,
        amount,
        date,
        installment_number,
        place,
        paid,
        payment_type_id,
        credit_card_id,
        purchase_type_id,
        person_id,
      });
      return response.data;
    },

    update: async (
      id: string,
      description: string,
      amount: number,
      date: string,
      installment_number: number,
      place: string,
      paid: boolean,
      payment_type_id: string,
      credit_card_id: string,
      purchase_type_id: string,
      person_id: string
    ) => {
      const response = await client.put('/v1/purchases', {
        id,
        description,
        amount,
        date,
        installment_number,
        place,
        paid,
        payment_type_id,
        credit_card_id,
        purchase_type_id,
        person_id,
      });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/purchases/${id}`);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<PurchaseResponse>(`/v1/purchases/${id}`);
      return response.data;
    },

    getAll: async (month?: string, page = 1, limit = 20) => {
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      params.append('page', String(page));
      params.append('limit', String(limit));
      const response = await client.get<PurchasesPaginatedResponse>(
        `/v1/purchases?${params.toString()}`
      );
      return response.data;
    },
  };
}
