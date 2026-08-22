import instance from "./config";

export interface PaymentType {
    id: string;
    name: string;
    spot_payment: number;
}

export interface PaymentTypeResponse {
    message: PaymentType;
    statusCode: number;
}

export interface PaymentTypesResponse {
    message: PaymentType[];
    statusCode: number;
}

export const createPaymentType = async (name: string, spotPayment: number) => {
    const response = await instance.post('/v1/paymentTypes', {
        name: name,
        spot_payment: spotPayment,
    });

    return response.data;
}

export const updatePaymentType = async (id: string, name: string, spotPayment: number) => {
    const response = await instance.put(`/v1/paymentTypes`, {
        id: id,
        name: name,
        spot_payment: spotPayment
    });

    return response.data;
}

export const deletePaymentType = async (id: string) => {
    const response = await instance.delete(`/v1/paymentTypes/${id}`);

    return response.data;
}

export const getPaymentType = async (id: string) => {
    const response = await instance.get<PaymentTypeResponse>(`/v1/paymentTypes/${id}`);

    return response.data;
}

export const getPaymentTypes = async () => {
    const response = await instance.get<PaymentTypesResponse>('/v1/paymentTypes');
    
    return response.data;
}
