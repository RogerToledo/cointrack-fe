import instance from "./config";

export interface Installment {
    id: string;
    description: string;
    number: number;
    value: number;
    due_date: string;
    paid: boolean;
}

export interface InstallmentResponse {
    message: Installment;
    statusCode: number;
}

export interface InstallmentPayResponse {
    message: string;
    statusCode: number;
}

export const getPurchasesInstallments = async (id: string) => {
    const response = await instance.get<InstallmentResponse>(`/v1/purchase/${id}/installments`);
    
    return response.data;
};

export const payInstallment = async (id: string) => {
    const response = await instance.put<InstallmentPayResponse>(`/v1/installments/${id}/pay`);
    
    return response.data;
}