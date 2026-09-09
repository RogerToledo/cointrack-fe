import React, { useState, useEffect } from 'react';
import { Installment } from "@/services/installment";
import { X, CheckCircle } from 'lucide-react';

interface ModalInstallmentsProps {
    isOpen: boolean;
    onClose: () => void;
    installments: Installment[];
    onPay: (installmentId: string) => Promise<void>;
}

const ModalInstallments: React.FC<ModalInstallmentsProps> = ({ isOpen, onClose, installments, onPay }) => {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Limpa alertas ao fechar/abrir o modal
    useEffect(() => {
        if (!isOpen) {
            setError(null);
            setSuccess(null);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const handlePay = async (id: string) => {
        try {
            setError(null);
            
            await onPay(id);
            
            setSuccess("Pagamento registrado com sucesso!");
            
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (err instanceof Error){
                setError(err.message || "Erro ao processar o pagamento.");
            }
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 overflow-hidden">
                
                <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Detalhamento de Parcelas</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-4 max-h-[80vh] overflow-y-auto">
                    
                    {/* Alerta de Sucesso */}
                    {success && (
                        <div className="flex items-center p-4 mb-4 text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400" role="alert">
                            <div className="ms-3 text-sm font-medium">{success}</div>
                            <button onClick={() => setSuccess(null)} className="ms-auto -mx-1.5 -my-1.5 bg-green-50 text-green-500 rounded-lg p-1.5 hover:bg-green-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-green-400 dark:hover:bg-gray-700">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Alerta de Erro */}
                    {error && (
                        <div className="flex items-center p-4 mb-4 text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400" role="alert">
                            <div className="ms-3 text-sm font-medium">{error}</div>
                            <button onClick={() => setError(null)} className="ms-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg p-1.5 hover:bg-red-200 inline-flex items-center justify-center h-8 w-8 dark:bg-gray-800 dark:text-red-400 dark:hover:bg-gray-700">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3">Descrição</th>
                                <th className="px-4 py-3">Vencimento</th>
                                <th className="px-4 py-3 text-right">Valor</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Pagar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {installments.length > 0 ? (
                                installments.map((inst) => (
                                    <tr key={inst.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <td className="px-4 py-3">{inst.description}</td>
                                        <td className="px-4 py-3">{new Date(inst.due_date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                        <td className="px-4 py-3 text-right">{formatCurrency(inst.value)}</td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                inst.paid
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' 
                                                : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                                            }`}>
                                                {inst.paid ? 'Pago' : 'Pendente'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {!inst.paid && (
                                                <button
                                                    onClick={() => handlePay(inst.id)}
                                                    className="text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 transition-transform hover:scale-110"
                                                    title="Marcar como pago"
                                                >
                                                    <CheckCircle size={18} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">Nenhuma parcela encontrada.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default ModalInstallments;