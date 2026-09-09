import { useState, useEffect, useCallback } from "react";
import { getDeductions, deleteDeduction, DeductionsResponse} from "@/services/deduction";
import { getEarnings, EarningsResponse } from "@/services/earning";
import ModalDeduction from "./ModalDeduction";
import axios from "axios";
import { Eye, Pencil, Trash2, Plus, Receipt, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

function getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

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
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = useCallback(async () => {
        setError(null);
        const [year, month] = selectedMonth.split('-').map(Number);

        try {
            const data = await getDeductions(year, month);
            if (data && Array.isArray(data.message)) {
                setDeductions(data);
            } else {
                setDeductions({ message: [], statusCode: 200 });
            }

            const earningsData = await getEarnings(year, month);
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
    }, [selectedMonth]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Deduções</h1>
                    <p className="text-muted mt-1">Gerencie as deduções dos seus ganhos</p>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/earning">
                        <button 
                            type="button" 
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-all"
                        >
                            Ganhos
                        </button>
                    </Link>
                    <button 
                        type="button" 
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                        onClick={handleOpenNew}
                    >
                        <Plus className="w-4 h-4" />
                        Nova Dedução
                    </button>
                </div>
            </div>

            {/* Month Navigator */}
            <div className="flex items-center justify-end gap-2">
                <button
                    onClick={() => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const prev = new Date(year, month - 2, 1);
                        setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
                    }}
                    className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                    aria-label="Mês anterior"
                >
                    <ChevronLeft className="w-4 h-4 text-muted" />
                </button>
                <input
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                    onClick={() => {
                        const [year, month] = selectedMonth.split('-').map(Number);
                        const next = new Date(year, month, 1);
                        setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
                    }}
                    disabled={selectedMonth === getCurrentMonth()}
                    className="p-2 rounded-lg hover:bg-muted/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Próximo mês"
                >
                    <ChevronRight className="w-4 h-4 text-muted" />
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
                        <Receipt className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma dedução cadastrada</h3>
                    <p className="text-sm text-muted">Adicione deduções para calcular seu ganho líquido.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Ganho</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Descrição</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Valor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Ativo</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {deductions?.message.map((deduction) => (
                                    <tr key={deduction.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {(() => {
                                                const earning = earnings.message?.find(e => e.id === deduction.earning_id);
                                                return earning
                                                    ? `${earning.person_name} - ${earning.description}`
                                                    : '-';
                                            })()}
                                        </td>
                                        <td className="px-6 py-4 text-muted">{deduction.description}</td>
                                        <td className="px-6 py-4 font-medium text-danger">R$ {deduction.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                deduction.active 
                                                    ? 'bg-success-light text-success' 
                                                    : 'bg-secondary text-muted'
                                            }`}>
                                                {deduction.active ? 'Sim' : 'Não'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    onClick={() => handleView(deduction.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setDeductionId(deduction.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar desconto"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(deduction.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Excluir desconto"
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
