import instance from "./config";

export interface Deduction {
    id: string
	description: string
	amount: number
	fixed: boolean
    active: boolean
	date_end: string
    earning_id: string
}

export interface DeductionResponse {
    message: Deduction;
    statusCode: number;
}

export interface DeductionsResponse {
    message: Deduction[];
    statusCode: number;
}

export const createDeduction = async (
    description: string, 
    amount: number, 
    fixed: boolean,
    active: boolean,
    date_end: string,   
    earning_id: string
) => {
    const response = await instance.post('/v1/deductions', {
        description,
        amount,
        fixed,
        active,
        date_end,
        earning_id
    });

    return response.data;
};

export const updateDeduction = async (
    id: string,
    description: string, 
    amount: number, 
    fixed: boolean, 
    active: boolean,
    date_end: string,
    earning_id: string
) => {
    const response = await instance.put(`/v1/deductions`, {
        id,
        description,
        amount,
        fixed,
        active,
        date_end,
        earning_id
    });
        
    return response.data;
}

export const deleteDeduction = async (id: string) => {
    const response = await instance.delete(`/v1/deductions/${id}`);
    return response.data;
}

export const getDeductionById = async (id: string) => {
    const response = await instance.get<DeductionResponse>(`/v1/deductions/${id}`);
    return response.data;
};

export const getDeductions = async () => {
    const response = await instance.get<DeductionsResponse>('/v1/deductions');
    return response.data;
};
