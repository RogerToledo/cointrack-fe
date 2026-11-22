import { AxiosInstance } from 'axios';
import { InvoiceResponse, InvoiceStatusResponse } from '@cointrack/types';

export function createInvoiceService(client: AxiosInstance) {
  return {
    getStatus: async (creditCardId: string, year: number, month: number) => {
      const response = await client.get<InvoiceStatusResponse>(
        `/v1/creditCards/${creditCardId}/invoice?year=${year}&month=${month}`
      );
      return response.data;
    },

    getInvoice: async (yearMonth: string, creditCardId?: string) => {
      let url = `/v1/invoices?month=${yearMonth}`;
      if (creditCardId) {
        url += `&credit_card_id=${creditCardId}`;
      }
      const response = await client.get<InvoiceResponse>(url);
      return response.data;
    },

    payInvoice: async (yearMonth: string, creditCardId?: string) => {
      let url = `/v1/invoices/pay?month=${yearMonth}`;
      if (creditCardId) {
        url += `&credit_card_id=${creditCardId}`;
      }
      const response = await client.put(url);
      return response.data;
    },
  };
}
