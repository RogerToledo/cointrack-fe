import { useState, useEffect, useCallback } from "react";
import {
  getCreditCards,
  deleteCreditCard,
  CreditCardsResponse,
} from "@/services/creditCard";
import { extractErrorMessage } from "@cointrack/utils";
import { useToast } from "@/contexts/ToastContext";
import ModalCreditCard from "./ModalCreditCard";
import { Pencil, Trash2, Plus, CreditCard as CreditCardIcon } from "lucide-react";
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

function CreditCard() {
  const toast = useToast();
  const [creditCards, setCreditCards] = useState<CreditCardsResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [creditCardId, setCreditCardId] = useState<string>("");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getCreditCards();
      if (data) {
        setCreditCards(data);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar cartões de crédito."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreditCard = async () => {
    await fetchData();
    closeModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteCreditCard(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Cartão de crédito excluído com sucesso.");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao deletar cartão de crédito."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setCreditCardId("");
    setIsUpdate(false);
    openModal();
  };

  const list = Array.isArray(creditCards?.message) ? creditCards.message : [];
  const isEmpty = !loading && !error && list.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Cartões de Crédito"
        subtitle="Gerencie cartões físicos, virtuais e datas de fatura"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Novo Cartão
          </Button>
        }
      />

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={7} />}

      {isEmpty && (
        <EmptyState
          icon={<CreditCardIcon className="w-8 h-8" />}
          title="Nenhum cartão cadastrado"
          description="Comece adicionando seu primeiro cartão de crédito para acompanhar faturas e compras."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Novo Cartão
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
                    Nome / Tipo
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Final
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Cartão Físico
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Fechamento
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Vencimento
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((card) => (
                  <tr
                    key={card.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {card.owner}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {card.card_name || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="primary" className="font-mono">
                        •••• {card.final_card_num}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      {card.physical_card_last4 ? (
                        <Badge variant="info" className="font-mono">
                          •••• {card.physical_card_last4}
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted">Principal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      Dia {card.invoice_closing_day}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      Dia {card.due_date}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setCreditCardId(card.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar cartão"
                          aria-label="Editar cartão"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(card.id)}
                          title="Excluir cartão"
                          aria-label="Excluir cartão"
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

      <ModalCreditCard
        isOpen={isModalOpen}
        onClose={closeModal}
        onCardAction={handleCreditCard}
        isUpdate={isUpdate}
        creditCardId={creditCardId}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir cartão de crédito"
        description="Tem certeza que deseja excluir este cartão de crédito? Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default CreditCard;
