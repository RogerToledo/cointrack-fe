import instance from "./config";

export interface DeductionRecord {
    id: string
    id_deduction: string
    date: string
    amount: number
}

export interface Deduction {
    id: string
	description: string
	periodicity: string
    active: boolean
    id_earning: string
    personName?: string
    record: DeductionRecord
}

export interface DeductionResponse {
    message: Deduction;
    statusCode: number;
}

export interface DeductionsResponse {
    message: Deduction[];
    statusCode: number;
}

export interface DeductionPayload {
    description: string;
    idEarning: string;
    periodicity: string;
    record: {
        date: string;
        amount: number;
    };
}

// Definicao de deducao, sem lancamento mensal. O `record` e lancado depois
// via POST /v1/deductions/records.
export interface DeductionDefinitionPayload {
    description: string;
    idEarning: string;
    periodicity: string;
}

export interface DeductionRecordPayload {
    id_deduction: string;
    date: string;
    amount: number;
}

export const createDeductionDefinition = async (payload: DeductionDefinitionPayload) => {
    const response = await instance.post('/v1/deductions', payload);

    return response.data;
};

export const createDeductionRecord = async (payload: DeductionRecordPayload) => {
    const response = await instance.post('/v1/deductions/records', payload);

    return response.data;
};

export const createDeduction = async (payload: DeductionPayload) => {
    const response = await instance.post('/v1/deductions', payload);

    return response.data;
};

export const updateDeduction = async (id: string, payload: DeductionPayload) => {
    // O PUT exige `id_earning` (snake_case), enquanto o POST exige `idEarning`
    // (camelCase). A traducao fica no service para o modal nao precisar saber.
    const { idEarning, ...rest } = payload;
    const response = await instance.put(`/v1/deductions`, {
        ...rest,
        id: id,
        id_earning: idEarning
    });
        
    return response.data;
}

export const deleteDeduction = async (id: string, keepHistory = false) => {
    const response = await instance.delete(`/v1/deductions/${id}`, {
        params: { keepHistory },
    });
    return response.data;
}

export const getDeductionById = async (id: string) => {
    const response = await instance.get<DeductionResponse>(`/v1/deductions/${id}`);
    return response.data;
};

export const getDeductions = async (year?: number, month?: number, idUser?: string) => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    if (idUser) params.append('idUser', idUser);
    const url = params.toString() ? `/v1/deductions?${params.toString()}` : '/v1/deductions';
    const response = await instance.get<DeductionsResponse>(url);
    return response.data;
};
