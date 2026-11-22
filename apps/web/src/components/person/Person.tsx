import { useState, useEffect, useCallback } from "react";
import ModalPerson from "./ModalPerson";
import { Pencil, Trash2, Plus, Users } from "lucide-react";
import {
  deletePerson,
  type Person as PersonType,
  type PersonResponse,
} from "@/services/person";
import { useFamily } from "@/contexts/FamilyContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { extractErrorMessage } from "@cointrack/utils";
import {
  Alert,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  PageHeader,
  TableSkeleton,
} from "@/components/ui";

function Person() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [persons, setPersons] = useState<PersonResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [personId, setPersonId] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedFamily } = useFamily();
  const { user } = useAuth();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      if (selectedFamily?.members && selectedFamily.members.length > 0) {
        const familyPersons: PersonType[] = selectedFamily.members.map(
          (member) => ({
            id: member.person_id,
            name: member.person_name,
          })
        );
        setPersons({ message: familyPersons, statusCode: 200 });
      } else if (user) {
        setPersons({
          message: [{ id: user.id, name: user.name }],
          statusCode: 200,
        });
      } else {
        setPersons({ message: [], statusCode: 200 });
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar pessoas."));
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
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deletePerson(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Pessoa excluída com sucesso.");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao deletar pessoa."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setPersonId("");
    setIsUpdate(false);
    openModal();
  };

  const list = Array.isArray(persons?.message) ? persons.message : [];
  const isEmpty = !loading && !error && list.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pessoas"
        subtitle="Gerencie as pessoas vinculadas à conta"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Nova Pessoa
          </Button>
        }
      />

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={4} columns={2} />}

      {isEmpty && (
        <EmptyState
          icon={<Users className="w-8 h-8" />}
          title="Nenhuma pessoa cadastrada"
          description="Adicione pessoas para associar compras, ganhos e cartões."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Nova Pessoa
            </Button>
          }
        />
      )}

      {!isEmpty && !loading && !error && (
        <Card padding="none" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/80">
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Nome
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((person) => (
                  <tr
                    key={person.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary-light text-primary flex items-center justify-center text-xs font-bold">
                          {person.name?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <span>{person.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setPersonId(person.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar pessoa"
                          aria-label="Editar pessoa"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(person.id)}
                          title="Excluir pessoa"
                          aria-label="Excluir pessoa"
                        >
                          <Trash2 size={16} />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ModalPerson
        isOpen={isModalOpen}
        onClose={closeModal}
        onPersonAction={handlePerson}
        isUpdate={isUpdate}
        personId={isUpdate ? personId : ""}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir pessoa"
        description="Tem certeza que deseja excluir esta pessoa?"
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default Person;
