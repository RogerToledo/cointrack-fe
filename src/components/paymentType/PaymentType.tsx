import { useState, useEffect } from "react";
import ModalPaymentType from "./ModalPaymentType";
import { 
    deletePaymentType, 
    getPaymentTypes,
    type PaymentTypesResponse
} from "@/services/paymentType";
import axios from "axios";
import { Pencil, Trash2, Plus, Wallet, AlertCircle, X } from 'lucide-react';

function PaymentType() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [paymentTypes, setPaymentTypes] = useState<PaymentTypesResponse>({
        message: [],
        statusCode: 0,
    });
    
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [paymentTypeId, setPaymentTypeId] = useState<string>("");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = async () => {
        setError(null);

        try {
            const data = await getPaymentTypes();
            if (data) {
                setPaymentTypes(data);
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

    const handlePaymentType = () => {
        fetchData();
        closeModal();
    }

    const handleDelete = async (id: string) => {
        setError(null);
        if (!window.confirm("Tem certeza que deseja deletar este tipo de pagamento?")) return;
        
        try {
            console.log("Deleting paymentType", id);
            await deletePaymentType(id);
            await fetchData();
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
        setPaymentTypeId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !error && (!paymentTypes?.message || paymentTypes.message.length === 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Tipo de Pagamento</h1>
                    <p className="text-muted mt-1">Gerencie os tipos de pagamento disponíveis</p>
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
                        <Wallet className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhum tipo de pagamento cadastrado</h3>
                    <p className="text-sm text-muted">Adicione tipos de pagamento para usar nas compras.</p>
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
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Modalidade</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {paymentTypes?.message.map((message) => (
                                    <tr key={message.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{message.name}</td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary">
                                                {message.spot_payment === 0 ? "À vista" : message.spot_payment === 1 ? "Parcelado" : "Ambos"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setPaymentTypeId(message.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar Tipo de Pagamento"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(message.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Deletar Tipo de Pagamento"
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

            <ModalPaymentType 
                isOpen={isModalOpen} 
                onClose={closeModal}
                onPaymentTypeAction={handlePaymentType}
                isUpdate={isUpdate}
                paymentTypeId={isUpdate ? paymentTypeId : ""}
            />
        </div>
    )
}

export default PaymentType;
