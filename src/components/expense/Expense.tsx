import { useState, useEffect } from "react";
import { getExpenses, deleteExpense, reCreateExpense, payExpense, ExpensesResponse} from "@/services/expense";
import { getPaymentTypes, PaymentType } from "@/services/paymentType";
import { formatBRL } from "@/utils/currency";
import ModalExpense from "./ModalExpense";
import ModalPayExpense from "./ModalPayExpense";
import axios from "axios";
import { Eye, Pencil, Trash2, Wallet, X, Plus, Receipt, AlertCircle, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

const CREDIT_CARD_LABEL = "cartão de crédito";

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
    const [showRecreateModal, setShowRecreateModal] = useState<boolean>(false);
    const [paidExpenseId, setPaidExpenseId] = useState<string>("");
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);
    const [paymentTypes, setPaymentTypes] = useState<PaymentType[]>([]);

    const openPayModal = (id: string) => {
        setExpenseId(id);
        setIsPayModalOpen(true);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = async () => {
        setError(null);

        try {
            const [expenseData, paymentTypeData] = await Promise.all([getExpenses(), getPaymentTypes()]);

            if (Array.isArray(paymentTypeData?.message)) {
                setPaymentTypes(paymentTypeData.message);
            }

            if (expenseData && Array.isArray(expenseData.message)) {
                setExpenses(expenseData);
            } else if (expenseData?.message && !Array.isArray(expenseData.message)) {
                setExpenses({ message: [expenseData.message], statusCode: expenseData.statusCode });
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

// Despesas pagas ficam sempre na tela, com a tag Paga. As pendentes filtram
// pelo mes de vencimento. O endpoint de despesas nao aceita ano/mes, entao o
// filtro roda no cliente.
const visibleExpenses = (Array.isArray(expenses?.message) ? expenses.message : []).filter((expense) => {
    if (expense.paid) return true;
    if (!expense.due_date) return false;

    const [year, month] = selectedMonth.split('-').map(Number);
    const due = new Date(expense.due_date);

    return due.getUTCFullYear() === year && due.getUTCMonth() + 1 === month;
});

    const getPaymentTypeName = (id?: string) => {
        if (!id) return '-';

        const found = paymentTypes.find(type => type.id === id);
        return found?.name || '-';
    };

    const isCreditCard = (expenseId?: string) => {
        if (!expenseId) return false;

        const found = paymentTypes.find(type => type.id === expenseId);
        return found?.name?.toLowerCase().includes(CREDIT_CARD_LABEL) ?? false;
    };

    const handleExpense = async() => {
        await fetchData();
        closeModal();
    }

    const handlePay = async (id: string, amount: number, date: string) => {
        try {
            await payExpense(id, amount, date);
            setIsPayModalOpen(false);
            fetchData();
            setPaidExpenseId(id);
            setShowRecreateModal(true);
        } catch (err) {
            throw err;
        }
    };

    const handleRecreateConfirm = async () => {
        try {
            await reCreateExpense(paidExpenseId);
            await fetchData();
            setSuccess("Despesa paga e recorrente recriada com sucesso!");
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Despesa paga, mas erro ao recriar recorrência.");
            } else {
                setError("Despesa paga, mas erro ao recriar recorrência.");
            }
        } finally {
            setShowRecreateModal(false);
            setPaidExpenseId("");
        }
    };

    const handleRecreateDecline = () => {
        setShowRecreateModal(false);
        setPaidExpenseId("");
        setSuccess("Pagamento registrado com sucesso!");
        setTimeout(() => setSuccess(null), 3000);
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

    const handleOpenNew = () => {
        setExpenseId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !error && visibleExpenses.length === 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Despesas</h1>
                    <p className="text-muted mt-1">Gerencie suas despesas fixas e variáveis</p>
                </div>
                <button 
                    type="button" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Nova Despesa
                </button>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const prev = new Date(year, month - 2, 1);
                        setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
                    }}
                    className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    aria-label="Mês anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-muted" />
                </button>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    onClick={() => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const next = new Date(year, month, 1);
                        setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
                    }}
                    disabled={selectedMonth === getCurrentMonth()}
                    className="p-2 rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Próximo mês"
                >
                    <ChevronRight className="w-4 h-4 text-muted" />
                </button>
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
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma despesa neste mês</h3>
                    <p className="text-sm text-muted">Ajuste o mês ou adicione uma nova despesa.</p>
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
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Tipo de Pagamento</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Valor estimado</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Valor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Vencimento</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Frequência</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {visibleExpenses.map((expense) => (
                                    <tr key={expense.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{expense.description}</td>
                                        <td className="px-6 py-4 text-muted">{getPaymentTypeName(expense.payment_type_id)}</td>
                                        <td className="px-6 py-4 text-right text-muted">{formatBRL(expense.estimated_amount)}</td>
                                        <td className="px-6 py-4 text-right font-medium text-danger">{formatBRL(expense.amount)}</td>
                                        <td className="px-6 py-4 text-muted">
                                            <div className="flex items-center gap-2">
                                                <span>
                                                    {expense.due_date ? new Date(expense.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                                </span>
                                                {expense.paid && (
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-light text-success">
                                                        Paga
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                                {expense.frequency === 'monthly' ? 'Mensal' :
                                                 expense.frequency === 'yearly' ? 'Anual' :
                                                 expense.frequency}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                {!isCreditCard(expense.payment_type_id) && (
                                                    <button 
                                                        onClick={() => openPayModal(expense.id)}
                                                        className="p-2 rounded-lg text-muted hover:text-success hover:bg-success-light transition-colors"
                                                        title="Pagar despesa"
                                                    >
                                                        <Wallet size={16} />
                                                    </button>
                                                )}
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

            {/* Modal Recriar Recorrente */}
            {showRecreateModal && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="fixed inset-0 bg-black opacity-50" onClick={handleRecreateDecline}></div>
                    <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-6 h-6 text-primary" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground mb-2">Despesa paga com sucesso!</h3>
                            <p className="text-sm text-muted mb-6">Deseja recriar esta despesa como recorrente para o próximo período?</p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleRecreateDecline}
                                    className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
                                >
                                    Não, obrigado
                                </button>
                                <button
                                    onClick={handleRecreateConfirm}
                                    className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover transition-colors"
                                >
                                    Sim, recriar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Expense;
