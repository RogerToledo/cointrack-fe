import { AxiosInstance } from 'axios';
import { ExpenseResponse, ExpensesResponse } from '@cointrack/types';

export function createExpenseService(client: AxiosInstance) {
  return {
    create: async (
      description: string,
      frequency: string,
      amount: number,
      estimated_amount: number,
      due_date: string,
      payment_date: string,
      payment_type_id: string,
      credit_card_id: string,
      active: boolean,
      paid: boolean
    ) => {
      const response = await client.post('/v1/expenses', {
        description,
        frequency,
        amount,
        estimated_amount,
        due_date,
        payment_date,
        payment_type_id,
        credit_card_id,
        active,
        paid,
      });
      return response.data;
    },

    recreate: async (expenseId?: string) => {
      const response = await client.post(
        '/v1/expenses/recreate',
        expenseId ? { id: expenseId } : {}
      );
      return response.data;
    },

    update: async (
      id: string,
      description: string,
      frequency: string,
      amount: number,
      estimated_amount: number,
      due_date: string,
      payment_date: string,
      payment_type_id: string,
      credit_card_id: string,
      active: boolean,
      paid: boolean
    ) => {
      const response = await client.put('/v1/expenses', {
        id,
        description,
        frequency,
        amount,
        estimated_amount,
        due_date,
        payment_date,
        payment_type_id,
        credit_card_id,
        active,
        paid,
      });
      return response.data;
    },

    pay: async (id: string, amount: number, payment_date: string) => {
      const response = await client.put('/v1/expenses/pay', {
        id,
        amount,
        payment_date,
      });
      return response.data;
    },

    delete: async (id: string) => {
      const response = await client.delete(`/v1/expenses/${id}`);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await client.get<ExpenseResponse>(`/v1/expenses/${id}`);
      return response.data;
    },

    getAll: async (year?: number, month?: number) => {
      const params = new URLSearchParams();
      if (year) params.set('year', String(year));
      if (month) params.set('month', String(month));
      const query = params.toString();
      const response = await client.get<ExpensesResponse>(
        `/v1/expenses${query ? `?${query}` : ''}`
      );
      return response.data;
    },

    getActive: async () => {
      const response = await client.get<ExpensesResponse>('/v1/expenses?active=true');
      return response.data;
    },

    getInactive: async () => {
      const response = await client.get<ExpensesResponse>('/v1/expenses?active=false');
      return response.data;
    },
  };
}
