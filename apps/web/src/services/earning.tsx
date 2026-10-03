import instance from "./config";

export interface EarningRecord {
    id: string
    id_earning: string
    date: string
    gross_pay: number
    net_pay: number
    deduction: number
}

export interface Earning {
    id: string
	description: string
	idUser: string
	personName?: string
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
    id_user: string;
    periodicity: string;
}

// Definicao de ganho, sem lancamento mensal. O `record` e lancado depois
// via POST /v1/earnings/records.
export interface EarningDefinitionPayload {
    description: string;
    id_user: string;
    periodicity: string;
}

// Lancamento mensal sobre um ganho ja cadastrado. A `deduction` e calculada
// pelo back a partir de `gross_pay` e `net_pay`.
export interface EarningRecordPayload {
    id_earning: string;
    date: string;
    gross_pay: number;
    net_pay: number;
}

export const createEarningDefinition = async (payload: EarningDefinitionPayload) => {
    const response = await instance.post('/v1/earnings', payload);

    return response.data;
};

export const createEarningRecord = async (payload: EarningRecordPayload) => {
    const response = await instance.post('/v1/earnings/records', payload);

    return response.data;
};

export const updateEarning = async (id: string, payload: EarningPayload) => {
    const response = await instance.put(`/v1/earnings`, {
        id,
        ...payload,
    });
        
    return response.data;
}

export const deleteEarning = async (id: string, keepHistory = false) => {
    const response = await instance.delete(`/v1/earnings/${id}`, {
        params: { keepHistory },
    });
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

// Lista de ganhos ja com o lancamento mensal embutido, para a tela de registro.
export const getEarningsWithRecords = async (year?: number, month?: number, idUser?: string) => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    if (idUser) params.append('idUser', idUser);
    const url = params.toString() ? `/v1/earnings/with-records?${params.toString()}` : '/v1/earnings/with-records';
    const response = await instance.get<EarningsResponse>(url);
    return response.data;
};
