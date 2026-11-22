import { useEffect, useState, useCallback } from "react";
import {
  getInvestments,
  deleteInvestment,
  payInvestmentInstallment,
  type Investment,
  type InvestmentInstallment,
} from "@/services/investment";
import { formatBRL, formatDateBR, extractErrorMessage } from "@cointrack/utils";
import { useToast } from "@/contexts/ToastContext";
import { Eye, Layers, Pencil, Trash2, Plus, TrendingUp } from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  ConfirmDialog,
  EmptyState,
  IconButton,
  PageHeader,
  Pagination,
  TableSkeleton,
} from "@/components/ui";
import ModalInvestment from "./ModalInvestment";
import ModalInvestmentInstallments from "./ModalInvestmentInstallments";

function Investment() {
  const toast = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [investmentId, setInvestmentId] = useState<string | null>(null);
  const [isInstallmentModalOpen, setIsInstallmentModalOpen] = useState(false);
  const [selectedInstallments, setSelectedInstallments] = useState<InvestmentInstallment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setInvestmentId(null);
  };

  const fetchData = useCallback(async (targetPage: number = 1) => {
    setLoading(true);
    setError(null);

    try {
      const data = await getInvestments(targetPage, 20);
      const msg = data?.message;
      if (msg && typeof msg === "object" && !Array.isArray(msg) && "responses" in msg) {
        setInvestments(msg.responses);
        setPage(msg.page);
        setTotalPages(msg.total_pages);
        setTotal(msg.total ?? 0);
      } else {
        setInvestments([]);
        setTotal(0);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar investimentos."));
      setInvestments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    fetchData(1);
  }, [fetchData]);

  const handleInstallments = (id: string) => {
    const investment = investments.find((i) => i.id === id);
    setInvestmentId(id);
    setSelectedInstallments(investment?.records ?? []);
    setIsInstallmentModalOpen(true);
  };

  const handlePayInstallment = async (installmentId: string) => {
    try {
      await payInvestmentInstallment(installmentId);
      setIsInstallmentModalOpen(false);
      setInvestmentId(null);
      setSelectedInstallments([]);
      toast.success("Aporte pago com sucesso!");
      await fetchData(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao processar pagamento."));
      throw err;
    }
  };

  const handleView = (id: string) => {
    setInvestmentId(id);
    setIsUpdate(false);
    openModal();
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await deleteInvestment(deleteTargetId);
      setDeleteTargetId(null);
      toast.success("Investimento excluído com sucesso.");
      await fetchData(page);
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao deletar o investimento."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setInvestmentId(null);
    setIsUpdate(false);
    openModal();
  };

  const isEmpty = !loading && !error && investments.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Investimentos"
        subtitle="Gerencie seus aportes mensais e patrimônio acumulado"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Novo Investimento
          </Button>
        }
      />

      <div className="flex items-center">
        <Card padding="sm" className="inline-flex items-center gap-3.5 min-w-[240px]">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Total Investido</p>
            <p className="text-lg font-bold text-success tabular-nums">
              {formatBRL(total)}
            </p>
          </div>
        </Card>
      </div>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={7} />}

      {isEmpty && (
        <EmptyState
          icon={<TrendingUp className="w-8 h-8" />}
          iconBg="success"
          title="Nenhum investimento cadastrado"
          description="Registre seu primeiro aporte para acompanhar a evolução dos seus investimentos."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Novo Investimento
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
                    Pessoa
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Descrição
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Valor Mensal
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Início
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Aportes
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Total
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {investments.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {item.person}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {item.description}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground tabular-nums">
                      {formatBRL(item.monthly_amount)}
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      {formatDateBR(item.start_date)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">{item.installments}x</Badge>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-success tabular-nums">
                      {formatBRL(item.total)}
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
                          disabled={!item.records || item.records.length === 0}
                          title="Ver aportes"
                          aria-label="Ver aportes"
                        >
                          <Layers size={16} />
                        </IconButton>
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setInvestmentId(item.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar investimento"
                          aria-label="Editar investimento"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(item.id)}
                          title="Excluir investimento"
                          aria-label="Excluir investimento"
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

      <ModalInvestment
        isOpen={isModalOpen}
        onClose={closeModal}
        onInvestmentAction={() => fetchData(page)}
        isUpdate={isUpdate}
        investmentId={investmentId}
      />

      <ModalInvestmentInstallments
        isOpen={isInstallmentModalOpen}
        onClose={() => setIsInstallmentModalOpen(false)}
        installments={selectedInstallments || []}
        onPay={handlePayInstallment}
      />

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Excluir investimento"
        description="Tem certeza que deseja excluir este investimento? Esta ação não poderá ser desfeita."
        confirmLabel="Excluir"
        tone="danger"
        loading={isDeleting}
      />
    </div>
  );
}

export default Investment;
