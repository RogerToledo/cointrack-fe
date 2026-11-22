import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getEarnings, deleteEarning, Earning } from "@/services/earning";
import { useAuth } from "@/contexts/AuthContext";
import { useFamily } from "@/contexts/FamilyContext";
import { useToast } from "@/contexts/ToastContext";
import { extractErrorMessage, logApiError } from "@cointrack/utils";
import { CircleDollarSign, Eye, Pencil, Trash2, Plus } from "lucide-react";
import ModalEarningDefinition from "./ModalEarningDefinition";
import ModalConfirmDelete from "@/components/common/ModalConfirmDelete";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  PageHeader,
  TableSkeleton,
  inputBaseClasses,
} from "@/components/ui";

function Earnings() {
  const toast = useToast();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [ownerFilter, setOwnerFilter] = useState("");
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
      return selectedFamily.members.map((m) => ({
        id: m.person_id,
        name: m.person_name,
      }));
    }
    return user ? [{ id: user.id, name: user.name }] : [];
  }, [selectedFamily?.members, user]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getEarnings(undefined, undefined, ownerFilter || undefined);
      if (data && Array.isArray(data.message)) {
        setEarnings(data.message);
      } else {
        setEarnings([]);
      }
    } catch (err) {
      logApiError("getEarnings (tela de ganhos)", err);
      setError(
        extractErrorMessage(err, "Ocorreu um erro inesperado ao carregar os ganhos.")
      );
    } finally {
      setLoading(false);
    }
  }, [ownerFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
  };

  const handleView = (id: string) => {
    setEarningId(id);
    setIsUpdate(false);
    setIsModalOpen(true);
  };

  const handleEdit = (id: string) => {
    setEarningId(id);
    setIsUpdate(true);
    setIsModalOpen(true);
  };

  const handleDelete = async (keepHistory: boolean) => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await deleteEarning(deleteTargetId, keepHistory);
      setDeleteTargetId(null);
      toast.success("Fonte de ganho excluída com sucesso.");
      await fetchData();
    } catch (err) {
      logApiError("deleteEarning (tela de ganhos)", err);
      toast.error(extractErrorMessage(err, "Ocorreu um erro inesperado."));
    } finally {
      setIsDeleting(false);
    }
  };

  const isEmpty = !loading && !error && earnings.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ganhos"
        subtitle="Gerencie todas as fontes de receita cadastradas"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
            Novo Ganho
          </Button>
        }
      />

      {/* Segmented Tabs + Owner Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border w-fit">
          <Link
            href="/earning"
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            Registros do Mês
          </Link>
          <Link
            href="/earnings"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white shadow-xs"
          >
            Fontes de Ganho
          </Link>
        </div>

        <div className="w-full sm:w-56">
          <label htmlFor="OwnerFilter" className="sr-only">
            Filtrar por usuário
          </label>
          <select
            id="OwnerFilter"
            value={ownerFilter}
            onChange={(e) => setOwnerFilter(e.target.value)}
            className={inputBaseClasses}
          >
            <option value="">Todos os usuários</option>
            {ownerList.map((owner) => (
              <option key={owner.id} value={owner.id}>
                {owner.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={4} />}

      {isEmpty && (
        <EmptyState
          icon={<CircleDollarSign className="w-8 h-8" />}
          iconBg="success"
          title="Nenhum ganho cadastrado"
          description="Nenhum ganho encontrado para o filtro selecionado."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleCreate}>
              Novo Ganho
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
                    Proprietário
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Descrição
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Periodicidade
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {earnings.map((earning) => (
                  <tr
                    key={earning.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {earning.personName || "-"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {earning.description}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{earning.periodicity}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="view"
                          onClick={() => handleView(earning.id)}
                          title="Visualizar detalhes"
                          aria-label="Visualizar detalhes"
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          tone="edit"
                          onClick={() => handleEdit(earning.id)}
                          title="Editar ganho"
                          aria-label="Editar ganho"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(earning.id)}
                          title="Excluir ganho"
                          aria-label="Excluir ganho"
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
        message="Tem certeza que deseja excluir este ganho?"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Earnings;
