import { createExpense, getExpenseById, updateExpense } from '@/services/expense';
import {getPaymentTypes, PaymentType} from '@/services/paymentType';
import { getCreditCards, CreditCard } from '@/services/creditCard';
import axios from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAction: () => void;
    isUpdate: boolean;
    expenseId: string;
}

const ModalExpense: React.FC<ModalProps> = ({ isOpen, onClose, onCardAction, isUpdate, expenseId }) => {
    // Dentro do seu componente ModalExpense
    const [description, setDescription] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [estimatedAmount, setEstimatedAmount] = useState<string>('');
    const [frequency, setFrequency] = useState<string>('');
    const [dueDate, setDueDate] = useState<string>(''); // Date input espera string YYYY-MM-DD
    const [paymentDate, setPaymentDate] = useState<string>(''); 
    const [active, setActive] = useState<boolean>(true);
    const [paid, setPaid] = useState<boolean>(false);
    const [selectedPaymentType, setSelectedPaymentType] = useState<string>(''); // ID selecionado
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);
    const [buttonText, setButtonText] = useState("Adicionar nova despesa"); 
    const [creditCardId, setCreditCardId] = useState('');
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const isViewOnly = !isUpdate && expenseId !== "";

    const getTitle = () => {
        if (isUpdate) return "Atualizar Despesa";
        if (isViewOnly) return "Visualizar Despesa";
        return "Cadastro de Despesa";
    }
    
useEffect(() => {
    const loadInitialData = async () => {
        if (!isOpen) return;

        setSuccess(null);
        setError(null);

        try {
            // Carrega tipos de pagamento sempre
            const paymentTypeResponse = await getPaymentTypes();
            const types = Array.isArray(paymentTypeResponse?.message) ? paymentTypeResponse.message : [];
            setPaymentTypes(types);

            const creditCardResponse = await getCreditCards();
            const cards = Array.isArray(creditCardResponse?.message) ? creditCardResponse.message : [];
            setCards(cards);


            // Se tem ID, buscamos os dados (seja para editar ou visualizar)
            if (expenseId && expenseId !== "") {
                const expenseResponse = await getExpenseById(expenseId);
                const expenseData = expenseResponse.message;

                // Preenche os campos
                setDescription(expenseData.description || "");
                setAmount(expenseData.amount?.toString() || '');
                setEstimatedAmount(expenseData.estimated_amount?.toString() || '');
                setFrequency(expenseData.frequency || "");
                setDueDate(expenseData.due_date ? expenseData.due_date.split('T')[0] : "");
                setPaymentDate(expenseData.payment_date ? expenseData.payment_date.split('T')[0] : "");
                setSelectedPaymentType(expenseData.payment_type_id || "");
                setCreditCardId(expenseData.credit_card_id || "");
                setPaid(Boolean(expenseData.paid));
                setActive(Boolean(expenseData.active));

                if (isUpdate) {
                    setButtonText("Atualizar Despesa");
                }
            } else {
                setButtonText("Adicionar nova despesa");
                setDescription("");
                setAmount('');
                setEstimatedAmount('');
                setFrequency("");
                setDueDate("");
                setPaymentDate("");
                setSelectedPaymentType("");
                setCreditCardId("");
                setPaid(false);
                setActive(true);
            }
        } catch (error) {
            console.error("Erro ao carregar dados:", error);
            setError("Falha ao carregar informações.");
        }
    };
    loadInitialData();
}, [isOpen, isUpdate, expenseId]);

        
    
