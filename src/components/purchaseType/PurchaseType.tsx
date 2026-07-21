import { useEffect, useState, useCallback } from "react";
import ModalPurchaseType from "./ModalPurchaseType";
import { deletePurchaseType, getPurchaseTypes, type PurchaseTypesResponse } from "@/services/purchaseType";
import { Pencil, Trash2, Plus, Tag, AlertCircle, X } from 'lucide-react';
import axios from "axios";

function PurchaseType() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [purchaseTypes, setPurchaseTypes] = useState<PurchaseTypesResponse>({
        message: [],
        statusCode: 0
    });
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [purchaseTypeId, setPurchaseTypeId] = useState<string>("");
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = useCallback(async () => {
        try {
            const data = await getPurchaseTypes();
            setPurchaseTypes(data);
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || "Erro ao carregar dados");
        }
    }, []); 

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePurchaseType = async () => {
        await fetchData();
        closeModal();
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar este tipo de compra?')) {
            return;
        }
    
        setIsDeleting(id);
        try {
            await deletePurchaseType(id);
            setPurchaseTypes(prev => ({
                ...prev,
                message: prev.message.filter(item => item.id !== id)
            }));
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Ocorreu um erro inesperado.");
            } else {
                setError("Ocorreu um erro inesperado.");
            }
        } finally {
            setIsDeleting(null);
        }
    } 

    const handleOpenNew = () => {
        setIsUpdate(false);
        setPurchaseTypeId("");
        openModal();
    }

    const isEmpty = !error && (!purchaseTypes?.message || purchaseTypes?.message?.length === 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tipo de Compra</h1>
                    <p className="text-muted mt-1">Categorize suas compras por tipo</p>
                </div>
                <button 
                    type="button" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Novo Tipo
                </button>
            </div>

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
                        <Tag className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhum tipo de compra cadastrado</h3>
                    <p className="text-sm text-muted">Crie categorias para organizar suas compras.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Nome</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchaseTypes?.message.map((message) => (
                                    <tr key={message.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{message.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setPurchaseTypeId(message.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar Tipo de Compra"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(message.id)}
                                                    disabled={isDeleting === message.id}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    title="Deletar Tipo de Compra"
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

            <ModalPurchaseType 
                isOpen={isModalOpen} 
                onClose={closeModal}
                onPurchaseTypeAction={handlePurchaseType}
                isUpdate={isUpdate}
                purchaseTypeId={isUpdate ? purchaseTypeId : ""}
            />
        </div>
    )
}

export default PurchaseType;
