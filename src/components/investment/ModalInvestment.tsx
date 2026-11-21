import { useState, useEffect, useCallback } from 'react';
import { getInvestment, createInvestment, updateInvestment } from '@/services/investment';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import axios from 'axios';

type UUID = string;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onInvestmentAction: () => void;
    isUpdate: boolean;
    investmentId: UUID | null;
}

interface Person {
    id: string;
    name: string;
}

const initialFormState = {
    description: '',
    monthly_amount: '',
    installments: 0,
    start_date: '',
    person: '',
};

const ModalInvestment: React.FC<ModalProps> = ({ isOpen, onClose, onInvestmentAction, isUpdate, investmentId }) => {
    const [formData, setFormData] = useState(initialFormState);
    const [persons, setPersons] = useState<Person[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { selectedFamily, isLoading: isFamilyLoading } = useFamily();
    const { user } = useAuth();

    const isViewOnly = !isUpdate && investmentId !== null;

    const getTitle = () => {
        if (isUpdate) return "Atualizar Investimento";
        if (isViewOnly) return "Visualizar Investimento";
        return "Cadastro de Investimento";
    };

    useEffect(() => {
        if (!isOpen) return;

        if (investmentId && (isUpdate || isViewOnly)) {
            const fetchInvestment = async () => {
                try {
                    const response = await getInvestment(investmentId);
                    const data = response.message;
                    setFormData({
                        description: data.description || '',
                        monthly_amount: data.monthly_amount?.toString() || '',
                        installments: data.installments || 0,
                        start_date: data.start_date || '',
                        person: data.person_id || '',
                    });
                } catch (err) {
                    if (axios.isAxiosError(err)) {
                        const apiMessage = err.response?.data?.message;
                        setError(apiMessage || "Ocorreu um erro inesperado.");
                    } else {
                        setError("Ocorreu um erro inesperado.");
                    }
                }
            };
            fetchInvestment();
        } else {
            setFormData(initialFormState);
        }
    }, [isOpen, isUpdate, investmentId, isViewOnly]);

    const fetchMetadata = useCallback(async () => {
        if (isFamilyLoading) return;

        if (selectedFamily?.members && selectedFamily.members.length > 0) {
            const familyPersons = selectedFamily.members.map(member => ({
                id: member.person_id,
                name: member.person_name,
            }));
            setPersons(familyPersons);
        } else if (user) {
            setPersons([{ id: user.id, name: user.name }]);
            if (!investmentId) {
                setFormData(prev => ({ ...prev, person: user.id }));
            }
        }
    }, [selectedFamily, isFamilyLoading, user, investmentId]);

    useEffect(() => {
        if (isOpen) { fetchMetadata(); }
    }, [isOpen, fetchMetadata]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prevData => ({
            ...prevData,
            [name]: name === 'installments' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setSuccess(null);
        setError(null);

        try {
            const amountFloat = typeof formData.monthly_amount === 'string'
                ? parseFloat(formData.monthly_amount.replace(',', '.'))
                : formData.monthly_amount;

            if (isUpdate && investmentId) {
                await updateInvestment(
                    investmentId,
                    formData.description,
                    amountFloat,
                    formData.installments,
                    formData.start_date,
                    formData.person
                );
                setSuccess("Investimento atualizado com sucesso!");
            } else {
                await createInvestment(
                    formData.description,
                    amountFloat,
                    formData.installments,
                    formData.start_date,
                    formData.person
                );
                setSuccess("Investimento cadastrado com sucesso!");
            }
            onInvestmentAction();

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

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative p-4 w-full max-w-xl max-h-full">
                <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {getTitle()}
                        </h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:bg-gray-200 rounded-lg p-2">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 14 14"><path stroke="currentColor" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" /></svg>
                        </button>
                    </div>

                    <div className="p-4 md:p-5">
                        {/* Success alert */}
                        {success && (
                            <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                                <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                </svg>
                                <div className="ms-3 text-sm font-medium">{success}</div>
                                <button
                                    type="button"
                                    onClick={() => setSuccess(null)}
                                    className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg focus:ring-2 focus:ring-green-400 p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700"
                                >
                                    <span className="sr-only">Fechar</span>
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                </button>
                            </div>
                        )}
                        {/* Error alert */}
                        {error && (
                            <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                                <svg className="flex-shrink-0 w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5ZM9.5 4a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3ZM12 15H8a1 1 0 0 1 0-2h1v-3H8a1 1 0 0 1 0-2h2a1 1 0 0 1 1 1v4h1a1 1 0 0 1 0 2Z" />
                                </svg>
                                <span className="sr-only">Erro</span>
                                <div className="ms-3 text-sm font-medium">{error}</div>
                                <button
                                    onClick={() => setError(null)}
                                    type="button"
                                    className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700"
                                    aria-label="Close"
                                >
                                    <span className="sr-only">Fechar</span>
                                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6" />
                                    </svg>
                                </button>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Descrição</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleChange}
                                    disabled={isViewOnly}
                                    required
                                    className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                    placeholder="Descrição do investimento"
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Valor mensal (R$)</label>
                                    <input
                                        type="text"
                                        name="monthly_amount"
                                        value={formData.monthly_amount}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        required
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                        placeholder="0,00"
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Parcelas (aportes)</label>
                                    <input
                                        type="number"
                                        name="installments"
                                        min={1}
                                        value={formData.installments}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        required
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 flex-wrap md:flex-nowrap">
                                <div className="flex-1 min-w-[150px]">
                                    <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">* Data de início</label>
                                    <input
                                        type="date"
                                        name="start_date"
                                        value={formData.start_date}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        required
                                        className="w-full p-2.5 bg-gray-50 border rounded-lg dark:bg-gray-600 dark:text-white"
                                    />
                                </div>
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
                            </div>

                            {!isViewOnly && (
                                <div className="flex justify-center pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 font-medium rounded-lg text-sm px-20 py-2.5 dark:bg-blue-600 disabled:opacity-50"
                                    >
                                        {isSaving ? "Salvando..." : (isUpdate ? "Atualizar Investimento" : "Adicionar novo investimento")}
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModalInvestment;
