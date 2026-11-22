import { useEffect, useState, useCallback } from "react";
import ModalPurchaseType from "./ModalPurchaseType";
import {
  deletePurchaseType,
  getPurchaseTypes,
  type PurchaseTypesResponse,
} from "@/services/purchaseType";
import { extractErrorMessage } from "@cointrack/utils";
import { useToast } from "@/contexts/ToastContext";
import { Pencil, Trash2, Plus, Tag } from "lucide-react";
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

function PurchaseType() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseTypes, setPurchaseTypes] = useState<PurchaseTypesResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [purchaseTypeId, setPurchaseTypeId] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPurchaseTypes();
      setPurchaseTypes(data);
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar tipos de compra."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePurchaseType = async () => {
    await fetchData();
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await deletePurchaseType(deleteTargetId);
      setPurchaseTypes((prev) => ({
        ...prev,
        message: prev.message.filter((item) => item.id !== deleteTargetId),
      }));
      setDeleteTargetId(null);
      toast.success("Tipo de compra excluído com sucesso.");
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao excluir tipo de compra."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setIsUpdate(false);
    setPurchaseTypeId("");
    openModal();
  };

  const list = Array.isArray(purchaseTypes?.message) ? purchaseTypes.message : [];
  const isEmpty = !loading && !error && list.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Compra"
        subtitle="Categorize suas compras para análises mais precisas no dashboard"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Novo Tipo
          </Button>
        }
      />

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={2} />}

      {isEmpty && (
        <EmptyState
          icon={<Tag className="w-8 h-8" />}
          title="Nenhum tipo de compra cadastrado"
          description="Crie categorias como Alimentação, Transporte ou Lazer para organizar suas compras."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Novo Tipo
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
                {list.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <div className="flex items-center gap-2.5">
                        <span className="w-2 h-2 rounded-full bg-accent" />
                        {item.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setPurchaseTypeId(item.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar tipo de compra"
                          aria-label="Editar tipo de compra"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Excluir tipo de compra"
                          aria-label="Excluir tipo de compra"
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

      <ModalPurchaseType
        isOpen={isModalOpen}
        onClose={closeModal}
        onPurchaseTypeAction={handlePurchaseType}
        isUpdate={isUpdate}
        purchaseTypeId={isUpdate ? purchaseTypeId : ""}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir tipo de compra"
        description="Tem certeza que deseja excluir este tipo de compra?"
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default PurchaseType;
