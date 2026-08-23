import { useState, useEffect, useCallback } from "react";
import { getInvoice, payInvoice, InvoicePurchase } from "@/services/invoice";
import { getPhysicalCreditCards, CreditCard } from "@/services/creditCard";
import { FileText, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, X, Lock } from "lucide-react";

function Invoice() {
    const [purchases, setPurchases] = useState<InvoicePurchase[]>([]);
    const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
    const [selectedCardId, setSelectedCardId] = useState<string>("");
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [invoiceStatus, setInvoiceStatus] = useState<"open" | "closed" | "paid">("open");
    const [paying, setPaying] = useState(false);

    const fetchCreditCards = useCallback(async () => {
        try {
            const data = await getPhysicalCreditCards();
            if (data?.message && Array.isArray(data.message)) {
                setCreditCards(data.message);
                if (!selectedCardId && data.message.length > 0) {
                    setSelectedCardId(data.message[0].id);
                }
            }
        } catch {
            // silently fail
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
                // Determine invoice status based on purchases
                const allPaid = data.message.purchases.length > 0 && data.message.purchases.every(p => p.paid);
                const now = new Date();
                const [year, month] = currentMonth.split("-").map(Number);
                const invoiceMonth = new Date(year, month - 1);
                const isCurrentOrFuture = invoiceMonth >= new Date(now.getFullYear(), now.getMonth());

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
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro ao carregar fatura.");
            }
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
            setSuccess("Fatura paga com sucesso!");
            setInvoiceStatus("paid");
            await fetchInvoice();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Erro ao pagar fatura.");
            }
        } finally {
            setPaying(false);
        }
    };

    const navigateMonth = (direction: number) => {
        const [year, month] = currentMonth.split("-").map(Number);
        const date = new Date(year, month - 1 + direction);
        setCurrentMonth(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`);
    };

    const formatMonthLabel = (yearMonth: string) => {
        const [year, month] = yearMonth.split("-").map(Number);
        const date = new Date(year, month - 1);
        return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    };

    const totalAmount = purchases.reduce((sum, p) => {
        return sum + (p.installment_value > 0 ? p.installment_value : p.amount);
    }, 0);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Fatura</h1>
                    <p className="text-muted mt-1">Acompanhe as compras no cartão de crédito</p>
                </div>
                <div>
                    {invoiceStatus === "open" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warning-light border border-warning/20 text-sm font-medium text-warning">
                            <span className="w-2 h-2 rounded-full bg-warning" />
                            Aberta
                        </span>
                    )}
                    {invoiceStatus === "closed" && (
                        <button
                            onClick={handlePay}
                            disabled={paying}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover focus:ring-4 focus:ring-primary/20 disabled:opacity-50 transition-all"
                        >
                            {paying ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Pagar"
                            )}
                        </button>
                    )}
                    {invoiceStatus === "paid" && (
                        <span className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success-light border border-success/20 text-sm font-medium text-success">
                            <Lock className="w-4 h-4" />
                            Pago
                        </span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="bg-card rounded-2xl border border-border p-4">
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Month Navigator */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => navigateMonth(-1)}
                            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
                            title="Mês anterior"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-semibold text-foreground min-w-[160px] text-center capitalize">
                            {formatMonthLabel(currentMonth)}
                        </span>
                        <button
                            onClick={() => navigateMonth(1)}
                            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
                            title="Próximo mês"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Card Filter */}
                    <div className="flex-1 sm:max-w-xs">
                        <select
                            value={selectedCardId}
                            onChange={(e) => setSelectedCardId(e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                        >
                            {creditCards.map((card) => (
                                <option key={card.id} value={card.id}>
                                    {card.owner} - •••• {card.final_card_num}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Total */}
                    <div className="ml-auto text-right">
                        <p className="text-xs text-muted uppercase tracking-wide">Total</p>
                        <p className="text-lg font-bold text-foreground">
                            {totalAmount.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Success Alert */}
            {success && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-success-light border border-success/20" role="alert">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    <p className="text-sm text-success flex-1">{success}</p>
                    <button onClick={() => setSuccess(null)} className="text-success hover:text-success/70 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Error Alert */}
            {error && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20" role="alert">
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger flex-1">{error}</p>
                    <button onClick={() => setError(null)} className="text-danger hover:text-danger/70 transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-sm text-muted">Carregando fatura...</p>
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && purchases.length === 0 && (
                <div className="bg-card rounded-2xl border border-border p-12 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">Nenhuma compra nesta fatura</h3>
                    <p className="text-sm text-muted">Não há compras no cartão para o período selecionado.</p>
                </div>
            )}

            {/* Table */}
            {!loading && purchases.length > 0 && (
                <div className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border bg-secondary/50">
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Pessoa</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Descrição</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Local</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Valor</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Parcelas</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Data</th>
                                    <th className="text-left px-6 py-4 font-semibold text-foreground">Cartão</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {purchases.map((purchase) => (
                                    <tr key={purchase.id} className="hover:bg-secondary/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-foreground">{purchase.person}</td>
                                        <td className="px-6 py-4 text-muted">{purchase.description}</td>
                                        <td className="px-6 py-4 text-muted">{purchase.place}</td>
                                        <td className="px-6 py-4 font-medium text-foreground">
                                            {(purchase.installment_value > 0 ? purchase.installment_value : purchase.amount)
                                                .toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                        </td>
                                        <td className="px-6 py-4">
                                            {purchase.installment_number > 1 ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent-light text-accent">
                                                    {purchase.installment_number}x
                                                </span>
                                            ) : (
                                                <span className="text-muted">à vista</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-muted">
                                            {purchase.date ? new Date(purchase.date).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "-"}
                                        </td>
                                        <td className="px-6 py-4 text-muted">{purchase.card_name || purchase.credit_card}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Invoice;
