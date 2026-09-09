import instance from "./config";

export interface Expense {
    id:             string
	description:    string
	frequency:      string
	amount:         number
	estimated_amount: number
	due_date:        string
	payment_date:    string
	payment_type_id:  string
	credit_card_id:   string
	active:         boolean
	paid:           boolean
}

export interface ExpenseResponse {
    message: Expense;
    statusCode: number;
}

export interface ExpensesResponse {
    message: Expense[];
    statusCode: number;
}

export const createExpense = async (
    description: string, 
    frequency: string,
    amount: number, 
    estimated_amount: number,
    due_date: string,
    payment_date: string,
    payment_type_id: string,
    credit_card_id: string,
    active: boolean,
    paid: boolean
) => {
    const response = await instance.post('/v1/expenses', {
        description,
        frequency,
        amount,
        estimated_amount,
        due_date,
        payment_date,
        payment_type_id,
        credit_card_id,
        active,
        paid
    });

    return response.data;
};

export const reCreateExpense = async () => {
    const response = await instance.post('/v1/expenses/recreate');
    return response.data;
}

export const updateExpense = async (
    id: string,
    description: string, 
    frequency: string,
    amount: number, 
    estimated_amount: number,
    due_date: string,
    payment_date: string,
    payment_type_id: string,
    credit_card_id: string,
    active: boolean,
    paid: boolean
) => {
    const response = await instance.put(`/v1/expenses`, {
        id,
        description,
        frequency,
        amount,
        estimated_amount,
        due_date,
        payment_date,
        payment_type_id,
        credit_card_id,
        active,
        paid
    });
    
    return response.data;
};

export const payExpense = async (
    id: string,
    amount: number, 
    payment_date: string,
) => {
    const response = await instance.put('/v1/expenses/pay', {
        id,
        amount,
        payment_date,
    });

    return response.data;
}

export const deleteExpense = async (id: string) => {
    const response = await instance.delete(`/v1/expenses/${id}`);
    return response.data;
}

export const getExpenseById = async (id: string) => {
    const response = await instance.get<ExpenseResponse>(`/v1/expenses/${id}`);
    return response.data;
};

export const getExpenses = async () => {
    const response = await instance.get<ExpensesResponse>('/v1/expenses');
    return response.data;
};

export const getExpensesActive = async () => {
    const response = await instance.get<ExpensesResponse>('/v1/expenses?active=true');
    return response.data;
}

export const getExpensesInactive = async () => {
    const response = await instance.get<ExpensesResponse>('/v1/expenses?active=false');
    return response.data;
}