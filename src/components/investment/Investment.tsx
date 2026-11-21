import { useEffect, useState, useCallback } from "react";
import {
    getInvestments,
    deleteInvestment,
    payInvestmentInstallment,
    type Investment,
    type InvestmentInstallment,
} from "@/services/investment";
import { formatBRL } from "@/utils/currency";
import { Eye, Layers, Pencil, Trash2, Plus, TrendingUp, AlertCircle, CheckCircle, X } from 'lucide-react';
import ModalInvestment from "./ModalInvestment";
import ModalInvestmentInstallments from "./ModalInvestmentInstallments";

function Investment() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [investments, setInvestments] = useState<Investment[]>([]);
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [investmentId, setInvestmentId] = useState<string | null>(null);
    const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
    const [selectedInstallments, setSelectedInstallments] = useState<InvestmentInstallment[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [total, setTotal] = useState(0);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setInvestmentId(null);
    };

    const fetchData = useCallback(async (targetPage: number = 1) => {
        setLoading(true);
        setError(null);

        try {
            const data = await getInvestments(targetPage, 20);
            const msg = data?.message;
            if (msg && typeof msg === 'object' && !Array.isArray(msg) && 'responses' in msg) {
                setInvestments(msg.responses);
                setPage(msg.page);
                setTotalPages(msg.total_pages);
                setTotal(msg.total ?? 0);
            } else {
                setInvestments([]);
                setTotal(0);
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro desconhecido ao carregar investimentos");
            }
            setInvestments([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setPage(1);
        fetchData(1);
    }, [fetchData]);

    const handleInvestment = () => {
        fetchData(page);
    };

    const handleInstallments = (id: string) => {
        const investment = investments.find(i => i.id === id);
        setInvestmentId(id);
        setSelectedInstallments(investment?.records ?? []);
        setIsInstallmentModalOpen(true);
    };

    const handlePayInstallment = async (installmentId: string) => {
        setError(null);
        setSuccess(null);

        try {
            await payInvestmentInstallment(installmentId);
            setIsInstallmentModalOpen(false);
            setInvestmentId(null);
            setSelectedInstallments([]);
            setSuccess("Aporte pago com sucesso!");
            setTimeout(() => setSuccess(null), 3000);
            await fetchData(page);
        } catch (err) {
            alert(`Erro ao processar pagamento: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
            throw err;
        }
    };

    const handleView = (id: string) => {
        setInvestmentId(id);
        setIsUpdate(false);
        openModal();
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja deletar este investimento?")) return;

        try {
            await deleteInvestment(id);
            await fetchData(page);
        } catch (err) {
            console.error(err);
            alert("Erro ao deletar o investimento.");
        }
    };

    const handleOpenNew = () => {
        setInvestmentId(null);
        setIsUpdate(false);
        openModal();
    };

    const isEmpty = !loading && !error && investments.length === 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Investimentos</h1>
                    <p className="text-muted mt-1">Gerencie seus aportes e investimentos</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Novo Investimento
                </button>
            </div>

            {/* Total */}
            <div className="flex items-center justify-between gap-2">
                <div className="bg-card border border-border rounded-xl px-4 py-2">
                    <p className="text-xs text-muted">Total investido</p>
                    <p className="text-lg font-semibold text-foreground">{formatBRL(total)}</p>
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
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted">Carregando investimentos...</p>
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                        <TrendingUp className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhum investimento cadastrado</h3>
                    <p className="text-sm text-muted">Registre seu primeiro investimento para começar.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && !loading && !error && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Pessoa</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Descrição</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Valor mensal</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Início</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Aportes</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Total</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {investments.map((item) => (
                                    <tr key={item.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{item.person}</td>
                                        <td className="px-6 py-4 text-muted">{item.description}</td>
                                        <td className="px-6 py-4 font-medium text-foreground">{formatBRL(item.monthly_amount)}</td>
                                        <td className="px-6 py-4 text-muted">
                                            {item.start_date ? new Date(item.start_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                                {item.installments}x
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-foreground">{formatBRL(item.total)}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    onClick={() => handleView(item.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleInstallments(item.id)}
                                                    disabled={!item.records || item.records.length === 0}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        !item.records || item.records.length === 0
                                                            ? "text-muted-light cursor-not-allowed opacity-40"
                                                            : "text-muted hover:text-accent hover:bg-accent-light"
                                                    }`}
                                                    title="Ver aportes"
                                                >
                                                    <Layers size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setInvestmentId(item.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar investimento"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Excluir investimento"
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 py-4 border-t border-border">
                            <button
                                onClick={() => fetchData(page - 1)}
                                disabled={page <= 1}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Anterior
                            </button>
                            <span className="text-sm text-muted">
                                Página {page} de {totalPages}
                            </span>
                            <button
                                onClick={() => fetchData(page + 1)}
                                disabled={page >= totalPages}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-muted hover:text-foreground hover:bg-secondary transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                Próxima
                            </button>
                        </div>
                    )}
                </div>
            )}

            <ModalInvestment
                isOpen={isModalOpen}
                onClose={closeModal}
                onInvestmentAction={handleInvestment}
                isUpdate={isUpdate}
                investmentId={investmentId}
            />
            <ModalInvestmentInstallments
                isOpen={isInstallmentModalOpen}
                onClose={() => setIsInstallmentModalOpen(false)}
                installments={selectedInstallments || []}
                onPay={handlePayInstallment}
            />
        </div>
    );
}

export default Investment;
