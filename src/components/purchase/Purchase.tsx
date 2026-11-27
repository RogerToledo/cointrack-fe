import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import { getPurchases, deletePurchase, type Purchase } from "@/services/purchase";
import { getPurchasesInstallments, payInstallment, type Installment } from "@/services/installment";
import {
  formatBRL,
  formatDateBR,
  getCurrentMonth,
  extractErrorMessage,
} from "@cointrack/utils";
import { parseMonthFromQuery } from "@/utils/competence";
import {
  Eye,
  Layers,
  Pencil,
  Trash2,
  Wallet,
  Plus,
  ShoppingCart,
  Search,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
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
  const router = useRouter();
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
  const [currentMonth, setCurrentMonth] = useState(() => parseMonthFromQuery(router.query) ?? getCurrentMonth());
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = parseMonthFromQuery({
      month: router.query.month,
      year: router.query.year,
    });
    if (fromQuery) {
      setCurrentMonth(fromQuery);
    }
  }, [router.isReady, router.query.month, router.query.year]);

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
        const data = await getPurchases(currentMonth, targetPage, 20, sortBy, sortOrder);
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
    [currentMonth, sortBy, sortOrder]
  );

  const handleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "amount" ? "desc" : "asc");
    }
  };

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
      toast.success("Compra excluída com sucesso!");
      await fetchData(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao excluir a compra."));
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
        subtitle="Gerencie todas as suas compras e parcelamentos"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenNew}
          >
            Nova Compra
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Card padding="sm" className="inline-flex">
          <div className="px-1">
            <p className="text-xs text-muted uppercase tracking-wide font-medium">
              Total do mês
            </p>
            <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
              {formatBRL(total)}
            </p>
          </div>
        </Card>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar compra..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-border bg-card text-foreground placeholder:text-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>

          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-border">
            <button
              type="button"
              onClick={() => handleSort("date")}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === "date"
                  ? "bg-white text-foreground shadow-xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Data
              {sortBy === "date" ? (
                sortOrder === "asc" ? (
                  <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5" />
                )
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
              )}
            </button>
            <button
              type="button"
              onClick={() => handleSort("amount")}
              className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                sortBy === "amount"
                  ? "bg-white text-foreground shadow-xs font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              Valor
              {sortBy === "amount" ? (
                sortOrder === "asc" ? (
                  <ArrowUp className="w-3.5 h-3.5" />
                ) : (
                  <ArrowDown className="w-3.5 h-3.5" />
                )
              ) : (
                <ArrowUpDown className="w-3.5 h-3.5 opacity-50" />
              )}
            </button>
          </div>

          <MonthNavigator value={currentMonth} onChange={setCurrentMonth} />
        </div>
      </div>

      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {loading && <TableSkeleton rows={5} columns={7} />}

      {isEmpty && (
        <EmptyState
          icon={<ShoppingCart className="w-8 h-8 text-muted" />}
          title={searchQuery ? "Nenhuma compra encontrada" : "Nenhuma compra cadastrada"}
          description={
            searchQuery
              ? "Tente buscar com outros termos."
              : "Registre sua primeira compra para começar a acompanhar seus gastos."
          }
          action={
            searchQuery ? (
              <Button variant="ghost" size="sm" onClick={() => setSearchQuery("")}>
                Limpar busca
              </Button>
            ) : (
              <Button
                variant="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleOpenNew}
              >
                Nova Compra
              </Button>
            )
          }
        />
      )}

      {!isEmpty && !loading && !error && (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-slate-50/50">
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Pessoa
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Descrição
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Local
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort("amount")}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors ml-auto"
                    >
                      Valor
                      {sortBy === "amount" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    <button
                      type="button"
                      onClick={() => handleSort("date")}
                      className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                    >
                      Data
                      {sortBy === "date" ? (
                        sortOrder === "asc" ? (
                          <ArrowUp className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 opacity-40" />
                      )}
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Parcelas
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPurchases.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.person || "-"}
                    </td>
                    <td className="px-6 py-4 text-muted">
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
