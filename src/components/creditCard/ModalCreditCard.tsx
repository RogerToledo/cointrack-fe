import { createCreditCard, getCreditCard, updateCreditCard } from '@/services/creditCard';
import { Person, getPerson } from '@/services/person';
import axios from 'axios';
import { useState, useEffect } from 'react';
import React from 'react';

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
    const [ownerList, setOwnerList] = useState<Person[]>([]);
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    
    useEffect(() => {
        const loadInitialData = async () => {
            setSuccess(null);
            setError(null);

            if (isOpen) {
                try {
                    const ownerResponse = await getPerson();
                    const meUser = ownerResponse.message?.user;
                    const owners: Person[] = meUser ? [{ id: meUser.id, name: meUser.name }] : [];
                    setOwnerList(owners);

                    if (isUpdate && creditCardId) {
                        setTitle("Atualização do Cartão de Crédito");
                        setButtonText("Atualizar Cartão de Crédito");

                        const cardResponse = await getCreditCard(creditCardId);
                        const cardData = cardResponse.message;

                        console.log("Dono que veio no Cartão:", cardData.owner_id || cardData.owner);

                        const ownerId = cardData.owner_id
                        setCardOwner(ownerId);
                        setFinalCardNum(cardData.final_card_num);
                        setType(cardData.type);
                        setInvoiceCloseDay(cardData.invoice_closing_day);
                    } else {
                        setTitle("Cadastro de Cartão de Crédito");
                        setButtonText("Adicionar novo cartão de crédito");
                        setCardOwner("");
                        setFinalCardNum("");
                        setType("");
                        setInvoiceCloseDay(0);
                        setDueDate(0);
                    }
                } catch (error) {
                    console.error("Error fetching card owners", error);
                    setError("Falha ao carregar informações do servidor.");
                }              
            }
        };
        loadInitialData();
    }, [isOpen, isUpdate, creditCardId]);

        
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!cardOwner || cardOwner === "" || cardOwner === "00000000-0000-0000-0000-000000000000") {
            setError("Por favor, selecione um proprietário válido.");
            return;
        }

        try {
            if (isUpdate) {
                await updateCreditCard(creditCardId, cardOwner, finalCardNum, type, invoiceCloseDay, dueDate);
                setSuccess("Cartão de crédito atualizado com sucesso!");
            } else {
                console.log("Criando cartão com os dados:", { cardOwner, finalCardNum, type, invoiceCloseDay });
                await createCreditCard(cardOwner, finalCardNum, type, invoiceCloseDay, dueDate);
                setSuccess("Cartão de crédito criado com sucesso!");
            }

            setTimeout(() => {
                onCardAction();;
                onClose();
            }, 3000);  
        } catch (err) {
            console.error("Error creating credit card", err);

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
            case 'Owner':
                setCardOwner(value);
                break;
            case 'FinalCardNum':
                setFinalCardNum(value);
                break;
            case 'Type':
                setType(value);
                break;
            case 'InvoiceClosingDay':
                setInvoiceCloseDay(Number(value));
                break;
            case 'DueDate':
                setDueDate(Number(value));
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
                                {title}
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
                                    <label htmlFor="Owner" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Proprietário</label>
                                    <select 
                                        name="Owner" 
                                        id="Owner"
                                        value={cardOwner}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white"
                                        required
                                    >
                                        <option value="">Escolha o proprietário do cartão</option>
                                        {ownerList.map((owner) => (
                                            <option key={owner.id} value={owner.id}>{owner.name}</option>
                                        ))}
                                    </select>    
                                </div>
                                <div>
                                    <label htmlFor="FinalCardNum" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Final do Cartão</label>
                                    <input 
                                        type="text" 
                                        name="FinalCardNum"
                                        id="FinalCardNum" 
                                        value={finalCardNum}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="0000" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="Type" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Tipo do Cartão</label>
                                    <select 
                                        value={type}
                                        onChange={(e) => setType(e.target.value)}
                                        name="Type"
                                        id="Type" 
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                    >
                                        <option value="">Escolha o tipo do cartão</option>
                                        <option value="F">Físico</option>
                                        <option value="V">Virtual</option>
                                        <option value="VT">Virtual Temporário</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="InvoiceClosingDay" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dia do Fechamento da Fatura</label>
                                    <input 
                                        type="text" 
                                        name="InvoiceClosingDay" 
                                        id="InvoiceClosingDay" 
                                        value={invoiceCloseDay}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="15" 
                                        required 
                                    />
                                </div>
                                <div>
                                    <label htmlFor="DueDate" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Dia do Vencimento da Fatura</label>
                                    <input 
                                        type="text" 
                                        name="DueDate" 
                                        id="DueDate" 
                                        value={dueDate}
                                        onChange={handleChange}
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                        placeholder="15" 
                                        required 
                                    />
                                </div>
                                <button 
                                    type="submit" 
                                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
                                    {buttonText}
                                </button>
                            </form>
                        </div>
                    </div>
            </div> 
        </div>
    );
};

export default ModalcreditCard;