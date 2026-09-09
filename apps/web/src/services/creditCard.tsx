import instance from "./config";

export interface CreditCard {
    id: string;
    owner_id: string;
    owner: string;
    final_card_num: string;
    type: string;
    invoice_closing_day: number;
    due_date: number;
    card_name?: string;
    physical_card_id?: string;
    parent_card_name?: string;
    physical_card_last4?: string;
}

export interface CreditCardResponse {
    message: CreditCard;
    statusCode: number;
}

export interface CreditCardsResponse {
    message: CreditCard[];
    statusCode: number;
}

export const createCreditCard = async (
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
        final_card_num: final_card_num,
        type: type,
        invoice_closing_day: invoice_closing_day,
        due_date: due_date
    };

    if (card_name) body.card_name = card_name;
    if (physical_card_id) body.physical_card_id = physical_card_id;

    const response = await instance.post('/v1/creditCards', body);

    return response.data;
};

export const updateCreditCard = async (
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
        id: id,
        owner_id: owner,
        final_card_num: final_card_num,
        type: type,
        invoice_closing_day: invoice_closing_day,
        due_date: due_date
    };

    if (card_name) body.card_name = card_name;
    if (physical_card_id) body.physical_card_id = physical_card_id;

    const response = await instance.put(`/v1/creditCards`, body);
        
    return response.data;
};

export const deleteCreditCard = async (id: string): Promise<void> => {
    const response = await instance.delete(`/v1/creditCards/${id}`);
    
    return response.data;

};

export const getCreditCard = async (id: string) => {
    const response = await instance.get<CreditCardResponse>(`/v1/creditCards/${id}`);
    
    return response.data;
};

export const getCreditCards = async () => {
    const response = await instance.get<CreditCardsResponse>('/v1/creditCards');
    
    return response.data;
};

export const getPhysicalCreditCards = async () => {
    const response = await instance.get<CreditCardsResponse>('/v1/creditCards/physical');
    
    return response.data;
};
