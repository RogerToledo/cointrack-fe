import instance from "./config";

export interface PurchaseType {
    id: string;
    name: string;
}

export interface PurchaseTypeResponse {
    message: PurchaseType;
    statusCode: number;
}

export interface PurchaseTypesResponse {
    message: PurchaseType[];
    statusCode: number;
}

export const createPurchaseType = async (name: string) => {
    const response = await instance.post('/v1/purchaseTypes', { name });

    return response.data
}

export const updatePurchaseType = async (id: string, name: string) => {
    const response = await instance.put(`/v1/purchaseTypes`, { id, name });

    return response.data;
}

export const deletePurchaseType = async (id: string) => {
    const response = await instance.delete(`/v1/purchaseTypes/${id}`);

    return response.status;
}

export const getPurchaseType = async (id: string): Promise<PurchaseTypeResponse> => {
    const response = await instance.get<PurchaseTypeResponse>(`/v1/purchaseTypes/${id}`)
    return response.data;
}

export const getPurchaseTypes = async () => {
    const response = await instance.get<PurchaseTypesResponse>('/v1/purchaseTypes');

    return response.data;
}