const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
        const amountFloat = parseFloat(String(amount).replace(',', '.'));
        const estimatedAmountFloat = parseFloat(String(estimatedAmount).replace(',', '.'));

        if (isUpdate) {
            await updateExpense(
                expenseId, 
                description, 
                frequency,
                amountFloat, 
                estimatedAmountFloat, 
                dueDate, 
                paymentDate, 
                selectedPaymentType, 
                creditCardId,
                active,
                paid
            );
            setSuccess("Despesa atualizada com sucesso!");
        } else {
            await createExpense(
                description, 
                frequency, 
                amountFloat, 
                estimatedAmountFloat, 
                dueDate, 
                paymentDate,
                selectedPaymentType, 
                creditCardId,
                active,
                paid
            );
            setSuccess("Despesa criada com sucesso!");
        }

        setTimeout(() => {
            onCardAction();
            onClose();
        }, 3000);  
    } catch (err) {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || "Erro na operação");
        }
    }
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    switch(name) {
        case 'description':
            setDescription(value);
            break;
        case 'amount':
            setAmount(value);
            break;
        case 'estimated_amount':
            setEstimatedAmount(value);
            break;
        case 'due_date':
            setDueDate(String(value));
            break;
        case 'payment_date':
            setPaymentDate(value);
            break;
        case 'frequency':
            setFrequency(value);
            break;
        case 'payment_type':
            setSelectedPaymentType(value);
            break;
        case 'credit_card':
            setCreditCardId(value);
            break;
        default:
            break;
    }
};

    const isCreditCardSelected = () => {
        const selected = paymentTypes.find(pt => pt.id === selectedPaymentType);
        return selected?.name?.toLowerCase().includes("cartão de crédito") ?? false;
    };

    if (!isOpen) {
        return null;
    }    

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
                {/* Main modal */}
                <div className="relative p-4 w-full max-w-3xl max-h-full">
                    {/*Modal content */}
                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {getTitle()}
                            </h3>
                            <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/*  Modal body */}
                        <div className="p-4 md:p-5">
                            {/* Success alert */}
                            {success && (
                                <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <div className="ms-3 text-sm font-medium">
                                        {success}
                                    </div>
                                    <button 
                                        type="button" 
                                        onClick={() => setSuccess(null)}
                                        className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                                    >
                                        <span className="sr-only">Fechar</span>
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            {/* Error alert */}
                            {error && (
                                <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                    <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                                    </svg>
                                    <span className="sr-only">Erro</span>
                                    <div className="ms-3 text-sm font-medium">
                                        {error}
                                    </div>
                                    <button 
                                        onClick={() => setError(null)}
                                        type="button" 
                                        className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700" 
                                        aria-label="Close"
                                    >
                                        <span className="sr-only">Fechar</span>
                                        <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                        </svg>
                                    </button>
                                </div>
                            )}
                            <form onSubmit={handleSubmit} className="space-y-4" action="#">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                        <input 
                                            type="text" 
                                            name="description"
                                            id="description" 
                                            value={description}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white
                                            ${isViewOnly 
                                                    ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' 
                                                    : 'bg-gray-50 border-blue-500 focus:ring-blue-500'
                                                }`} 
                                            placeholder="Digite uma descrição" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Valor</label>
                                        <input 
                                            type="text" 
                                            name="amount"
                                            id="amount" 
                                            value={amount}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-50 border-blue-500 focus:ring-blue-500'}`} 
                                            placeholder="0,00" 
                                            required 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="estimated_amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Valor Estimado</label>
                                        <input 
                                            type="text" 
                                            name="estimated_amount" 
                                            id="estimated_amount" 
                                            value={estimatedAmount}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-50 border-blue-500 focus:ring-blue-500'}`} 
                                            placeholder="0,00" 
                                            required 
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="due_date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data do Vencimento</label>
                                        <input 
                                            type="date" 
                                            name="due_date" 
                                            id="due_date" 
                                            value={dueDate}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-50 border-blue-500 focus:ring-blue-500'}`} 
                                            placeholder="Digite a data do vencimento" 
                                            required 
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="payment_date" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                                            Data do Pagamento
                                        </label>
                                        <input 
                                            type="date" 
                                            name="payment_date" 
                                            id="payment_date" 
                                            value={paymentDate}
                                            onChange={handleChange}
                                            disabled={!paid || isViewOnly} 
                                            className={`border text-sm rounded-lg block w-full p-2.5 dark:text-white 
                                                ${(!paid || isViewOnly) 
                                                    ? 'bg-gray-200 cursor-not-allowed opacity-50 dark:bg-gray-800' 
                                                    : 'bg-gray-50 border-gray-300 dark:bg-gray-600'
                                                }`}
                                            required={paid} 
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Tipo de Pagamento</label>
                                        <select 
                                            name="payment_type" 
                                            value={selectedPaymentType} 
                                            onChange={handleChange} 
                                            disabled={isViewOnly}
                                            required 
                                            className={`w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white
                                                ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-50 border-blue-500 focus:ring-blue-500'}`}>
                                            <option value="">Nenhum</option>
                                            {paymentTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="flex-1">
                                        <label className={`block mb-2 text-sm font-medium ${!isCreditCardSelected() ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                            Cartão de Crédito
                                        </label>
                                        <select 
                                            name="credit_card" 
                                            value={creditCardId} 
                                            onChange={handleChange} 
                                            disabled={!isCreditCardSelected() || isViewOnly}
                                            className={`w-full p-2.5 border rounded-lg dark:bg-gray-700 dark:text-white transition-colors
                                                ${(!isCreditCardSelected() || isViewOnly) 
                                                    ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' 
                                                    : 'bg-gray-50 border-blue-500 focus:ring-blue-500'
                                                }`}
                                        >
                                            <option value="">Selecione um cartão</option>
                                            {cards.map(c => (
                                                <option key={c.id} value={c.id}>
                                                    {c.owner} - {c.final_card_num}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-12 items-end">
    
                                <div className="flex-[3]">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Frequência</label>
                                    <select 
                                        name="frequency"
                                        value={frequency} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        className={`w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-50 border-blue-500 focus:ring-blue-500'}`}
                                    >
                                        <option value="">Nenhum</option>
                                        <option value="monthly">Mensal</option>
                                        <option value="yearly">Anual</option>
                                    </select>
                                </div>
                                <div className="flex flex-1 items-center h-[42px] mb-[1px] ml-10"> 
                                    <input 
                                        id="active" 
                                        type="checkbox" 
                                        checked={active}
                                        onChange={(e) => setActive(e.target.checked)}
                                        disabled={isViewOnly}
                                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-100 border-gray-300'}`}
                                    />
                                    <label htmlFor="active" className="ms-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Ativo
                                    </label>
                                </div>
                                <div className="flex flex-1 items-center h-[42px] mb-[1px]">
                                    <input 
                                        id="paid" 
                                        type="checkbox" 
                                        checked={paid} // O input de data depende desse valor
                                        onChange={(e) => {
                                            setPaid(e.target.checked);
                                            // Se desmarcar "pago", limpamos a data por segurança
                                            if (!e.target.checked) setPaymentDate(""); 
                                        }}
                                        disabled={isViewOnly}
                                        className={`w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500
                                            ${isViewOnly ? 'bg-gray-200 cursor-not-allowed opacity-50 border-gray-300' : 'bg-gray-100 border-gray-300'}`}
                                    />
                                    <label htmlFor="paid-checkbox" className="ms-2 text-sm font-medium text-gray-900 dark:text-white">
                                        Pago
                                    </label>
                                </div>
                            </div>
                                {!isViewOnly && (
                                    <button 
                                        type="submit" 
                                        className="w-full text-white bg-blue-700 hover:bg-blue-800 font-medium rounded-lg text-sm px-5 py-2.5"
                                    >
                                        {buttonText}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
            </div> 
        </div>
    );
};

export default ModalExpense;