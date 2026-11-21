import instance from "./config";

export interface InvestmentInstallment {
    id: string;
    number: number;
    value: number;
    due_date: string;
    paid: boolean;
}

export interface Investment {
    id: string;
    description: string;
    monthly_amount: number;
    installments: number;
    start_date: string;
    person_id: string;
    person: string;
    total: number;
    paid_amount: number;
    records?: InvestmentInstallment[];
}

export interface InvestmentResponse {
    message: Investment;
    statusCode: number;
}

export interface InvestmentsPaginatedResponse {
    message: {
        responses: Investment[];
        quantity: number;
        total: number;
        page: number;
        limit: number;
        total_pages: number;
    };
    statusCode: number;
}

export const createInvestment = async (
    description: string,
    monthly_amount: number,
    installments: number,
    start_date: string,
    person_id: string
) => {
    const response = await instance.post('/v1/investments', {
        description: description,
        monthly_amount: monthly_amount,
        installments: installments,
        start_date: start_date,
        person_id: person_id
    });

    return response.data;
};

export const updateInvestment = async (
    id: string,
    description: string,
    monthly_amount: number,
    installments: number,
    start_date: string,
    person_id: string
) => {
    const response = await instance.put('/v1/investments', {
        id: id,
        description: description,
        monthly_amount: monthly_amount,
        installments: installments,
        start_date: start_date,
        person_id: person_id
    });

    return response.data;
};

export const deleteInvestment = async (id: string) => {
    const response = await instance.delete(`/v1/investments/${id}`);

    return response.data;
};

export const getInvestment = async (id: string) => {
    const response = await instance.get<InvestmentResponse>(`/v1/investments/${id}`);

    return response.data;
};

export const getInvestments = async (page: number = 1, limit: number = 20) => {
    const params = new URLSearchParams();
    params.append('page', String(page));
    params.append('limit', String(limit));
    const response = await instance.get<InvestmentsPaginatedResponse>(`/v1/investments?${params.toString()}`);

    return response.data;
};

// Marca uma parcela (aporte) de investimento como paga.
export const payInvestmentInstallment = async (id: string) => {
    const response = await instance.put(`/v1/investments/installments/${id}/pay`);

    return response.data;
};
