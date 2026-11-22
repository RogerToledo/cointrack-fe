import { AxiosInstance } from 'axios';
import { InstallmentPayResponse, InstallmentResponse } from '@cointrack/types';

export function createInstallmentService(client: AxiosInstance) {
  return {
    getByPurchase: async (purchaseId: string) => {
      const response = await client.get<InstallmentResponse>(
        `/v1/purchase/${purchaseId}/installments`
      );
      return response.data;
    },

    pay: async (id: string) => {
      const response = await client.put<InstallmentPayResponse>(
        `/v1/installments/${id}/pay`
      );
      return response.data;
    },
  };
}
