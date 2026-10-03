import { useCallback, useEffect, useMemo, useState } from "react";
import { getEarnings, deleteEarning, Earning } from "@/services/earning";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { extractErrorMessage, logApiError } from "@/utils/errorMessage";
import { DollarSign, AlertCircle, X, Eye, Pencil, Trash2, Plus } from 'lucide-react';
import Link from 'next/link';
import ModalEarningDefinition from "./ModalEarningDefinition";
import ModalConfirmDelete from "@/components/common/ModalConfirmDelete";

function Earnings() {
    const [earnings, setEarnings] = useState<Earning[]>([]);
    const [ownerFilter, setOwnerFilter] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [earningId, setEarningId] = useState<string>("");
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<boolean>(false);
    const { user } = useAuth();
    const { selectedFamily } = useFamily();

    const ownerList = useMemo(() => {
        if (selectedFamily?.members && selectedFamily.members.length > 0) {
            return selectedFamily.members.map(m => ({ id: m.person_id, name: m.person_name }));
        }
        return user ? [{ id: user.id, name: user.name }] : [];
    }, [selectedFamily?.members, user]);

    // Sem filtro de data: lista todos os ganhos. Com filtro, apenas do usuario escolhido.
    const fetchData = useCallback(async () => {
        setError(null);

        try {
            const data = await getEarnings(undefined, undefined, ownerFilter || undefined);
            if (data && Array.isArray(data.message)) {
                setEarnings(data.message);
            } else {
                setEarnings([]);
            }
        } catch (err) {
            logApiError('getEarnings (tela de ganhos)', err);
            setError(extractErrorMessage(err) || "Ocorreu um erro inesperado ao carregar os ganhos.");
        }
    }, [ownerFilter]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Sem filtro escolhido, mostra os ganhos de quem esta logado.
    useEffect(() => {
        if (!ownerFilter && ownerList.length === 1) {
            setOwnerFilter(ownerList[0].id);
        }
    }, [ownerFilter, ownerList]);

    const closeModal = () => setIsModalOpen(false);

    const handleCreate = () => {
        setEarningId("");
        setIsUpdate(false);
        setIsModalOpen(true);
    }

    const handleView = (id: string) => {
        setEarningId(id);
        setIsUpdate(false);
        setIsModalOpen(true);
    }

    const handleEdit = (id: string) => {
        setEarningId(id);
        setIsUpdate(true);
        setIsModalOpen(true);
    }

    const handleDelete = async (keepHistory: boolean) => {
        if (!deleteTargetId) return;

        setIsDeleting(true);
        try {
            await deleteEarning(deleteTargetId, keepHistory)
            setDeleteTargetId(null);
            await fetchData();
        } catch (err) {
            logApiError('deleteEarning (tela de ganhos)', err);
            setError(extractErrorMessage(err) || "Ocorreu um erro inesperado.");
        } finally {
            setIsDeleting(false);
        }
    }

    const isEmpty = !error && earnings.length === 0;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Ganhos</h1>
                    <p className="text-muted mt-1">Todos os ganhos cadastrados, sem filtro de período</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                        onClick={handleCreate}
                    >
                        <Plus className="w-4 h-4" />
                        Novo Ganho
                    </button>
                    <Link href="/earning">
                        <button
                            type="button"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border bg-card text-sm font-medium text-foreground hover:bg-secondary transition-all"
                        >
                            Registros
                        </button>
                    </Link>
                </div>
            </div>

            {/* Filtro de usuário */}
            <div className="flex items-center justify-end">
                <label htmlFor="OwnerFilter" className="sr-only">Usuário</label>
                <select
                    id="OwnerFilter"
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                    className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                    <option value="">Todos os usuários</option>
                    {ownerList.map((owner) => (
                        <option key={owner.id} value={owner.id}>{owner.name}</option>
                    ))}
                </select>
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
                    <div className="w-16 h-16 rounded-2xl bg-success-light flex items-center justify-center mx-auto mb-4">
                        <DollarSign className="w-8 h-8 text-success" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhum ganho cadastrado</h3>
                    <p className="text-sm text-muted">Nenhum ganho encontrado para o filtro selecionado.</p>
                </div>
            )}

            {/* Table */}
            {!isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Proprietário</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Descrição</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Periodicidade</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {earnings.map((earning) => (
                                    <tr key={earning.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{earning.personName || '-'}</td>
                                        <td className="px-6 py-4 text-muted">{earning.description}</td>
                                        <td className="px-6 py-4 text-muted">{earning.periodicity}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => handleView(earning.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                    title="Visualizar detalhes"
                                                >
                                                    <Eye size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => handleEdit(earning.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar ganho"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setDeleteTargetId(earning.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Excluir ganho"
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

            <ModalEarningDefinition
                isOpen={isModalOpen}
                onClose={closeModal}
                onSaved={fetchData}
                isUpdate={isUpdate}
                earningId={earningId}
            />

            <ModalConfirmDelete
                isOpen={deleteTargetId !== null}
                onClose={() => setDeleteTargetId(null)}
                onConfirm={handleDelete}
                message="Tem certeza que deseja deletar este ganho?"
                isLoading={isDeleting}
            />
        </div>
    )
}

export default Earnings;
