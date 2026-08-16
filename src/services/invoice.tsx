import instance from "./config";

export interface InvoicePurchase {
    id: string;
    description: string;
    amount: number;
    date: string;
    installment_number: number;
    installment_value: number;
    place: string;
    paid: boolean;
    payment_type_id: string;
    credit_card_id: string;
    purchase_type_id: string;
    person_id: string;
    payment_type: string;
    credit_card: string;
    purchase_type: string;
    person: string;
}

export interface Invoice {
    invoice_date: string;
    purchases: InvoicePurchase[];
}

export interface InvoiceResponse {
    statusCode: number;
    message: Invoice;
}

export const getInvoice = async (yearMonth: string, creditCardId?: string) => {
    let url = `/v1/invoices?month=${yearMonth}`;
    if (creditCardId) {
        url += `&credit_card_id=${creditCardId}`;
    }
    const response = await instance.get<InvoiceResponse>(url);
    return response.data;
};

export const payInvoice = async (yearMonth: string, creditCardId?: string) => {
    let url = `/v1/invoices/pay?month=${yearMonth}`;
    if (creditCardId) {
        url += `&credit_card_id=${creditCardId}`;
    }
    const response = await instance.put(url);
    return response.data;
};
