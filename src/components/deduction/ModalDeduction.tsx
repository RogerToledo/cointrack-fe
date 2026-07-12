import { createDeduction, getDeductionById, updateDeduction } from '@/services/deduction';
import { getEarnings, EarningsResponse, Earning } from '@/services/earning';
import axios from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCardAction: () => void;
    isUpdate: boolean;
    deductionId: string;
}

const ModalDeduction: React.FC<ModalProps> = ({ isOpen, onClose, onCardAction, isUpdate, deductionId}) => {
    const [buttonText, setButtonText] = useState("Adicionar nova dedução"); 
    const [earningList, setEarningList] = useState<EarningsResponse>({ 
        message: [],
        statusCode: 0});
    const [selectedPersonId, setSelectedPersonId] = useState('');
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [dateEnd, setDateEnd] = useState('');
    const [active, setActive] = useState(false);
    const [fixed, setFixed] = useState(false);
    const [earningId, setEarningId] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

     const isViewOnly = !isUpdate && deductionId !== "";

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
            const earningResponse = await getEarnings();
            if (earningResponse && Array.isArray(earningResponse.message)) {
                setEarningList(earningResponse);
            } else {
                setEarningList({ message: [], statusCode: 200 });
            }

            if (deductionId && deductionId !== "" && (isUpdate || isViewOnly)) {
                setButtonText("Atualizar Dedução");

                const deductionResponse = await getDeductionById(deductionId);
                const deductionData = deductionResponse.message;
                const dateFormatted = deductionData.date_end ? deductionData.date_end.split('T')[0] : '';

                setEarningId(deductionData.earning_id || '');

                // pré-selecionar o proprietário com base no ganho carregado
                const matchedEarning = (earningResponse?.message || []).find(
                    (e: Earning) => e.id === deductionData.earning_id
                );
                if (matchedEarning) setSelectedPersonId(matchedEarning.person_id);

                setDescription(deductionData.description);
                setAmount(deductionData.amount?.toString() || '');
                setDateEnd(dateFormatted);
                setActive(deductionData.active);
                setFixed(deductionData.fixed);
            } else {
                setButtonText("Adicionar nova dedução");
                setEarningId("");
                setSelectedPersonId("");
                setDescription("");
                setAmount('');
                setDateEnd("");
                setActive(false);
                setFixed(false);
            }
        } catch (error) {
            setError("Falha ao carregar informações do servidor.");
            console.error(error);
        }
    };
    loadInitialData();
}, [isOpen, isUpdate, deductionId, isViewOnly]);

        
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const amountFloat = parseFloat(String(amount).replace(',', '.'));

            if (isUpdate) {
                await updateDeduction(deductionId, description, amountFloat, active, fixed, dateEnd, earningId);
                setSuccess("Dedução atualizada com sucesso!");
            } else {
                await createDeduction(description, amountFloat, active, fixed, dateEnd, earningId);
                setSuccess("Dedução criada com sucesso!");
            }

            setTimeout(() => {
                onCardAction();;
                onClose();
            }, 3000);  
        } catch (err) {
            console.error("Error creating deduction", err);

            if (axios.isAxiosError(err)) {
                const apiMessage = err.response?.data?.message;
                setError(apiMessage || "Ocorreu um erro inesperado.");
            } else {
                setError("Ocorreu um erro inesperado");
            }
        }
    }

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
            case 'Fixed':
                setFixed(value === 'true');
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
                                        disabled={isViewOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o proprietário</option>
                                        {Array.from(
                                            new Map(
                                                (earningList.message || []).map((e: Earning) => [e.person_id, e.person_name])
                                            ).entries()
                                        ).map(([personId, personName]) => (
                                            <option key={personId} value={personId}>{personName}</option>
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
                                        disabled={isViewOnly || !selectedPersonId}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o ganho</option>
                                        {(earningList.message || [])
                                            .filter((e: Earning) => e.person_id === selectedPersonId)
                                            .map((earning: Earning) => (
                                                <option key={earning.id} value={earning.id}>{earning.description}</option>
                                            ))}
                                    </select>    
                                </div>
                                <div>
                                    <label htmlFor="Description" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Descrição</label>
                                    <input 
                                        type="text" 
                                        name="Description"
                                        id="Description" 
                                        value={description}
                                        onChange={handleChange}
                                        disabled={isViewOnly}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="Descrição da dedução" 
                                        required 
                                    />
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
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    />
                                </div>
                                <div className='flex gap-10 items-start'>
                                    <div>
                                        <label htmlFor="Active" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Ativo</label>
                                        <input 
                                            checked={active}
                                            onChange={(e) => setActive(e.target.checked)}
                                            type="checkbox"
                                            name="Active" 
                                            id="Active" 
                                            disabled={isViewOnly}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="Fixed" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Fixo</label>
                                        <input 
                                            checked={fixed}
                                            onChange={(e) => setFixed(e.target.checked)}
                                            type="checkbox"
                                            name="Fixed" 
                                            id="Fixed" 
                                            disabled={isViewOnly}
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" 
                                        />
                                    </div>
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
        </div>
    );
};

export default ModalDeduction;