import { useState, useEffect, useCallback } from "react";
import ModalPerson from "./ModalPerson";
import { Pencil, Trash2, Plus, Users, AlertCircle } from 'lucide-react';
import { 
    deletePerson,
    type Person as PersonType,
    type PersonResponse
} from "@/services/person";
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";

function Person() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [persons, setPersons] = useState<PersonResponse>({
        message: [],
        statusCode: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdate, setIsUpdate] = useState<boolean>(false);
    const [personId, setPersonId] = useState<string>("");
    const { selectedFamily } = useFamily();
    const { user } = useAuth();
    
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (selectedFamily?.members && selectedFamily.members.length > 0) {
                const familyPersons: PersonType[] = selectedFamily.members.map(member => ({
                    id: member.person_id,
                    name: member.person_name
                }));
                setPersons({ message: familyPersons, statusCode: 200 });
            } else if (user) {
                setPersons({ message: [{ id: user.id, name: user.name }], statusCode: 200 });
            } else {
                setPersons({ message: [], statusCode: 200 });
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("An unknown error occurred");
            }
        } finally {
            setLoading(false);
        }
    }, [selectedFamily, user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handlePerson = async () => {
        await fetchData();
        closeModal();
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Tem certeza que deseja deletar esta pessoa?')) {
            return;
        }
        try {
            await deletePerson(id);
            await fetchData();
        } catch (error) {
            console.error(error);
        };
    }

    const handleOpenNew = () => {
        setPersonId("");
        setIsUpdate(false);
        openModal();
    }

    const isEmpty = !loading && !error && (!persons?.message || persons.message.length === 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Pessoas</h1>
                    <p className="text-muted mt-1">Gerencie as pessoas vinculadas</p>
                </div>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 transition-all"
                    onClick={handleOpenNew}
                >
                    <Plus className="w-4 h-4" />
                    Nova Pessoa
                </button>
            </div>

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20" role="alert">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger flex-1">{error}</p>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted">Carregando...</p>
                </div>
            )}

            {/* Empty State */}
            {isEmpty && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma pessoa cadastrada</h3>
                    <p className="text-sm text-muted">Adicione pessoas para vincular às compras e ganhos.</p>
                </div>
            )}

            {/* Table */}
            {!loading && !error && !isEmpty && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Nome</th>
                                    <th className="text-right px-6 py-4 font-semibold text-foreground">Ações</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {persons?.message?.map((message) => (
                                    <tr key={message.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{message.name}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-1">
                                                <button 
                                                    type="button"
                                                    onClick={() => {
                                                        setPersonId(message.id);
                                                        setIsUpdate(true);
                                                        openModal();
                                                    }}
                                                    className="p-2 rounded-lg text-muted hover:text-warning hover:bg-warning-light transition-colors"
                                                    title="Editar Pessoa"
                                                >    
                                                    <Pencil size={16} />
                                                </button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleDelete(message.id)}
                                                    className="p-2 rounded-lg text-muted hover:text-danger hover:bg-danger-light transition-colors"
                                                    title="Deletar Pessoa"
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

            <ModalPerson 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                onPersonAction={handlePerson}
                isUpdate={isUpdate}
                personId={isUpdate ? personId : ""}
            />
        </div>
    );
}

export default Person;
