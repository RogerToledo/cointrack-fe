import { AxiosInstance } from 'axios';
import { CreditCardResponse, CreditCardsResponse } from '@cointrack/types';

export function createCreditCardService(client: AxiosInstance) {
    return {
        create: async (
            owner: string,
            final_card_num: string,
            type: string,
            invoice_closing_day: number,
            due_date: number,
            card_name?: string,
            physical_card_id?: string
        ) => {
            const body: Record<string, unknown> = {
                owner_id: owner,
                final_card_num,
                type,
                invoice_closing_day,
                due_date,
            };
            if (card_name) body.card_name = card_name;
            if (physical_card_id) body.physical_card_id = physical_card_id;

            const response = await client.post('/v1/creditCards', body);
            return response.data;
        },

        update: async (
            id: string,
            owner: string,
            final_card_num: string,
            type: string,
            invoice_closing_day: number,
            due_date: number,
            card_name?: string,
            physical_card_id?: string
        ) => {
            const body: Record<string, unknown> = {
                id,
                owner_id: owner,
                final_card_num,
                type,
                invoice_closing_day,
                due_date,
            };
            if (card_name) body.card_name = card_name;
            if (physical_card_id) body.physical_card_id = physical_card_id;

            const response = await client.put('/v1/creditCards', body);
            return response.data;
        },

        delete: async (id: string): Promise<void> => {
            const response = await client.delete(`/v1/creditCards/${id}`);
            return response.data;
        },

        getById: async (id: string) => {
            const response = await client.get<CreditCardResponse>(`/v1/creditCards/${id}`);
            return response.data;
        },

        getAll: async () => {
            const response = await client.get<CreditCardsResponse>('/v1/creditCards');
            return response.data;
        },

        getPhysical: async () => {
            const response = await client.get<CreditCardsResponse>('/v1/creditCards/physical');
            return response.data;
        },
    };
}
