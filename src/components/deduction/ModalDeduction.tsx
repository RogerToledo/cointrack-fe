import { createDeductionRecord, getDeductionById, updateDeduction } from '@/services/deduction';
import { getEarnings, EarningsResponse, Earning } from '@/services/earning';
import { getDeductions, DeductionsResponse, Deduction } from '@/services/deduction';
import { useAuth } from '@/contexts/AuthContext';
import { useFamily } from '@/contexts/FamilyContext';
import { Person } from '@/services/person';
import { extractErrorMessage, logApiError } from '@/utils/errorMessage';
import { useState, useEffect } from 'react';
import React from 'react';
import ModalDeductionNew from './ModalDeductionNew';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAction: () => void;
    isUpdate: boolean;
    deductionId: string;
    selectedMonth: string;
}

const ModalDeduction: React.FC<ModalProps> = ({ isOpen, onClose, onCardAction, isUpdate, deductionId, selectedMonth}) => {
    const [buttonText, setButtonText] = useState("Adicionar nova dedução"); 
    const [earningList, setEarningList] = useState<EarningsResponse>({ 
        message: [],
        statusCode: 0});
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [ownerList, setOwnerList] = useState<Person[]>([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [active, setActive] = useState(false);
    const [periodicity, setPeriodicity] = useState('MENSAL');
    const [earningId, setEarningId] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deductionOptions, setDeductionOptions] = useState<Deduction[]>([]);
    const [selectedDeductionId, setSelectedDeductionId] = useState('');
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const { user } = useAuth();
    const { selectedFamily } = useFamily();

     const isViewOnly = !isUpdate && deductionId !== "";
     const isCreateMode = !isUpdate && !isViewOnly;

     const getTitle = () => {
        if (isUpdate) return "Atualizar Dedução";
        if (isViewOnly) return "Visualizar Dedução";
        return "Cadastro de Dedução";
    }
    
    useEffect(() => {
    const loadInitialData = async () => {
        if (!isOpen) return;

        setSuccess(null);
        setError(null);

        try {
            // Usar membros da família ou apenas o usuário logado
            let owners: Person[] = [];
            if (selectedFamily?.members && selectedFamily.members.length > 0) {
                owners = selectedFamily.members.map(m => ({ id: m.person_id, name: m.person_name }));
            } else if (user) {
                owners = [{ id: user.id, name: user.name }];
            }
            setOwnerList(owners);

            // Lista de ganhos limitada ao mês selecionado: sem esse filtro o select
            // oferece ganhos de outros períodos e permite criar dedução apontando
            // para um ganho que não existe mais.
            let earningsForMatch: Earning[] = [];
            try {
                const [year, month] = selectedMonth.split('-').map(Number);
                const earningResponse = await getEarnings(year, month, user?.id);
                if (earningResponse && Array.isArray(earningResponse.message)) {
                    setEarningList(earningResponse);
                    earningsForMatch = earningResponse.message;
                } else {
                    setEarningList({ message: [], statusCode: 200 });
                }
            } catch (earningError) {
                logApiError('getEarnings (deduction modal)', earningError);
                setEarningList({ message: [], statusCode: 0 });
            }

            if (deductionId && deductionId !== "" && (isUpdate || isViewOnly)) {
                setButtonText("Atualizar Dedução");

                const deductionResponse = await getDeductionById(deductionId);
                const deductionData = deductionResponse.message;
                const dateFormatted = deductionData.record?.date ? deductionData.record.date.split('T')[0] : '';

                setEarningId(deductionData.id_earning || '');

                // pré-selecionar o proprietário com base no ganho carregado
                const matchedEarning = earningsForMatch.find(
                    (e: Earning) => e.id === deductionData.id_earning
                );
                if (matchedEarning) setSelectedPersonId(matchedEarning.idUser);

                setDescription(deductionData.description);
                setAmount(deductionData.record?.amount?.toString() || '');
                setDateEnd(dateFormatted);
                setActive(deductionData.active);
                setPeriodicity(deductionData.periodicity || 'MENSAL');
            } else {
                setButtonText("Adicionar nova dedução");
                setEarningId("");
                setSelectedPersonId("");
                setDescription("");
                setAmount('');
                setDateEnd("");
                setActive(false);
                setPeriodicity('MENSAL');
                setSelectedDeductionId('');

                // No cadastro a descricao e escolhida entre as deducoes ja
                // existentes do usuario, para lancar um novo record mensal.
                try {
                    const allDeductions = await getDeductions(undefined, undefined, user?.id);
                    if (allDeductions && Array.isArray(allDeductions.message)) {
                        setDeductionOptions(allDeductions.message);
                    } else {
                        setDeductionOptions([]);
                    }
                } catch (deductionError) {
                    logApiError('getDeductions (deduction modal)', deductionError);
                    setDeductionOptions([]);
                }
            }
        } catch (error) {
            setError(extractErrorMessage(error) || "Falha ao carregar informações do servidor.");
            console.error(error);
        }
    };
    loadInitialData();
    }, [isOpen, isUpdate, deductionId, isViewOnly, user?.id, selectedMonth]);

        
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isCreateMode && !selectedDeductionId) {
            setError("Selecione uma dedução ou use o botão + para cadastrar uma nova.");
            return;
        }

        if (!isCreateMode && !earningId) {
            setError("Por favor, selecione um ganho válido.");
            return;
        }

        if (!dateEnd) {
            setError("Por favor, selecione uma data válida.");
            return;
        }

        try {
            const amountFloat = parseFloat(String(amount).replace(',', '.'));

            if (isCreateMode) {
                // Lancamento mensal sobre uma deducao ja cadastrada.
                await createDeductionRecord({
                    id_deduction: selectedDeductionId,
                    date: dateEnd,
                    amount: amountFloat,
                });
                setSuccess("Lançamento criado com sucesso!");
            } else {
                const payload = {
                    description,
                    idEarning: earningId,
                    periodicity,
                    record: {
                        date: dateEnd,
                        amount: amountFloat,
                    },
                };

                await updateDeduction(deductionId, payload);
                setSuccess("Dedução atualizada com sucesso!");
            }

            setTimeout(() => {
                onCardAction();
                onClose();
            }, 3000);
        } catch (err) {
            logApiError(isCreateMode ? 'createDeductionRecord' : 'updateDeduction', err);
            setError(extractErrorMessage(err));
        }
    }

    const handleDeductionSelect = (id: string) => {
        setSelectedDeductionId(id);

        const found = deductionOptions.find(d => d.id === id);
        if (found) {
            setDescription(found.description);
            setPeriodicity(found.periodicity || 'MENSAL');
            setEarningId(found.id_earning);
        } else {
            setDescription('');
            setPeriodicity('MENSAL');
            setEarningId('');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;



        switch(name) {
            case 'PersonId':
                setSelectedPersonId(value);
                setEarningId('');
                break;
            case 'EarningId':
                setEarningId(value);
                break;
            case 'Description':
                setDescription(value);
                break;
            case 'Amount':
                setAmount(value);
                break;
            case 'DateEnd':
                setDateEnd(value);
                break;
            case 'Active':
                setActive(value === 'true');
                break;
            case 'Periodicity':
                setPeriodicity(value);
                break;
            default:
                break;
        }
    };

    if (!isOpen) {
        return null;
    }    

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            {/* Main modal */}
            
                <div className="relative p-4 w-full max-w-md max-h-full">
                    {/*Modal content */}
                    <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                        {/* Modal header */}
                        <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {getTitle()}
                            </h3>
                            <button type="button" onClick={onClose} className="end-2.5 text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" data-modal-hide="authentication-modal">
                                <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                                </svg>
                                <span className="sr-only">Close modal</span>
                            </button>
                        </div>
                        {/*  Modal body */}
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
                            <form onSubmit={handleSubmit} className="space-y-4" action="#">
                                <div>
                                    <label htmlFor="PersonId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proprietário</label>
                                    <select 
                                        name="PersonId" 
                                        id="PersonId"
                                        value={selectedPersonId}
                                        onChange={handleChange}
                                        disabled={isViewOnly || isCreateMode}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o proprietário</option>
                                        {ownerList.map((owner) => (
                                            <option key={owner.id} value={owner.id}>{owner.name}</option>
                                        ))}
                                    </select>    
                                </div>
                                <div>
                                    <label htmlFor="EarningId" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ganho</label>
                                    <select 
                                        name="EarningId" 
                                        id="EarningId"
                                        value={earningId}
                                        onChange={handleChange}
                                        disabled={isViewOnly || isCreateMode || !selectedPersonId}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o ganho</option>
                                        {(earningList.message || [])
                                            .filter((e: Earning) => e.idUser === selectedPersonId)
                                            .map((earning: Earning) => (
                                                <option key={earning.id} value={earning.id}>{earning.description}</option>
                                            ))}
                                    </select>    
                                </div>
                                <div>
                                    <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                    {isCreateMode ? (
                                        <div className="flex gap-2">
                                            <select
                                                name="Description"
                                                id="Description"
                                                value={selectedDeductionId}
                                                onChange={(e) => handleDeductionSelect(e.target.value)}
                                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                                required
                                            >
                                                <option value="">Escolha a dedução</option>
                                                {deductionOptions.map((deduction: Deduction) => (
                                                    <option key={deduction.id} value={deduction.id}>{deduction.description}</option>
                                                ))}
                                            </select>
                                            <button
                                                type="button"
                                                onClick={() => setIsNewModalOpen(true)}
                                                className="px-3 py-2.5 text-sm font-medium text-white bg-blue-700 hover:bg-blue-800 rounded-lg transition-colors shrink-0"
                                                title="Cadastrar nova dedução"
                                            >
                                                +
                                            </button>
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            name="Description"
                                            id="Description"
                                            value={description}
                                            onChange={handleChange}
                                            disabled={isViewOnly}
                                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                                            placeholder="Descrição da dedução"
                                            required
                                        />
                                    )}
                                </div>
                                <div>
                                    <label htmlFor="Amount" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Valor</label>
                                    <input 
                                        type="text" 
                                        name="Amount"
                                        id="Amount" 
                                        value={amount}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="0,00" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="DateEnd" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data</label>
                                    <input
                                        type="date"
                                        name="DateEnd"
                                        id="DateEnd"
                                        value={dateEnd}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="Periodicity" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Periodicidade</label>
                                    <select
                                        name="Periodicity"
                                        id="Periodicity"
                                        value={periodicity}
                                        onChange={handleChange}
                                        disabled={isViewOnly || isCreateMode}
                                        required
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                    >
                                        <option value="MENSAL">Mensal</option>
                                        <option value="SEMESTRAL">Semestral</option>
                                        <option value="ANUAL">Anual</option>
                                    </select>
                                </div>
                                {!isViewOnly && (    
                                    <button 
                                        type="submit" 
                                        className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                        {buttonText}
                                    </button>
                                )}
                            </form>
                        </div>
                    </div>
            </div>

            <ModalDeductionNew
                isOpen={isNewModalOpen}
                onClose={() => setIsNewModalOpen(false)}
                onCreated={() => {
                    setIsNewModalOpen(false);
                    onCardAction();
                }}
            />
        </div>
    );
};

export default ModalDeduction;