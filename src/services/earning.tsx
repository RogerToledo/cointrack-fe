import instance from "./config";

export interface Earning {
    id: string
	description: string
	amount: number
	date: string
	active: boolean
	is_monthly: boolean
	person_id: string
    person_name: string
    net_salary: number
}

export interface EarningResponse {
    message: Earning;
    statusCode: number;
}

export interface EarningsResponse {
    message: Earning[];
    statusCode: number;
}

export const createEarning = async (
    description: string, 
    amount: number, 
    date: string, 
    active: boolean,
    is_monthly: boolean,
    person_id: string
) => {
    const response = await instance.post('/v1/earnings', {
        description,
        amount,
        date,
        active,
        is_monthly,
        person_id
    });

    return response.data;
};

export const updateEarning = async (
    id: string,
    description: string, 
    amount: number, 
    date: string, 
    active: boolean,
    is_monthly: boolean,
    person_id: string
) => {
    const response = await instance.put(`/v1/earnings`, {
        id,
        description,
        amount,
        date,
        active,
        is_monthly,
        person_id
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

export const getEarnings = async (year?: number, month?: number) => {
    const params = new URLSearchParams();
    if (year) params.append('year', String(year));
    if (month) params.append('month', String(month));
    const url = params.toString() ? `/v1/earnings?${params.toString()}` : '/v1/earnings';
    const response = await instance.get<EarningsResponse>(url);
    return response.data;
};
