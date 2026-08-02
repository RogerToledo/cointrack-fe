import { useState, useEffect } from "react";
import { getCreditCards, deleteCreditCard, CreditCardsResponse} from "@/services/creditCard";
import ModalCreditCard from "./ModalCreditCard";
import axios from "axios";
import { Pencil, Trash2, Plus, CreditCard as CreditCardIcon, AlertCircle, X } from 'lucide-react';

function CreditCard() {
    const [creditCards, setCreditCards] = useState<CreditCardsResponse>({
        message: [],
        statusCode: 0
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [creditCardId, setCreditCardId] = useState<string>("");

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = async () => {
        setError(null);

        try {
            const data = await getCreditCards();
            if (data) {
                setCreditCards(data);
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

    const handleCreditCard = async() => {
        await fetchData();
        closeModal();
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar este cartão de crédito?')) {
            return;
        }
        
        try {
            await deleteCreditCard(id)
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

    const handleOpenNew = () => {
        setCreditCardId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !error && (!Array.isArray(creditCards?.message) || creditCards.message.length === 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Cartão de Crédito</h1>
                    <p className="text-muted mt-1">Gerencie seus cartões de crédito</p>
                </div>
                <button 
                    type="button" 
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Novo Cartão
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
                        <CreditCardIcon className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhum cartão cadastrado</h3>
                    <p className="text-sm text-muted">Comece adicionando seu primeiro cartão de crédito.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Proprietário</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Nome</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Cartão Final</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Cartão Físico</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Fechamento</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Vencimento</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {creditCards?.message.map((card) => (
                                    <tr key={card.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{card.owner}</td>
                                        <td className="px-6 py-4 text-muted">{card.card_name || '-'}</td>
                                        <td className="px-6 py-4 text-muted">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-xs font-mono font-medium text-foreground">
                                                •••• {card.final_card_num}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-muted">
                                            {card.physical_card_last4 
                                                ? <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-secondary text-xs font-mono font-medium text-foreground">•••• {card.physical_card_last4}</span>
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-muted">Dia {card.invoice_closing_day}</td>
                                        <td className="px-6 py-4 text-muted">Dia {card.due_date}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setCreditCardId(card.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar Cartão"
                                                >    
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(card.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Deletar Cartão"
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

            <ModalCreditCard 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onCardAction={handleCreditCard}
                isUpdate={isUpdate}
                creditCardId={isUpdate ? creditCardId : ""}
            />
        </div>
    )
}

export default CreditCard;
