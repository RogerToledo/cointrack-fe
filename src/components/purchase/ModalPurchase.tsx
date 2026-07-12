import { useState, useEffect, useCallback } from 'react';
import { getPurchase, createPurchase, updatePurchase } from '@/services/purchase';
import { getCreditCards } from '@/services/creditCard';
import { getPaymentTypes } from '@/services/paymentType';
import { getPurchaseTypes } from '@/services/purchaseType';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

type UUID = string;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPurchaseAction: () => void;
    isUpdate: boolean;
    purchaseId: UUID | null;
}

interface Person {
    id: string;
    name: string;
}

interface PaymentType {
    id: string;
    name: string;
}

interface Card {
    id: string;
    owner: string;
    final_card_num: string;
}

interface PurchaseType {
    id: string;
    name: string;
}

const initialFormState = {
    description: '',
    amount: '',
    date: '',
    installment_number: 0,
    place: '',
    paid: false,
    payment_type: '',
    credit_card: '',
    purchase_type: '',
    person: '',
}

const ModalPurchaseType: React.FC<ModalProps> = ({ isOpen, onClose, onPurchaseAction, isUpdate, purchaseId }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [persons, setPersons] = useState<Person[]>([]);
    const [paymentTypes, setPaymentType] = useState<PaymentType[]>([]);
    const [types, setTypes] = useState<PurchaseType[]>([]);
    const [cards, setCards] = useState<Card[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { selectedFamily } = useFamily();
    const { user } = useAuth();

    const isViewOnly = !isUpdate && purchaseId !== null;

    const getTitle = () => {
        if (isUpdate) return "Atualizar Compra";
        if (isViewOnly) return "Visualizar Compra";
        return "Cadastro de Compra";
    }

    useEffect(() => {
        if (!isOpen) return;

        if (purchaseId && (isUpdate || isViewOnly)) {
            
            const fetchPurchaseType = async () => {
                try {
                    const response = await getPurchase(purchaseId);
                    const data = response.message;
                    setFormData({
                        description: data.description || '',
                        amount: data.amount?.toString() || '',
                        date: data.date || '',
                        installment_number: data.installment_number || 0,
                        place: data.place || '',
                        paid: data.paid || false,
                        payment_type: data.payment_type_id || '',
                        credit_card: data.credit_card_id || '',
                        purchase_type: data.purchase_type_id || '',
                        person: data.person_id || ''
                    });
                    console.log("DEBUG - Dados da compra carregados:", data);
                } catch (err) {
                    console.log("DEBUG - Erro completo:", err);
                    if (axios.isAxiosError(err)) {
                        const apiMessage = err.response?.data?.message;
                        setError(apiMessage || "Ocorreu um erro inesperado.");
                    } else {
                        setError("Ocorreu um erro inesperado.");
                    }
                }
            };
            fetchPurchaseType();
        } else {
           setFormData(initialFormState);
        }
    }, [isOpen, isUpdate, purchaseId, isViewOnly]);

    const fetchMetadata = useCallback(async () => {
        try {
            const [paymentTypesData, cardsData, purchaseTypesData] = await Promise.all([
                getPaymentTypes(),
                getCreditCards(),
                getPurchaseTypes()
            ]);

            // Se tem família selecionada com membros, listar membros da família
            if (selectedFamily?.members && selectedFamily.members.length > 0) {
                const familyPersons = selectedFamily.members.map(member => ({
                    id: member.person_id,
                    name: member.person_name
                }));
                setPersons(familyPersons);
            } else if (user) {
                // Se não tem família, setar apenas o próprio usuário e pré-selecionar
                setPersons([{ id: user.id, name: user.name }]);
                setFormData(prev => ({ ...prev, person: user.id }));
            }

            setPaymentType(Array.isArray(paymentTypesData.message) ? paymentTypesData.message : []);
            setCards(Array.isArray(cardsData.message) ? cardsData.message : []);
            setTypes(Array.isArray(purchaseTypesData.message) ? purchaseTypesData.message : []);
        } catch (error) {
            console.error("Error fetching metadata", error);
        }
    }, [selectedFamily, user]);

    useEffect(() => {
        if (isOpen) { fetchMetadata(); }
    }, [isOpen, fetchMetadata]);    

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const newData = {
                ...prevData,
            [name]: name === 'installment_number' ? Number(value) : value
            };

            if (name === "payment_type") {
                const selected = paymentTypes.find(pt => pt.id === value);
                const isCard = selected?.name.toLowerCase().includes("cartão de crédito");

                if (!isCard) {
                    newData.credit_card = "";
                }
            }
            console.log("DEBUG - Form data updated:", newData);
            return newData;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccess(null);
        setError(null);

        try {
            const amountFloat = typeof formData.amount === 'string' 
                ? parseFloat(formData.amount.replace(',', '.')) 
                : formData.amount;

            if (isUpdate && purchaseId) {
                await updatePurchase(
                    purchaseId,
                    formData.description,
                    amountFloat,
                    formData.date,
                    formData.installment_number,
                    formData.place,
                    formData.paid,
                    formData.payment_type,
                    formData.credit_card,
                    formData.purchase_type,
                    formData.person
                );
                setSuccess("Compra atualizada com sucesso!");
            } else {
                const paidCorrected = formData.credit_card !== "";
                
                await createPurchase(
                    formData.description,
                    amountFloat,
                    formData.date,
                    formData.installment_number,
                    formData.place,
                    paidCorrected,
                    formData.payment_type,
                    formData.credit_card,
                    formData.purchase_type,
                    formData.person
                );
                setSuccess("Compra cadastrada com sucesso!");
            }
            onPurchaseAction();

            setTimeout(() => {
                setSuccess(null);
                onClose(); 
            }, 3000);

        } catch (err) {
            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message || 
                                   err.response?.data?.error || 
                                   "Erro interno no servidor (500).";
                setError(apiMessage);
            } else {
                setError("Ocorreu um erro inesperado");
            }    
        } finally {
            setIsSaving(false);
        }
    };

    const isCreditCardSelected = () => {
        const selectedType = (paymentTypes ?? []).find(pt => pt.id === formData.payment_type);
        return selectedType?.name?.toLowerCase().includes("cartão de crédito") ?? false;
    }

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative p-4 w-full max-h-full">
                <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {getTitle()}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:bg-gray-200 rounded-lg p-2">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/></svg>
                        </button>
                    </div>

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
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Linha 1: Local e Descrição */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Local</label>
                                    <input 
                                        type="text" 
                                        name="place" 
                                        value={formData.place} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white" 
                                        placeholder="Local da compra"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                    <input 
                                        type="text" 
                                        name="description" 
                                        value={formData.description} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white" 
                                        placeholder="Descrição"
                                    />
                                </div>
                            </div>

                            {/* Linha 2: Data, Valor e Parcelas */}
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Data</label>
                                    <input 
                                        type="date" 
                                        name="date" 
                                        value={formData.date}
                                         onChange={handleChange} 
                                         disabled={isViewOnly}
                                         required 
                                         className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Valor (R$)</label>
                                    <input 
                                        type="text" 
                                        name="amount" 
                                        value={formData.amount} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        required 
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white" 
                                        placeholder="0,00"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Parcelas</label>
                                    <input 
                                        type="number" 
                                        name="installment_number" 
                                        value={formData.installment_number} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        required 
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            {/* Linha 3: Selects */}
                            <div className="flex gap-4 flex-wrap md:flex-nowrap">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Pessoa</label>
                                    <select 
                                        name="person" 
                                        value={formData.person} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        required 
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white">
                                        <option value="">Escolha a Pessoa</option>
                                        {persons.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Pagamento</label>
                                    <select 
                                        name="payment_type" 
                                        value={formData.payment_type} 
                                        disabled={isViewOnly}
                                        onChange={handleChange} 
                                        required 
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white">
                                        <option value="">Tipo</option>
                                        {paymentTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.name}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className={`block mb-2 text-sm font-medium ${!isCreditCardSelected ? 'text-gray-900' : 'text-gray-900 dark:text-white'}`}>Cartão de Crédito</label>
                                    <select 
                                        name="credit_card" 
                                        value={formData.credit_card} 
                                        onChange={handleChange} 
                                        className={`w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white ${!isCreditCardSelected() ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'bg-gray-50 border-gray-300'}`}
                                        disabled={!isCreditCardSelected() || isViewOnly}
                                    >
                                        <option value="">Nenhum</option>
                                        {Array.isArray(cards) && cards.map(c => <option key={c.id} value={c.id}>{c.owner} - {c.final_card_num}</option>)}
                                    </select>
                                </div>
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Tipo Compra</label>
                                    <select 
                                        name="purchase_type" 
                                        value={formData.purchase_type} 
                                        onChange={handleChange} 
                                        disabled={isViewOnly}
                                        required 
                                            className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-700 dark:text-white">
                                        <option value="">Tipo Compra</option>
                                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                            </div>
                            {!isViewOnly && (
                            <div className="flex justify-center pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm px-20 py-2.5 dark:bg-blue-600 disabled:opacity-50"
                                >
                                    {isSaving ? "Salvando..." : (isUpdate ? "Atualizar Compra" : "Adicionar nova compra")}
                                </button>
                            </div>)}
                            
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalPurchaseType;
