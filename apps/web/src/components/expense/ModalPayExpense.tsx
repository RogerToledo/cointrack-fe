// ModalPayExpense.tsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';

interface PayModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (id: string, amount: number, date: string) => void;
    expenseId: string;
}

const ModalPayExpense: React.FC<PayModalProps> = ({ isOpen, onClose, onConfirm, expenseId }) => {
    const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
    const [payAmount, setPayAmount] = useState('');
    const [success, setSuccess] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);


    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setSuccess(null);
            setPayAmount('');
        }
    }, [isOpen]);

const handleConfirmClick = async () => {
    setError(null);
    setSuccess(null);

    const amountFloat = parseFloat(String(payAmount).replace(',', '.'));
    if (isNaN(amountFloat) || amountFloat <= 0) {
        setError("Informe um valor válido.");
        return;
    }

    try {
        await onConfirm(expenseId, amountFloat, payDate);
        
        setSuccess("Pagamento realizado com sucesso!");

        setTimeout(() => {
            onClose();
            setSuccess(null);
        }, 3000);

    } catch (err) {
        if (axios.isAxiosError(err)) {
            setError(err.response?.data?.message || "Erro ao processar pagamento.");
        } else {
            setError("Erro inesperado ao processar pagamento.");
        }
    }
};
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative p-4 w-full max-w-3xl max-h-full">
                <div className="relative bg-white rounded-lg shadow-sm dark:bg-gray-700">
                    
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600 border-gray-200">
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            Pagamento da Despesa
                        </h3>
                        <button type="button" onClick={onClose} className="...">✕</button>
                    </div>

                    <div className="p-4 md:p-5">
                        {/* Alerta de Sucesso */}
                        {success && (
                            <div className="p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
                                {success}
                            </div>
                        )}

                        {/* Alerta de Erro - AGORA VAI FUNCIONAR */}
                        {error && (
                            <div className="p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Data do Pagamento</label>
                                <input className="border text-sm rounded-lg block w-full p-2.5 dark:text-white " type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
                            </div>
                            <div className="flex-1">
                                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Valor Pago</label>
                                <input 
                                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white" 
                                    type="text" 
                                    value={payAmount} 
                                    onChange={(e) => setPayAmount(e.target.value)} 
                                    placeholder="0,00"
                                />
                            </div>
                        </div>

                        {/* Botão chamando a nova função local */}
                        <button 
                            onClick={handleConfirmClick}
                            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700 mt-6"
                        >
                            Confirmar Pagamento
                        </button>
                    </div>
                </div>
            </div>
        </div>       
    );
};

export default ModalPayExpense;