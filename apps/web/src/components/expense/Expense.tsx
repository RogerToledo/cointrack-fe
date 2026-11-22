import { useState, useEffect, useCallback, useMemo } from "react";
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
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

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

  const visibleExpenses = useMemo(() => {
    const [year, month] = parseYearMonth(selectedMonth);
    const list = Array.isArray(expenses?.message) ? expenses.message : [];

    return list.filter((expense) => {
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
  }, [expenses, selectedMonth, statusFilter]);

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

    return { totalEstimated, totalPaid, pendingCount };
  }, [expenses, selectedMonth]);

  const handleExpense = async () => {
    await fetchData();
    closeModal();
  };

  const handlePay = async (id: string, amount: number, date: string) => {
    await payExpense(id, amount, date);
    setIsPayModalOpen(false);
    await fetchData();
    setPaidExpenseId(id);
    setShowRecreateModal(true);
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
      toast.success("Despesa excluída com sucesso.");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao deletar despesa."));
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
        subtitle="Gerencie suas despesas fixas, variáveis e recorrências"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Nova Despesa
          </Button>
        }
      />

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <Receipt className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Previsto no mês</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatBRL(summary.totalEstimated)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Total pago</p>
            <p className="text-lg font-bold text-success tabular-nums">
              {formatBRL(summary.totalPaid)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Em aberto</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {summary.pendingCount}{" "}
              <span className="text-xs font-medium text-muted">
                {summary.pendingCount === 1 ? "despesa" : "despesas"}
              </span>
            </p>
          </div>
        </Card>
      </div>

      {/* Filters + Month Navigator */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border w-fit">
          {(
            [
              { id: "all", label: "Todas" },
              { id: "pending", label: "Pendentes" },
              { id: "paid", label: "Pagas" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                statusFilter === tab.id
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <MonthNavigator
          value={selectedMonth}
          onChange={setSelectedMonth}
          disableFuture
        />
      </div>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={7} />}

      {isEmpty && (
        <EmptyState
          icon={<Receipt className="w-8 h-8" />}
          title="Nenhuma despesa encontrada"
          description="Ajuste o filtro, navegue para outro mês ou cadastre uma nova despesa."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Nova Despesa
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
                    Descrição
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Pagamento
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Estimado
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Valor Pago
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Vencimento
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Frequência
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
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
                      className="hover:bg-background/70 transition-colors"
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
