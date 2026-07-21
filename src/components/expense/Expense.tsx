import { useState, useEffect } from "react";
import { getExpenses, deleteExpense, reCreateExpense, payExpense, ExpensesResponse} from "@/services/expense";
import ModalExpense from "./ModalExpense";
import ModalPayExpense from "./ModalPayExpense";
import axios from "axios";
import { Eye, Pencil, Trash2, Wallet, X, Plus, Receipt, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
                    <p className="text-muted mt-1">Gerencie suas despesas fixas e variáveis</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-all"
                        onClick={handleRecreateRecurring}
                    >
                        <RefreshCw className="w-4 h-4" />
                        Recriar Recorrente
                    </button>
                    <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                        onClick={handleOpenNew}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Despesa
                    </button>
                </div>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success-light border border-success/20" role="alert">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <p className="text-sm text-success flex-1">{success}</p>
                    <button onClick={() => setSuccess(null)} className="text-success hover:text-success/70 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20" role="alert">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-danger hover:text-danger/70 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma despesa cadastrada</h3>
                    <p className="text-sm text-muted">Comece adicionando suas despesas mensais.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Descrição</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Valor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Frequência</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Vencimento</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {expenses?.message.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{expense.description}</td>
                                        <td className="px-6 py-4 font-medium text-danger">
                                            {expense.amount > 0 
                                                ? expense.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) 
                                                : (expense.estimated_amount ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                                {expense.frequency === 'monthly' ? 'Mensal' :
                                                 expense.frequency === 'yearly' ? 'Anual' :
                                                 expense.frequency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted">
                                            {expense.due_date ? new Date(expense.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => openPayModal(expense.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-success hover:bg-success-light transition-colors"
                                                    title="Pagar despesa"
                                                >
                                                    <Wallet size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleView(expense.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setExpenseId(expense.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar Despesa"
                                                >    
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(expense.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Deletar Despesa"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

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
