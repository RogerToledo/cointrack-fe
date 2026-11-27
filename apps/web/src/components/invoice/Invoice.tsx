import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import {
  getInvoice,
  payInvoice,
  getInvoiceStatus,
  InvoicePurchase,
  InvoiceStatus,
} from "@/services/invoice";
import { getCreditCards, CreditCard } from "@/services/creditCard";
import {
  formatBRL,
  formatDateBR,
  getCurrentMonth,
  parseYearMonth,
  extractErrorMessage,
} from "@cointrack/utils";
import { parseMonthFromQuery } from "@/utils/competence";
import { useToast } from "@/contexts/ToastContext";
import {
  FileText,
  Lock,
  CreditCard as CardIcon,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  MonthNavigator,
  PageHeader,
  TableSkeleton,
  inputBaseClasses,
} from "@/components/ui";

function mapInvoiceStatus(status: InvoiceStatus): "open" | "closed" | "paid" {
  if (status === "Pago") return "paid";
  if (status === "Pagar") return "closed";
  return "open";
}

function Invoice() {
  const router = useRouter();
  const toast = useToast();
  const [purchases, setPurchases] = useState<InvoicePurchase[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState<string>("");
  const [currentMonth, setCurrentMonth] = useState(() => parseMonthFromQuery(router.query) ?? getCurrentMonth());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [invoiceStatus, setInvoiceStatus] = useState<"open" | "closed" | "paid">("open");
  const [paying, setPaying] = useState(false);
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

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

  const fetchCreditCards = useCallback(async () => {
    try {
      const data = await getCreditCards();
      if (data?.message && Array.isArray(data.message)) {
        setCreditCards(data.message);
        if (!selectedCardId && data.message.length > 0) {
          setSelectedCardId(data.message[0].id);
        } else if (data.message.length === 0) {
          setLoading(false);
        }
      }
    } catch {
      setLoading(false);
    }
  }, [selectedCardId]);

  const fetchInvoice = useCallback(async () => {
    if (!selectedCardId) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getInvoice(currentMonth, selectedCardId);
      if (data?.message?.purchases && Array.isArray(data.message.purchases)) {
        setPurchases(data.message.purchases);
        const allPaid =
          data.message.purchases.length > 0 &&
          data.message.purchases.every((p) => p.paid);
        const now = new Date();
        const [year, month] = parseYearMonth(currentMonth);
        const invoiceMonth =
          year && month ? new Date(year, month - 1) : new Date();
        const isCurrentOrFuture =
          invoiceMonth >= new Date(now.getFullYear(), now.getMonth());

        if (allPaid && data.message.purchases.length > 0) {
          setInvoiceStatus("paid");
        } else if (isCurrentOrFuture) {
          setInvoiceStatus("open");
        } else {
          setInvoiceStatus("closed");
        }
      } else {
        setPurchases([]);
        setInvoiceStatus("open");
      }

      if (selectedCardId) {
        try {
          const [year, month] = parseYearMonth(currentMonth);
          if (year && month) {
            const statusData = await getInvoiceStatus(selectedCardId, year, month);
            setInvoiceStatus(mapInvoiceStatus(statusData.message.status));
          }
        } catch {
          // Mantém status derivado das compras
        }
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar fatura."));
      setPurchases([]);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, selectedCardId]);

  useEffect(() => {
    fetchCreditCards();
  }, [fetchCreditCards]);

  useEffect(() => {
    fetchInvoice();
  }, [fetchInvoice]);

  const handlePay = async () => {
    if (paying) return;
    setPaying(true);
    setError(null);
    try {
      await payInvoice(currentMonth, selectedCardId || undefined);
      setInvoiceStatus("paid");
      toast.success("Fatura paga com sucesso!");
      await fetchInvoice();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao pagar fatura."));
    } finally {
      setPaying(false);
    }
  };

  const handleSort = (field: "date" | "amount") => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder(field === "amount" ? "desc" : "asc");
    }
  };

  const sortedPurchases = useMemo(() => {
    return [...purchases].sort((a, b) => {
      const dir = sortOrder === "asc" ? 1 : -1;
      if (sortBy === "amount") {
        const aVal = a.installment_value > 0 ? a.installment_value : a.amount;
        const bVal = b.installment_value > 0 ? b.installment_value : b.amount;
        return (aVal - bVal) * dir;
      }
      const aDate = a.date ? new Date(a.date).getTime() : 0;
      const bDate = b.date ? new Date(b.date).getTime() : 0;
      return (aDate - bDate) * dir;
    });
  }, [purchases, sortBy, sortOrder]);

  const totalAmount = purchases.reduce((sum, p) => {
    return sum + (p.installment_value > 0 ? p.installment_value : p.amount);
  }, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fatura"
        subtitle="Acompanhe os lançamentos e o fechamento dos seus cartões de crédito"
        actions={
          <>
            {invoiceStatus === "open" && (
              <Badge variant="warning" dot className="px-3.5 py-2 text-xs">
                Fatura Aberta
              </Badge>
            )}
            {invoiceStatus === "closed" && (
              <Button
                variant="primary"
                onClick={handlePay}
                loading={paying}
                icon={<Lock className="w-4 h-4" />}
              >
                Pagar Fatura
              </Button>
            )}
            {invoiceStatus === "paid" && (
              <Badge variant="success" dot className="px-3.5 py-2 text-xs">
                Fatura Paga
              </Badge>
            )}
          </>
        }
      />

      <Card padding="md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 flex-1">
            <MonthNavigator value={currentMonth} onChange={setCurrentMonth} />

            <div className="relative sm:w-72">
              <CardIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
              <select
                value={selectedCardId}
                onChange={(e) => setSelectedCardId(e.target.value)}
                className={`${inputBaseClasses} pl-9`}
                aria-label="Selecionar cartão de crédito"
              >
                <option value="">Selecione um cartão</option>
                {creditCards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.card_name || card.owner} — •••• {card.final_card_num}
                  </option>
                ))}
              </select>
            </div>

            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-secondary border border-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => handleSort("date")}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  sortBy === "date"
                    ? "bg-card text-foreground shadow-xs font-semibold"
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
                    ? "bg-card text-foreground shadow-xs font-semibold"
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
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-4 pt-3 lg:pt-0 border-t lg:border-t-0 border-border">
            <div className="lg:text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">
                Total da Fatura
              </p>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {formatBRL(totalAmount)}
              </p>
            </div>
          </div>
        </div>
      </Card>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={8} />}

      {!loading && !error && purchases.length === 0 && (
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="Nenhuma compra nesta fatura"
          description="Não há lançamentos no cartão para o período e cartão selecionados."
        />
      )}

      {!loading && purchases.length > 0 && (
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
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Parcelas
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
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
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Cartão
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {sortedPurchases.map((purchase) => (
                  <tr
                    key={purchase.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {purchase.person}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {purchase.description}
                    </td>
                    <td className="px-6 py-4 text-muted">{purchase.place || "-"}</td>
                    <td className="px-6 py-4 text-right font-semibold text-foreground tabular-nums">
                      {formatBRL(
                        purchase.installment_value > 0
                          ? purchase.installment_value
                          : purchase.amount
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {purchase.installment_number > 1 ? (
                        <Badge variant="info">{purchase.installment_number}x</Badge>
                      ) : (
                        <Badge variant="neutral">À vista</Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      {formatDateBR(purchase.date)}
                    </td>
                    <td className="px-6 py-4 text-muted">{purchase.credit_card}</td>
                    <td className="px-6 py-4">
                      <Badge variant={purchase.paid ? "success" : "warning"} dot>
                        {purchase.paid ? "Pago" : "Pendente"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export default Invoice;
