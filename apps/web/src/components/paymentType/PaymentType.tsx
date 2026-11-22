import { useState, useEffect, useCallback } from "react";
import ModalPaymentType from "./ModalPaymentType";
import {
  deletePaymentType,
  getPaymentTypes,
  type PaymentTypesResponse,
} from "@/services/paymentType";
import { extractErrorMessage } from "@cointrack/utils";
import { useToast } from "@/contexts/ToastContext";
import { Pencil, Trash2, Plus, Wallet } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  PageHeader,
  TableSkeleton,
} from "@/components/ui";

function PaymentType() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [paymentTypes, setPaymentTypes] = useState<PaymentTypesResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [paymentTypeId, setPaymentTypeId] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getPaymentTypes();
      if (data) {
        setPaymentTypes(data);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar tipos de pagamento."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePaymentType = () => {
    fetchData();
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deletePaymentType(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Tipo de pagamento excluído com sucesso.");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao excluir tipo de pagamento."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setPaymentTypeId("");
    setIsUpdate(false);
    openModal();
  };

  const list = Array.isArray(paymentTypes?.message) ? paymentTypes.message : [];
  const isEmpty = !loading && !error && list.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tipos de Pagamento"
        subtitle="Gerencie as formas de pagamento disponíveis nas compras e despesas"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Novo Tipo
          </Button>
        }
      />

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={3} />}

      {isEmpty && (
        <EmptyState
          icon={<Wallet className="w-8 h-8" />}
          title="Nenhum tipo de pagamento cadastrado"
          description="Adicione formas como Pix, Débito, Crédito ou Dinheiro."
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
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Modalidade
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
                      {item.name}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          item.spot_payment === 0
                            ? "success"
                            : item.spot_payment === 1
                            ? "info"
                            : "primary"
                        }
                      >
                        {item.spot_payment === 0
                          ? "À vista"
                          : item.spot_payment === 1
                          ? "Parcelado"
                          : "Ambos"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setPaymentTypeId(item.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar tipo de pagamento"
                          aria-label="Editar tipo de pagamento"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Excluir tipo de pagamento"
                          aria-label="Excluir tipo de pagamento"
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

      <ModalPaymentType
        isOpen={isModalOpen}
        onClose={closeModal}
        onPaymentTypeAction={handlePaymentType}
        isUpdate={isUpdate}
        paymentTypeId={isUpdate ? paymentTypeId : ""}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir tipo de pagamento"
        description="Tem certeza que deseja excluir este tipo de pagamento?"
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default PaymentType;
