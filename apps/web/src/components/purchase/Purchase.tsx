import { useEffect, useState, useCallback, useMemo } from "react";
import { getPurchases, deletePurchase, type Purchase } from "@/services/purchase";
import { getPurchasesInstallments, payInstallment, type Installment } from "@/services/installment";
import {
  formatBRL,
  formatDateBR,
  getCurrentMonth,
  extractErrorMessage,
} from "@cointrack/utils";
import {
  Eye,
  Layers,
  Pencil,
  Trash2,
  Wallet,
  Plus,
  ShoppingCart,
  Search,
} from "lucide-react";
import { useToast } from "@/contexts/ToastContext";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  MonthNavigator,
  PageHeader,
  Pagination,
  TableSkeleton,
} from "@/components/ui";
import ModalPurchase from "./ModalPurchase";
import ModalInstallments from "../installment/ModalInstallment";

function Purchase() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [purchaseId, setPurchaseId] = useState<string | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedPurchaseInstallments, setSelectedPurchaseInstallments] = useState<Installment[]>([]);
  const [selectedPurchaseIsCreditCard, setSelectedPurchaseIsCreditCard] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setPurchaseId(null);
  };

  const fetchData = useCallback(
    async (targetPage: number = 1) => {
      setLoading(true);
      setError(null);

      try {
        const data = await getPurchases(currentMonth, targetPage, 20);
        const msg = data?.message;
        if (msg && typeof msg === "object" && !Array.isArray(msg) && "responses" in msg) {
          setPurchases(msg.responses);
          setPage(msg.page);
          setTotalPages(msg.total_pages);
          setTotal(msg.total ?? 0);
        } else if (msg && Array.isArray(msg)) {
          setPurchases(msg);
          setPage(1);
          setTotalPages(1);
          setTotal(msg.reduce((sum, purchase) => sum + (purchase.amount ?? 0), 0));
        } else {
          setPurchases([]);
          setTotal(0);
        }
      } catch (err) {
        setError(extractErrorMessage(err, "Erro desconhecido ao carregar compras."));
        setPurchases([]);
      } finally {
        setLoading(false);
      }
    },
    [currentMonth]
  );

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const filteredPurchases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return purchases;
    return purchases.filter(
      (p) =>
        p.description?.toLowerCase().includes(q) ||
        p.place?.toLowerCase().includes(q) ||
        p.person?.toLowerCase().includes(q)
    );
  }, [purchases, searchQuery]);

  const handleInstallments = async (id: string) => {
    try {
      setPurchaseId(id);
      const purchase = purchases.find((p) => p.id === id);
      setSelectedPurchaseIsCreditCard(!!purchase?.credit_card_id);
      const response = await getPurchasesInstallments(id);
      setSelectedPurchaseInstallments(
        Array.isArray(response.message) ? response.message : [response.message]
      );
      setIsInstallmentModalOpen(true);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao carregar parcelas."));
    }
  };

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await payInstallment(installmentId);
      setIsInstallmentModalOpen(false);
      setPurchaseId(null);
      setSelectedPurchaseInstallments([]);
      toast.success("Parcela paga com sucesso!");
      await fetchData(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao processar pagamento."));
      throw err;
    }
  };

  const handleView = (id: string) => {
    setPurchaseId(id);
    setIsUpdate(false);
    openModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deletePurchase(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Compra excluída com sucesso.");
      await fetchData(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao deletar a compra."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setPurchaseId(null);
    setIsUpdate(false);
    openModal();
  };

  const isEmpty = !loading && !error && filteredPurchases.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Compras"
        subtitle="Gerencie compras à vista, parceladas e financiamentos"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Nova Compra
          </Button>
        }
      />

      {/* Toolbar: Total + Search + Month */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
          <Card padding="sm" className="inline-flex items-center gap-3 min-w-[200px]">
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
              <ShoppingCart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs font-medium text-muted">Total do mês</p>
              <p className="text-lg font-bold text-foreground tabular-nums">
                {formatBRL(total)}
              </p>
            </div>
          </Card>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-muted-light absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por descrição, local ou pessoa..."
              className="w-full pl-10 pr-3.5 py-2.5 text-sm rounded-xl border border-border bg-card text-foreground placeholder:text-muted-light focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
          </div>
        </div>

        <MonthNavigator
          value={currentMonth}
          onChange={setCurrentMonth}
          disableFuture
        />
      </div>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={6} columns={7} />}

      {isEmpty && (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8" />}
          title={
            searchQuery
              ? "Nenhuma compra encontrada para a busca"
              : "Nenhuma compra cadastrada"
          }
          description={
            searchQuery
              ? "Tente limpar o filtro ou buscar por outro termo."
              : "Registre sua primeira compra neste mês para acompanhar seus gastos."
          }
          action={
            !searchQuery && (
              <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
                Nova Compra
              </Button>
            )
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
                    Pessoa
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Descrição
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Local
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Valor
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Data
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Parcelas
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPurchases.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.person}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {item.description || "-"}
                    </td>
                    <td className="px-6 py-4 text-muted">{item.place || "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground tabular-nums">
                      {formatBRL(item.amount)}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      {formatDateBR(item.date)}
                    </td>
                    <td className="px-6 py-4">
                      {item.installment_info ? (
                        <Badge variant="info">{item.installment_info}</Badge>
                      ) : (
                        <Badge variant="neutral">À vista</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="view"
                          onClick={() => handleView(item.id)}
                          title="Visualizar detalhes"
                          aria-label="Visualizar detalhes"
                        >
                          <Eye size={16} />
                        </IconButton>

                        <IconButton
                          tone="accent"
                          onClick={() => handleInstallments(item.id)}
                          disabled={item.installment_number < 2}
                          title={
                            item.installment_number < 2
                              ? "Compra à vista"
                              : "Ver parcelas"
                          }
                          aria-label="Ver parcelas"
                        >
                          <Layers size={16} />
                        </IconButton>

                        {item.payment_type?.toLowerCase().includes("financiamento") &&
                          item.installment_id && (
                            <>
                              {item.paid ? (
                                <Badge variant="success">Pago</Badge>
                              ) : (
                                <IconButton
                                  tone="pay"
                                  onClick={() =>
                                    handlePayInstallment(item.installment_id!)
                                  }
                                  title="Pagar parcela"
                                  aria-label="Pagar parcela"
                                >
                                  <Wallet size={16} />
                                </IconButton>
                              )}
                            </>
                          )}

                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setPurchaseId(item.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar compra"
                          aria-label="Editar compra"
                        >
                          <Pencil size={16} />
                        </IconButton>

                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Excluir compra"
                          aria-label="Excluir compra"
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

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(next) => fetchData(next)}
          />
        </Card>
      )}

      <ModalPurchase
        isOpen={isModalOpen}
        onClose={closeModal}
        onPurchaseAction={() => fetchData(page)}
        isUpdate={isUpdate}
        purchaseId={purchaseId}
      />

      <ModalInstallments
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        installments={selectedPurchaseInstallments || []}
        onPay={handlePayInstallment}
        isCreditCardPurchase={selectedPurchaseIsCreditCard}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir compra"
        description="Tem certeza que deseja excluir esta compra? Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default Purchase;
