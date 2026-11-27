import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  getExpenses,
  deleteExpense,
  reCreateExpense,
  payExpense,
  ExpensesResponse,
} from "@/services/expense";
import {
  formatBRL,
  formatDateBR,
  getCurrentMonth,
  parseYearMonth,
  extractErrorMessage,
} from "@cointrack/utils";
import { parseMonthFromQuery } from "@/utils/competence";
import { useToast } from "@/contexts/ToastContext";
import ModalExpense from "./ModalExpense";
import ModalPayExpense from "./ModalPayExpense";
import {
  Eye,
  Pencil,
  Trash2,
  Wallet,
  Plus,
  Receipt,
  CheckCircle2,
  Clock,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
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
  TableSkeleton,
} from "@/components/ui";

const CREDIT_CARD_LABEL = "cartão de crédito";

type StatusFilter = "all" | "pending" | "paid";

function Expense() {
  const router = useRouter();
  const toast = useToast();
  const [expenses, setExpenses] = useState<ExpensesResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [expenseId, setExpenseId] = useState<string>("");
  const [showRecreateModal, setShowRecreateModal] = useState<boolean>(false);
  const [isRecreating, setIsRecreating] = useState<boolean>(false);
  const [paidExpenseId, setPaidExpenseId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => parseMonthFromQuery(router.query) ?? getCurrentMonth());
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    if (!router.isReady) return;
    const fromQuery = parseMonthFromQuery({
      month: router.query.month,
      year: router.query.year,
    });
    if (fromQuery) {
      setSelectedMonth(fromQuery);
    }
  }, [router.isReady, router.query.month, router.query.year]);

  const openPayModal = (id: string) => {
    setExpenseId(id);
    setIsPayModalOpen(true);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [year, month] = parseYearMonth(selectedMonth);
      const expenseData = await getExpenses(year, month);

      if (expenseData && Array.isArray(expenseData.message)) {
        setExpenses(expenseData);
      } else if (expenseData?.message && !Array.isArray(expenseData.message)) {
        setExpenses({ message: [expenseData.message], statusCode: expenseData.statusCode });
      } else {
        setExpenses({ message: [], statusCode: 200 });
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar despesas."));
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isExpensePaid = (expense: ExpensesResponse["message"][number]): boolean => {
    return Boolean(expense.paid) || Boolean(expense.payment_date);
  };

  const isCreditCard = (expense: ExpensesResponse["message"][number]): boolean => {
    return expense.payment_type?.toLowerCase().includes(CREDIT_CARD_LABEL) ?? false;
  };

  const handleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "amount" ? "desc" : "asc");
    }
  };

  const visibleExpenses = useMemo(() => {
    const [year, month] = parseYearMonth(selectedMonth);
    const list = Array.isArray(expenses?.message) ? expenses.message : [];

    const filtered = list.filter((expense) => {
      if (year !== undefined && month !== undefined) {
        if (!expense.due_date) return false;
        const due = new Date(expense.due_date);
        if (due.getUTCFullYear() !== year || due.getUTCMonth() + 1 !== month) {
          return false;
        }
      }
      if (statusFilter === "paid") return isExpensePaid(expense);
      if (statusFilter === "pending") return !isExpensePaid(expense);
      return true;
    });

    return [...filtered].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "amount") {
        const aVal = a.amount > 0 ? a.amount : a.estimated_amount;
        const bVal = b.amount > 0 ? b.amount : b.estimated_amount;
        return (aVal - bVal) * dir;
      }
      const aDate = a.due_date ? new Date(a.due_date).getTime() : 0;
      const bDate = b.due_date ? new Date(b.due_date).getTime() : 0;
      return (aDate - bDate) * dir;
    });
  }, [expenses, selectedMonth, statusFilter, sortBy, sortOrder]);

  const summary = useMemo(() => {
    const [year, month] = parseYearMonth(selectedMonth);
    const monthExpenses = (Array.isArray(expenses?.message) ? expenses.message : []).filter(
      (expense) => {
        if (year === undefined || month === undefined) return true;
        if (!expense.due_date) return false;
        const due = new Date(expense.due_date);
        return due.getUTCFullYear() === year && due.getUTCMonth() + 1 === month;
      }
    );

    let totalEstimated = 0;
    let totalPaid = 0;
    let pendingCount = 0;

    for (const item of monthExpenses) {
      totalEstimated += item.estimated_amount || item.amount || 0;
      if (isExpensePaid(item)) {
        totalPaid += item.amount || 0;
      } else {
        pendingCount += 1;
      }
    }

    return {
      totalEstimated,
      totalPaid,
      pendingCount,
    };
  }, [expenses, selectedMonth]);

  const handleExpense = async () => {
    await fetchData();
    closeModal();
  };

  const handlePay = async (id: string, amount: number, date: string) => {
    try {
      await payExpense(id, amount, date);
      setIsPayModalOpen(false);
      fetchData();
      setPaidExpenseId(id);
      setShowRecreateModal(true);
    } catch (err) {
      throw err;
    }
  };

  const handleRecreateConfirm = async () => {
    setIsRecreating(true);
    try {
      await reCreateExpense(paidExpenseId);
      await fetchData();
      toast.success("Despesa paga e recorrente recriada com sucesso!");
    } catch (err) {
      toast.error(
        extractErrorMessage(err, "Despesa paga, mas erro ao recriar recorrência.")
      );
    } finally {
      setIsRecreating(false);
      setShowRecreateModal(false);
      setPaidExpenseId("");
    }
  };

  const handleRecreateDecline = () => {
    setShowRecreateModal(false);
    setPaidExpenseId("");
    toast.success("Pagamento registrado com sucesso!");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteExpense(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Despesa excluída com sucesso!");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao excluir despesa."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleView = (id: string) => {
    setExpenseId(id);
    setIsUpdate(false);
    openModal();
  };

  const handleOpenNew = () => {
    setExpenseId("");
    setIsUpdate(false);
    openModal();
  };

  const isEmpty = !loading && !error && visibleExpenses.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Despesas"
        subtitle="Gerencie suas despesas fixas, variáveis e recorrentes"
        actions={
          <Button
            variant="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleOpenNew}
          >
            Nova Despesa
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm">
          <p className="text-xs text-muted uppercase tracking-wide font-medium">
            Previsto no mês
          </p>
          <p className="text-xl font-bold text-foreground tabular-nums mt-0.5">
            {formatBRL(summary.totalEstimated)}
          </p>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide font-medium">
                Total pago
              </p>
              <p className="text-xl font-bold text-emerald-600 tabular-nums mt-0.5">
                {formatBRL(summary.totalPaid)}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </Card>

        <Card padding="sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide font-medium">
                Pendentes
              </p>
              <p className="text-xl font-bold text-amber-600 tabular-nums mt-0.5">
                {summary.pendingCount}
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-border">
          <button
            type="button"
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "all"
                ? "bg-white text-foreground shadow-xs font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Todas
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("pending")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "pending"
                ? "bg-white text-amber-700 shadow-xs font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pendentes
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter("paid")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === "paid"
                ? "bg-white text-emerald-700 shadow-xs font-semibold"
                : "text-muted hover:text-foreground"
            }`}
          >
            Pagas
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
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

          <MonthNavigator value={selectedMonth} onChange={setSelectedMonth} />
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
          icon={<Receipt className="w-8 h-8 text-muted" />}
          title="Nenhuma despesa neste mês"
          description={
            statusFilter !== "all"
              ? "Não encontramos despesas para o filtro selecionado."
              : "Ajuste o mês ou adicione uma nova despesa para acompanhar seus compromissos."
          }
          action={
            <Button
              variant="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleOpenNew}
            >
              Nova Despesa
            </Button>
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
                    Descrição
                  </th>
                  <th className="text-left px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Tipo de Pagamento
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Valor estimado
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
                      Vencimento
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
                    Frequência
                  </th>
                  <th className="text-right px-6 py-4 font-semibold text-foreground text-xs uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {visibleExpenses.map((expense) => {
                  const paid = isExpensePaid(expense);
                  return (
                    <tr
                      key={expense.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-foreground">
                        {expense.description}
                      </td>
                      <td className="px-6 py-4 text-muted">
                        {expense.payment_type || "-"}
                      </td>
                      <td className="px-6 py-4 text-right text-muted tabular-nums">
                        {formatBRL(expense.estimated_amount)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-foreground tabular-nums">
                        {formatBRL(expense.amount)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-muted tabular-nums">
                            {formatDateBR(expense.due_date)}
                          </span>
                          {paid ? (
                            <Badge variant="success" dot>
                              Pago
                            </Badge>
                          ) : (
                            <Badge variant="warning" dot>
                              Pendente
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {expense.frequency ? (
                          <Badge variant="info">
                            {expense.frequency === "monthly"
                              ? "Mensal"
                              : expense.frequency === "yearly"
                              ? "Anual"
                              : expense.frequency === "spot"
                              ? "Única"
                              : expense.frequency}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1">
                          {!isCreditCard(expense) && !paid && (
                            <Button
                              variant="success"
                              size="sm"
                              icon={<Wallet className="w-3.5 h-3.5" />}
                              onClick={() => openPayModal(expense.id)}
                              className="mr-1"
                            >
                              Pagar
                            </Button>
                          )}
                          <IconButton
                            tone="view"
                            onClick={() => handleView(expense.id)}
                            title="Visualizar detalhes"
                            aria-label="Visualizar detalhes"
                          >
                            <Eye size={16} />
                          </IconButton>
                          <IconButton
                            tone="edit"
                            onClick={() => {
                              setExpenseId(expense.id);
                              setIsUpdate(true);
                              openModal();
                            }}
                            title="Editar despesa"
                            aria-label="Editar despesa"
                          >
                            <Pencil size={16} />
                          </IconButton>
                          <IconButton
                            tone="delete"
                            onClick={() => setDeleteTargetId(expense.id)}
                            title="Excluir despesa"
                            aria-label="Excluir despesa"
                          >
                            <Trash2 size={16} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <ModalExpense
        isOpen={isModalOpen}
        onClose={closeModal}
        onCardAction={handleExpense}
        isUpdate={isUpdate}
        expenseId={expenseId}
      />

      <ModalPayExpense
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        onConfirm={handlePay}
        expenseId={expenseId}
      />

      <ConfirmDialog
        isOpen={showRecreateModal}
        onClose={handleRecreateDecline}
        onConfirm={handleRecreateConfirm}
        title="Despesa paga com sucesso!"
        description="Deseja recriar esta despesa como recorrente para o próximo período?"
        confirmLabel="Sim, recriar"
        cancelLabel="Não, obrigado"
        tone="success"
        loading={isRecreating}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir despesa"
        description="Tem certeza que deseja excluir esta despesa? Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default Expense;
