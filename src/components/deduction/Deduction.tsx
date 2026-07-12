import { useState, useEffect } from "react";
import { getDeductions, deleteDeduction, DeductionsResponse} from "@/services/deduction";
import { getEarnings, EarningsResponse } from "@/services/earning";
import ModalDeduction from "./ModalDeduction";
import axios from "axios";
import { Eye, Pencil, Trash2} from 'lucide-react';
import Link from 'next/link';

function Deduction() {
    const [deductions, setDeductions] = useState<DeductionsResponse>({
        message: [],
        statusCode: 0
    });
    const [earnings, setEarnings] = useState<EarningsResponse>({
        message: [],
        statusCode: 0
    });
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [deductionId, setDeductionId] = useState<string>("");


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = async () => {
        setError(null);

        try {
            const data = await getDeductions();
            if (data && Array.isArray(data.message)) {
                setDeductions(data);
            } else {
                setDeductions({ message: [], statusCode: 200 });
            }

            const earningsData = await getEarnings();
            console.log(earningsData);
            if (earningsData && Array.isArray(earningsData.message)) {
                setEarnings(earningsData);
            } else {
                setEarnings({ message: [], statusCode: 200 });
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

    const handleDeduction = async() => {
        await fetchData();
        closeModal();
    }

    const handleView = (id: string) => {
        setDeductionId(id);
        setIsUpdate(false);
        openModal();
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta dedução?')) {
            return;
        }
        
        try {
            await deleteDeduction(id)
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
        setDeductionId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !error && (!Array.isArray(deductions?.message) || deductions.message.length === 0);

    return (
        <div>
            <div className="flex items-center mt-5">
                <div className="flex gap-2">
                    <button 
                        type="button" 
                        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 ml-10 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800"
                        onClick={handleOpenNew}
                    >
                        Novo
                    </button> 
                    <Link href="/earning">
                        <button 
                            type="button" 
                            className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 ml-10 dark:bg-red-500 dark:hover:bg-red-700 focus:outline-none dark:focus:ring-red-800"
                            onClick={handleOpenNew}
                        >
                            Ganhos
                        </button> 
                    </Link>    
                </div>    
                <h1 className="text-2xl ml-10 mt-5 mr-10 font-semibold text-gray-900 dark:text-white px-70 flex-1 pr-20">Deduções</h1> 
            </div>

            <div className="relative overflow-x-auto mt-10 ml-10 mr-10 shadow-md sm:rounded-lg">
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
                {isEmpty && (
                    <div className="p-5 text-center text-gray-500 bg-white dark:bg-gray-800">
                        Não existe ganho cadastrado.
                    </div>
                )} 
                {!isEmpty && (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-15 py-3">
                                    Ganho
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Descrição
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Valor
                                </th>
                                <th scope="col" className="px-6 py-3">
                                    Ativo
                                </th>
                                <th scope="col" className="px-0 py-3">
                                    
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {deductions?.message.map((deduction) => (
                                <tr key={deduction.id} className="odd:bg-white odd:dark:bg-gray-900 even:bg-gray-50 even:dark:bg-gray-800 border-b dark:border-gray-700 border-gray-200">
                                    <td className="px-15 py-4">
                                        {(() => {
                                            const earning = earnings.message?.find(e => e.id === deduction.earning_id);
                                            return earning
                                                ? `${earning.person_name} - ${earning.description}`
                                                : '-';
                                        })()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {deduction.description}
                                    </td>
                                    <td className="px-6 py-4">
                                        R$ {deduction.amount}
                                    </td>
                                    <td className="px-6 py-4">
                                        {deduction.active ? 'Sim' : 'Não'}
                                    </td>
                                    <td className="px-6 py-2 text-right">
                                        <button 
                                                onClick={() => handleView(deduction.id)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                title="Visualizar detalhes"
                                        >
                                            <Eye size={18} />
                                        </button>
                                        <button 
                                            type="button"
                                            onClick={ () => {
                                                setDeductionId(deduction.id);
                                                setIsUpdate(true);
                                                openModal();
                                            }}
                                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                            title="Editar desconto"
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={() => {handleDelete(deduction.id)}}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                title="Excluir desconto     "
                                            >
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            <ModalDeduction
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onCardAction={handleDeduction}
                isUpdate={isUpdate}
                deductionId={deductionId}
            />
        </div>
    )
}

export default Deduction;