import { useState, useEffect } from "react";
import { getExpenses, deleteExpense, reCreateExpense, payExpense, ExpensesResponse} from "@/services/expense";
import ModalExpense from "./ModalExpense";
import ModalPayExpense from "./ModalPayExpense";
import axios from "axios";
import {Eye, Pencil, Trash2, Wallet, X} from 'lucide-react';


function Expense() {
    const [expenses, setExpenses] = useState<ExpensesResponse>({
        message: [],
        statusCode: 0
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [expenseId, setExpenseId] = useState<string>("");

    const openPayModal = (id: string) => {
        setExpenseId(id);
        setIsPayModalOpen(true);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = async () => {
        setError(null);

        try {
            const data = await getExpenses();
            console.log("Despesas carregadas:", data);
            if (data && Array.isArray(data.message)) {
                setExpenses(data);
            } else if (data?.message && !Array.isArray(data.message)) {
                // Backend pode retornar objeto único ao invés de array
                setExpenses({ message: [data.message], statusCode: data.statusCode });
            } else {
                setExpenses({ message: [], statusCode: 200 });
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleExpense = async() => {
        await fetchData();
        closeModal();
    }

    const handlePay = async (id: string, amount: number, date: string) => {
        try {
            await payExpense(id, amount, date);
            setSuccess("Pagamento registrado!");
            setIsPayModalOpen(false);
            fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            throw err;
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta despesa?')) {
            return;
        }
        
        try {
            await deleteExpense(id)
            await fetchData();
        } catch (err) {
            console.error(err);
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Ocorreu um erro inesperado.");
            } else {
                setError("Ocorreu um erro inesperado.");
            }
        };
    } 

    const handleView = (id: string) => {
        setExpenseId(id);
        setIsUpdate(false);
        openModal();
    }

    const handleRecreateRecurring = async () => {
        try {
            await reCreateExpense();
            await fetchData();

            setSuccess("Despesas recorrentes recriadas!");
            await fetchData();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Ocorreu um erro inesperado.");
            } else {
                setError("Ocorreu um erro inesperado.");
            }
        }
    }

    const handleOpenNew = () => {
        setExpenseId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !error && (!Array.isArray(expenses?.message) || expenses.message.length === 0);

    return (
        <div>
            <div className="flex items-center mt-5">
                <button 
                    type="button" 
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 ml-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={handleOpenNew}
                >
                    Novo
                </button> 
                <button 
                    type="button" 
                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 ml-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                    onClick={handleRecreateRecurring}
                >
                    Recriar Recorrente
                </button> 
                <h1 className="text-2xl ml-10 mr-10 font-semibold text-gray-900 dark:text-white text-center flex-1 pr-20">Despesa</h1> 
            </div>

            <div className="relative overflow-x-auto mt-10 ml-10 mr-10 shadow-md sm:rounded-lg">
                {success && (
                    <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                        <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z"/>
                        </svg>
                        <div className="ms-3 text-sm font-medium">
                            {success}
                        </div>
                        <button 
                            onClick={() => setSuccess(null)}
                            type="button" 
                            className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                        >
                            <X size={14} />
                        </button>
                    </div>
                )}
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
                {isEmpty && (
                    <div className="p-5 text-center text-gray-500 bg-white dark:bg-gray-800">
                        Não existe despesa cadastrada.
                    </div>
                )} 
                {!isEmpty && (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-15 py-3">
                                    Descrição
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Valor
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Frequência
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Data de Vencimento
                                </th>
                                <th scope="col" className="px-0 py-3">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses?.message.map((expense) => (
                                <tr key={expense.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                    <td className="px-15 py-4">
                                        {expense.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        {expense.amount > 0 
                                            ? expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                                            : (expense.estimated_amount ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {
                                            expense.frequency === 'monthly' ? 'Mensal' :
                                            expense.frequency === 'yearly' ? 'Anual' :
                                            expense.frequency
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        {expense.due_date ? new Date(expense.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                    </td>
                                    <td className="px-6 py-2 text-right">
                                        <button 
                                            onClick={() => openPayModal(expense.id)}
                                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                            title="Pagar despesa"
                                        >
                                            <Wallet size={18} />
                                        </button>
                                        <button 
                                            onClick={() => handleView(expense.id)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Visualizar detalhes"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={ () => {
                                                setExpenseId(expense.id);
                                                setIsUpdate(true);
                                                openModal();
                                            }}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Editar Despesa"
                                        >    
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {handleDelete(expense.id)}}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Deletar Despesa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <ModalExpense 
                isOpen={isModalOpen} 
                onClose={closeModal}
                onCardAction={handleExpense}
                isUpdate={isUpdate}
                expenseId={expenseId}
            />
            <ModalPayExpense 
                isOpen={isPayModalOpen}
                onClose={() => setIsPayModalOpen(false)}
                onConfirm={handlePay}
                expenseId={expenseId}
            />
        </div>
    )
}

export default Expense;