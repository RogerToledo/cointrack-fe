import { useEffect, useState } from "react";
import { getPurchases, deletePurchase, type PurchasesResponse } from "@/services/purchase";
import { getPurchasesInstallments, payInstallment, type Installment } from "@/services/installment";
import { Eye, Layers, Pencil, Trash2, X, Plus, ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import ModalPurchase from "./ModalPurchase";
import ModalInstallments from "../installment/ModalInstallment";

function Purchase() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchases, setPurchases] = useState<PurchasesResponse>({
        message: [],
        statusCode: 0,
    });
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [purchaseId, setPurchaseId] = useState<string | null>(null);
    const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
    const [selectedPurchaseInstallments, setSelectedPurchaseInstallments] = useState<Installment[]>([]);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        setPurchaseId(null);
    }    

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getPurchases();
            console.log("Fetched purchases:", data);
            if (data && Array.isArray(data.message)) {
                setPurchases(data);
            } else {
                setPurchases({ message: [], statusCode: 200 });
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro desconhecido ao carregar compras");
            }
            setPurchases({ message: [], statusCode: 500 });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handlePurchase = () => {
        fetchData();
    }

    const handleInstallments = async (purchaseId: string) => {
        try {
            setPurchaseId(purchaseId);
            const response = await getPurchasesInstallments(purchaseId);
            setSelectedPurchaseInstallments(Array.isArray(response.message) ? response.message : [response.message]);
            setIsInstallmentModalOpen(true);
        } catch (err) {
            console.error(err);
            alert("Erro ao carregar parcelas.");
        }
    }

    const handlePayInstallment = async (installmentId: string) => {
        setError(null);
        setSuccess(null);

        try {
            await payInstallment(installmentId); 
            setIsInstallmentModalOpen(false);
            setPurchaseId(null);
            setSelectedPurchaseInstallments([]);
            setSuccess("Parcela paga com sucesso!");
            setTimeout(() => setSuccess(null), 3000);
            await fetchData(); 
        } catch (err) {
            alert(`Erro ao processar pagamento: ${err instanceof Error ? err.message : "Erro desconhecido"}`);
            throw err;
        }
    };

    const handleView = (id: string) => {
        setPurchaseId(id);
        setIsUpdate(false);
        openModal();
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm("Tem certeza que deseja deletar esta compra?")) return;

        try {
            console.log("Deleting purchase", id);
            await deletePurchase(id)
            await fetchData();
        } catch (err) {
            console.error(err);
            alert("Erro ao deletar a compra.");
        }
    } 

    const handleOpenNew = () => {
        setPurchaseId(null);
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !loading && !error && (!purchases?.message || purchases.message.length === 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Compras</h1>
                    <p className="text-muted mt-1">Gerencie todas as suas compras</p>
                </div>
                <button 
                    type="button" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Nova Compra
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
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted">Carregando compras...</p>
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                        <ShoppingCart className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma compra cadastrada</h3>
                    <p className="text-sm text-muted">Registre sua primeira compra para começar.</p>
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
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Local</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Valor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Data</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Parcelas</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchases?.message.map((message) => (
                                    <tr key={message.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{message.person}</td>
                                        <td className="px-6 py-4 text-muted">{message.description}</td>
                                        <td className="px-6 py-4 text-muted">{message.place}</td>
                                        <td className="px-6 py-4 font-medium text-foreground">R$ {message.amount}</td>
                                        <td className="px-6 py-4 text-muted">
                                            {message.date ? new Date(message.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                                {message.installment_number}x
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleView(message.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleInstallments(message.id)}
                                                    disabled={message.installment_number < 2}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        message.installment_number < 2 
                                                            ? "text-muted-light cursor-not-allowed opacity-40"
                                                            : "text-muted hover:text-accent hover:bg-accent-light"
                                                    }`}
                                                    title={message.installment_number < 2 ? "Compra à vista" : "Ver parcelas"}
                                                >
                                                    <Layers size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        setPurchaseId(message.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar compra"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(message.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Excluir compra"
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

            <ModalPurchase 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onPurchaseAction={handlePurchase}
                isUpdate={isUpdate}
                purchaseId={purchaseId}
            />
            <ModalInstallments
                isOpen={isInstallmentModalOpen}
                onClose={() => setIsInstallmentModalOpen(false)}
                installments={selectedPurchaseInstallments || []}
                onPay={handlePayInstallment}
            />
        </div>
    )
}

export default Purchase;
