import { createCreditCard, getCreditCard, getPhysicalCreditCards, updateCreditCard, CreditCard } from '@/services/creditCard';
import { Person } from '@/services/person';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';
import { X, AlertCircle, CheckCircle } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAction: () => void;
    isUpdate: boolean;
    creditCardId: string;
}

const ModalcreditCard: React.FC<ModalProps> = ({ isOpen, onClose, onCardAction, isUpdate, creditCardId }) => {
    const [title, setTitle] = useState("Cadastro de Cartão de Crédito");
    const [buttonText, setButtonText] = useState("Adicionar novo cartão de crédito"); 
    const [cardOwner, setCardOwner] = useState('');
    const [finalCardNum, setFinalCardNum] = useState('');
    const [type, setType] = useState('');
    const [invoiceCloseDay, setInvoiceCloseDay] = useState(0);
    const [dueDate, setDueDate] = useState(0);
    const [cardName, setCardName] = useState('');
    const [parentCardId, setParentCardId] = useState('');
    const [physicalCards, setPhysicalCards] = useState<CreditCard[]>([]);
    const [ownerList, setOwnerList] = useState<Person[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { selectedFamily } = useFamily();
    const { user } = useAuth();

    const isVirtualType = type === 'V' || type === 'VT';
    const showCardName = type === 'V';
    const showParentCard = type === 'V' || type === 'VT';

    useEffect(() => {
        const loadInitialData = async () => {
            setSuccess(null);
            setError(null);
            if (isOpen) {
                try {
                    let owners: Person[] = [];
                    if (selectedFamily?.members && selectedFamily.members.length > 0) {
                        owners = selectedFamily.members.map(m => ({ id: m.person_id, name: m.person_name }));
                    } else if (user) {
                        owners = [{ id: user.id, name: user.name }];
                        setCardOwner(user.id);
                    }
                    setOwnerList(owners);

                    // Carregar cartões físicos para o select de cartão pai
                    try {
                        const cardsResponse = await getPhysicalCreditCards();
                        if (cardsResponse?.message && Array.isArray(cardsResponse.message)) {
                            setPhysicalCards(cardsResponse.message);
                        } else {
                            setPhysicalCards([]);
                        }
                    } catch {
                        setPhysicalCards([]);
                    }

                    if (isUpdate && creditCardId) {
                        setTitle("Atualização do Cartão de Crédito");
                        setButtonText("Atualizar Cartão de Crédito");
                        const cardResponse = await getCreditCard(creditCardId);
                        const cardData = cardResponse.message;
                        const ownerId = cardData.owner_id;
                        setCardOwner(ownerId);
                        setFinalCardNum(cardData.final_card_num);
                        setType(cardData.type);
                        setInvoiceCloseDay(cardData.invoice_closing_day);
                        setDueDate(cardData.due_date);
                        setCardName(cardData.card_name || '');
                        setParentCardId(cardData.physical_card_id || '');
                    } else {
                        setTitle("Cadastro de Cartão de Crédito");
                        setButtonText("Adicionar novo cartão de crédito");
                        setCardOwner(""); setFinalCardNum(""); setType(""); 
                        setInvoiceCloseDay(0); setDueDate(0);
                        setCardName(""); setParentCardId("");
                    }
                } catch (error) {
                    console.error("Error fetching card owners", error);
                    setError("Falha ao carregar informações do servidor.");
                }              
            }
        };
        loadInitialData();
    }, [isOpen, isUpdate, creditCardId, selectedFamily?.members, user]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!cardOwner || cardOwner === "" || cardOwner === "00000000-0000-0000-0000-000000000000") {
            setError("Por favor, selecione um proprietário válido."); return;
        }
        if (isVirtualType && !parentCardId) {
            setError("Por favor, selecione o cartão físico vinculado."); return;
        }

        // Definir card_name automático por tipo
        let resolvedCardName: string | undefined = undefined;
        if (type === 'F') {
            resolvedCardName = 'Físico';
        } else if (type === 'VT') {
            resolvedCardName = 'Temporário';
        } else if (type === 'V') {
            resolvedCardName = cardName || undefined;
        }

        try {
            if (isUpdate) {
                await updateCreditCard(
                    creditCardId, cardOwner, finalCardNum, type, invoiceCloseDay, dueDate,
                    resolvedCardName,
                    showParentCard ? parentCardId : undefined
                );
                setSuccess("Cartão de crédito atualizado com sucesso!");
            } else {
                await createCreditCard(
                    cardOwner, finalCardNum, type, invoiceCloseDay, dueDate,
                    resolvedCardName,
                    showParentCard ? parentCardId : undefined
                );
                setSuccess("Cartão de crédito criado com sucesso!");
            }
            setTimeout(() => { onCardAction(); onClose(); }, 2000);  
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Ocorreu um erro inesperado.");
            } else { setError("Ocorreu um erro inesperado"); }
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        switch(name) {
            case 'Owner': setCardOwner(value); break;
            case 'FinalCardNum': setFinalCardNum(value); break;
            case 'Type': setType(value); break;
            case 'InvoiceClosingDay': setInvoiceCloseDay(Number(value)); break;
            case 'DueDate': setDueDate(Number(value)); break;
            case 'CardName': setCardName(value); break;
            case 'ParentCardId': setParentCardId(value); break;
            default: break;
        }
    };

    if (!isOpen) return null;    

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            
            {/* Modal */}
            <div className="relative w-full max-w-md bg-card rounded-2xl border border-border shadow-lg overflow-hidden animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <button type="button" onClick={onClose} className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors">
                        <X className="w-5 h-5" />
                        <span className="sr-only">Fechar</span>
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {success && (
                        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-success-light border border-success/20">
                            <CheckCircle className="w-4 h-4 text-success flex-shrink-0" />
                            <p className="text-sm text-success">{success}</p>
                        </div>
                    )}
                    {error && (
                        <div className="flex items-center gap-3 p-3 mb-4 rounded-xl bg-danger-light border border-danger/20">
                            <AlertCircle className="w-4 h-4 text-danger flex-shrink-0" />
                            <p className="text-sm text-danger flex-1">{error}</p>
                            <button onClick={() => setError(null)} className="text-danger hover:text-danger/70"><X className="w-3.5 h-3.5" /></button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="Owner" className="block text-sm font-medium text-foreground mb-2">Proprietário</label>
                            <select name="Owner" id="Owner" value={cardOwner} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required>
                                <option value="">Escolha o proprietário do cartão</option>
                                {ownerList.map((owner) => (<option key={owner.id} value={owner.id}>{owner.name}</option>))}
                            </select>    
                        </div>
                        <div>
                            <label htmlFor="FinalCardNum" className="block text-sm font-medium text-foreground mb-2">Final do Cartão</label>
                            <input type="text" name="FinalCardNum" id="FinalCardNum" value={finalCardNum} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="0000" required />
                        </div>
                        <div>
                            <label htmlFor="Type" className="block text-sm font-medium text-foreground mb-2">Tipo do Cartão</label>
                            <select value={type} onChange={(e) => setType(e.target.value)} name="Type" id="Type" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required>
                                <option value="">Escolha o tipo do cartão</option>
                                <option value="F">Físico</option>
                                <option value="V">Virtual</option>
                                <option value="VT">Virtual Temporário</option>
                            </select>
                        </div>

                        {/* Campos condicionais - Nome do cartão só para Virtual, Cartão físico para Virtual e VT */}
                        {showCardName && (
                            <div>
                                <label htmlFor="CardName" className="block text-sm font-medium text-foreground mb-2">Nome do Cartão</label>
                                <input type="text" name="CardName" id="CardName" value={cardName} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="Ex: Cartão compras online" />
                            </div>
                        )}
                        {showParentCard && (
                            <div>
                                <label htmlFor="ParentCardId" className="block text-sm font-medium text-foreground mb-2">Cartão Físico (pai)</label>
                                <select name="ParentCardId" id="ParentCardId" value={parentCardId} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" required>
                                    <option value="">Selecione o cartão físico vinculado</option>
                                    {physicalCards.map((card) => (
                                        <option key={card.id} value={card.id}>
                                            {card.owner} - •••• {card.final_card_num}
                                        </option>
                                    ))}
                                </select>
                                <p className="mt-1.5 text-xs text-muted">Vincule este cartão ao cartão físico correspondente para agrupamento de fatura.</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="InvoiceClosingDay" className="block text-sm font-medium text-foreground mb-2">Dia Fechamento</label>
                                <input type="text" name="InvoiceClosingDay" id="InvoiceClosingDay" value={invoiceCloseDay} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="15" required />
                            </div>
                            <div>
                                <label htmlFor="DueDate" className="block text-sm font-medium text-foreground mb-2">Dia Vencimento</label>
                                <input type="text" name="DueDate" id="DueDate" value={dueDate} onChange={handleChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all" placeholder="25" required />
                            </div>
                        </div>
                        <button type="submit" className="w-full py-3 px-4 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all">
                            {buttonText}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ModalcreditCard;
