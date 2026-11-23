import { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  getEarningsWithRecords,
  deleteEarning,
  EarningsResponse,
  PERIODICITY_LABELS,
} from "@/services/earning";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import {
  formatBRL,
  formatDateBR,
  getCurrentMonth,
  parseYearMonth,
  extractErrorMessage,
} from "@cointrack/utils";
import ModalEarning from "./ModalEarning";
import ModalConfirmDelete from "@/components/common/ModalConfirmDelete";
import {
  Eye,
  Pencil,
  Trash2,
  Plus,
  CircleDollarSign,
  TrendingUp,
} from "lucide-react";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  IconButton,
  MonthNavigator,
  PageHeader,
  TableSkeleton,
} from "@/components/ui";

function Earning() {
  const toast = useToast();
  const [earnings, setEarnings] = useState<EarningsResponse>({
    message: [],
    statusCode: 0,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isUpdate, setIsUpdate] = useState<boolean>(false);
  const [earningId, setEarningId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const { user } = useAuth();

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [year, month] = parseYearMonth(selectedMonth);

    try {
      const data = await getEarningsWithRecords(year, month, user?.id);
      if (data) {
        setEarnings(data);
      }
    } catch (err) {
      setError(extractErrorMessage(err, "Erro ao carregar registros de ganhos."));
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEarning = async () => {
    await fetchData();
    closeModal();
  };

  const handleView = (id: string) => {
    setEarningId(id);
    setIsUpdate(false);
    openModal();
  };

  const handleDelete = async (keepHistory: boolean) => {
    if (!deleteTargetId) return;

    setIsDeleting(true);
    try {
      await deleteEarning(deleteTargetId, keepHistory);
      setDeleteTargetId(null);
      toast.success("Registro de ganho excluído com sucesso.");
      await fetchData();
    } catch (err) {
      toast.error(extractErrorMessage(err, "Erro ao excluir ganho."));
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenNew = () => {
    setEarningId("");
    setIsUpdate(false);
    openModal();
  };

  const list = useMemo(
    () => (Array.isArray(earnings?.message) ? earnings.message : []),
    [earnings?.message]
  );

  const totals = useMemo(() => {
    return list.reduce(
      (acc, item) => ({
        gross: acc.gross + (item.record?.gross_pay ?? 0),
        net: acc.net + (item.record?.net_pay ?? 0),
        deduction: acc.deduction + (item.record?.deduction ?? 0),
      }),
      { gross: 0, net: 0, deduction: 0 }
    );
  }, [list]);

  const isEmpty = !loading && !error && list.length === 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Ganhos"
        subtitle="Acompanhe seus lançamentos mensais de receitas"
        actions={
          <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
            Novo Registro
          </Button>
        }
      />

      {/* Segmented Tabs + Month Navigator */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="inline-flex items-center p-1 rounded-xl bg-card border border-border w-fit">
          <Link
            href="/earning"
            className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-primary text-white shadow-xs"
          >
            Registros do Mês
          </Link>
          <Link
            href="/earnings"
            className="px-4 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-foreground transition-colors"
          >
            Fontes de Ganho
          </Link>
        </div>

        <MonthNavigator
          value={selectedMonth}
          onChange={setSelectedMonth}
          disableFuture
        />
      </div>

      {/* Totals Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-success-light flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Total Líquido</p>
            <p className="text-lg font-bold text-success tabular-nums">
              {formatBRL(totals.net)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center flex-shrink-0">
            <CircleDollarSign className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Total Bruto</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatBRL(totals.gross)}
            </p>
          </div>
        </Card>

        <Card padding="sm" className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-accent-light flex items-center justify-center flex-shrink-0">
            <CircleDollarSign className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-xs font-medium text-muted">Deduções</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatBRL(totals.deduction)}
            </p>
          </div>
        </Card>
      </div>

      {error && (
        <Alert variant="error" message={error} onDismiss={() => setError(null)} />
      )}

      {loading && <TableSkeleton rows={5} columns={8} />}

      {isEmpty && (
        <EmptyState
          icon={<CircleDollarSign className="w-8 h-8" />}
          iconBg="success"
          title="Nenhum ganho registrado neste mês"
          description="Comece registrando seus ganhos mensais ou cadastre uma nova fonte de ganho."
          action={
            <Button icon={<Plus className="w-4 h-4" />} onClick={handleOpenNew}>
              Novo Registro
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
                    Usuário
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Descrição
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Periodicidade
                  </th>
                  <th className="text-left px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Data
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Bruto
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Líquido
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Dedução
                  </th>
                  <th className="text-right px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-muted">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {list.map((earning) => (
                  <tr
                    key={earning.id}
                    className="hover:bg-background/70 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {earning.personName || "-"}
                    </td>
                    <td className="px-6 py-4 text-foreground">
                      {earning.description}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="info">
                        {PERIODICITY_LABELS[earning.periodicity] || earning.periodicity}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-muted tabular-nums">
                      {formatDateBR(earning.record?.date)}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground tabular-nums">
                      {formatBRL(earning.record?.gross_pay)}
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-success tabular-nums">
                      {formatBRL(earning.record?.net_pay)}
                    </td>
                    <td className="px-6 py-4 text-right text-muted tabular-nums">
                      {formatBRL(earning.record?.deduction)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <IconButton
                          tone="view"
                          onClick={() => handleView(earning.id)}
                          title="Visualizar detalhes"
                          aria-label="Visualizar detalhes"
                        >
                          <Eye size={16} />
                        </IconButton>
                        <IconButton
                          tone="edit"
                          onClick={() => {
                            setEarningId(earning.id);
                            setIsUpdate(true);
                            openModal();
                          }}
                          title="Editar ganho"
                          aria-label="Editar ganho"
                        >
                          <Pencil size={16} />
                        </IconButton>
                        <IconButton
                          tone="delete"
                          onClick={() => setDeleteTargetId(earning.id)}
                          title="Excluir ganho"
                          aria-label="Excluir ganho"
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

      <ModalEarning
        isOpen={isModalOpen}
        onClose={closeModal}
        onCardAction={handleEarning}
        isUpdate={isUpdate}
        earningId={earningId}
      />

      <ModalConfirmDelete
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        message="Tem certeza que deseja excluir este ganho?"
        isLoading={isDeleting}
      />
    </div>
  );
}

export default Earning;
