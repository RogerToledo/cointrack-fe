import instance from "./config";

export interface Purchase {
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
    person_id: string,
    payment_type: string,
    credit_card: string,
    purchase_type: string,
    person: string
}

export interface PurchaseResponse {
    message: Purchase;
    statusCode: number;
}

export interface PurchasesResponse {
    message: Purchase[];
    statusCode: number;
}

export interface PurchasesPaginatedResponse {
    message: {
        responses: Purchase[];
        quantity: number;
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    statusCode: number;
}

export const createPurchase = async (
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
    const response = await instance.post('/v1/purchases', {
        description: description,
        amount: amount,
        date: date,
        installment_number: installment_number,
        place: place,
        paid: paid,
        payment_type_id: payment_type_id,
        credit_card_id: credit_card_id,
        purchase_type_id: purchase_type_id,
        person_id: person_id
    });

    return response.data;
}

export const updatePurchase = async (
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
    const response = await instance.put(`/v1/purchases`, {
        id: id,
        description: description,
        amount: amount,
        date: date,
        installment_number: installment_number,
        place: place,
        paid: paid,
        payment_type_id: payment_type_id,
        credit_card_id: credit_card_id,
        purchase_type_id: purchase_type_id,
        person_id: person_id
    });

    return response.data;
}

export const deletePurchase = async (id: string) => {
    const response = await instance.delete(`/v1/purchases/${id}`);

    return response.data;
}

export const getPurchase = async (id: string) => {
    const response = await instance.get<PurchaseResponse>(`/v1/purchases/${id}`);

    return response.data;
}

export const getPurchases = async (month?: string, page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    if (month) params.append('month', month);
    params.append('page', String(page));
    params.append('limit', String(limit));
    const response = await instance.get<PurchasesPaginatedResponse>(`/v1/purchases?${params.toString()}`)
    
    return response.data;
}
