import instance from "./config";

export interface EarningRecord {
    id: string
    id_earning: string
    date: string
    amount: number
}

export interface Earning {
    id: string
	description: string
	idUser: string
	periodicity: string
    record: EarningRecord
}

export interface EarningResponse {
    message: Earning;
    statusCode: number;
}

export interface EarningsResponse {
    message: Earning[];
    statusCode: number;
}

export interface EarningPayload {
    description: string;
    idUser: string;
    periodicity: string;
    record: {
        date: string;
        amount: number;
    };
}

export const createEarning = async (payload: EarningPayload) => {
    const response = await instance.post('/v1/earnings', payload);

    return response.data;
};

export const updateEarning = async (id: string, payload: EarningPayload) => {
    const response = await instance.put(`/v1/earnings`, {
        id,
        ...payload,
    });
        
    return response.data;
}

export const deleteEarning = async (id: string) => {
    const response = await instance.delete(`/v1/earnings/${id}`);
    return response.data;
}

export const getEarningBy = async (id: string) => {
    const response = await instance.get<EarningResponse>(`/v1/earnings/${id}`);
    return response.data;
};

export const getEarnings = async (year?: number, month?: number, idUser?: string) => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    if (idUser) params.append('idUser', idUser);
    const url = params.toString() ? `/v1/earnings?${params.toString()}` : '/v1/earnings';
    const response = await instance.get<EarningsResponse>(url);
    return response.data;
};
