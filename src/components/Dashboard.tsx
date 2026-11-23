import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart,
  Tag,
} from 'lucide-react';
import {
  getDashboardSummary,
  type DashboardSummaryData,
  type DashboardSummaryItem,
  type DashboardSummaryType,
  type CategoryBreakdown,
} from '@/services/dashboard';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatBRL } from '@/utils/currency';
import {
  getCurrentYearMonth,
  formatMonthLabel,
  formatShortCompetence,
} from '@/utils/competence';
import {
  Card,
  Badge,
  Alert,
  IconButton,
} from '@/components/ui';

ChartJS.register(ArcElement, Tooltip, Legend);

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  cutout: '74%',
  plugins: {
    legend: {
      position: 'bottom' as const,
      labels: {
        usePointStyle: true,
        boxWidth: 8,
        padding: 18,
        color: '#64748B',
        font: {
          size: 12,
          weight: 500,
        },
      },
    },
    tooltip: {
      callbacks: {
        label: (ctx: { label?: string; parsed?: number }) =>
          ` ${ctx.label ?? ''}: ${(ctx.parsed ?? 0).toFixed(1)}%`,
      },
    },
  },
};

interface PersonOption {
  id: string;
  name: string;
}

const DEFAULT_GROUPS: Array<{ type: DashboardSummaryType; description: string }> = [
  { type: 'PURCHASE', description: 'Compras' },
  { type: 'EXPENSE', description: 'Despesas' },
  { type: 'INVESTMENT', description: 'Investimentos' },
  { type: 'INVOICE', description: 'Fatura' },
];

const GROUP_ROUTES: Record<DashboardSummaryType, string> = {
  PURCHASE: '/purchase',
  EXPENSE: '/expense',
  INVESTMENT: '/investment',
  INVOICE: '/invoice',
};

interface KpiCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ReactNode;
  iconBg: string;
  valueClass?: string;
  badge?: React.ReactNode;
}

function KpiCard({
  title,
  value,
  subtitle,
  icon,
  iconBg,
  valueClass = 'text-foreground',
  badge,
}: KpiCardProps) {
  return (
    <Card padding="md" className="hover:border-border-hover hover:shadow-xs transition-all">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">
            {title}
          </p>
          <p className={`text-2xl font-bold tracking-tight mt-2 tabular-nums ${valueClass}`}>
            {value}
          </p>
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {badge}
            {subtitle && <span className="text-xs text-muted">{subtitle}</span>}
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

function CategoriesBreakdown({ categories }: { categories: CategoryBreakdown[] }) {
  if (categories.length === 0) {
    return (
      <Card padding="md">
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-foreground">
            Tipos de Compras que Mais Gastam
          </h3>
        </div>
        <p className="text-sm text-muted py-6 text-center">
          Nenhuma compra registrada para o período selecionado.
        </p>
      </Card>
    );
  }

  const sorted = [...categories].sort((a, b) => b.percentage - a.percentage);

  return (
    <Card padding="md">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-foreground">
            Tipos de Compras que Mais Gastam
          </h3>
        </div>
        <Badge variant="info">{sorted.length} categorias</Badge>
      </div>
      <div className="space-y-4">
        {sorted.map((cat, idx) => {
          const clampedPct = Math.max(0, Math.min(100, cat.percentage));
          return (
            <div key={cat.category} className="space-y-1.5">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-medium text-foreground truncate">
                  {cat.category}
                </span>
                <div className="flex items-center gap-3 flex-shrink-0 tabular-nums">
                  <span className="text-xs font-medium text-muted">
                    {cat.percentage.toFixed(1)}%
                  </span>
                  <span className="font-semibold text-foreground min-w-[92px] text-right">
                    {formatBRL(cat.amount)}
                  </span>
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-primary' : 'bg-accent'
                  }`}
                  style={{ width: `${clampedPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function Dashboard() {
  const router = useRouter();
  const { selectedFamily, families } = useFamily();
  const { user } = useAuth();

  const [{ year, month }, setCompetence] = useState(getCurrentYearMonth);
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [summary, setSummary] = useState<DashboardSummaryData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const persons = useMemo<PersonOption[]>(() => {
    const map = new Map<string, PersonOption>();

    if (selectedFamily?.members && selectedFamily.members.length > 0) {
      selectedFamily.members.forEach((member) => {
        if (member.person_id && !map.has(member.person_id)) {
          map.set(member.person_id, {
            id: member.person_id,
            name: member.person_name,
          });
        }
      });
    } else if (families.length > 0) {
      families.forEach((family) => {
        family.members?.forEach((member) => {
          if (member.person_id && !map.has(member.person_id)) {
            map.set(member.person_id, {
              id: member.person_id,
              name: member.person_name,
            });
          }
        });
      });
    } else if (user?.id) {
      map.set(user.id, { id: user.id, name: user.name });
    }

    return Array.from(map.values());
  }, [selectedFamily, families, user]);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardSummary(
        month,
        year,
        selectedPersonId || undefined
      );
      setSummary(response.message ?? null);
      setHasLoadedOnce(true);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const apiMessage = err.response?.data?.message;
        setError(
          typeof apiMessage === 'string'
            ? apiMessage
            : 'Não foi possível carregar o resumo financeiro.'
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível carregar o resumo financeiro.');
      }
    } finally {
      setLoading(false);
    }
  }, [month, year, selectedPersonId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const navigateMonth = (direction: number) => {
    setCompetence((prev) => {
      const nextDate = new Date(prev.year, prev.month - 1 + direction, 1);
      return {
        year: nextDate.getFullYear(),
        month: nextDate.getMonth() + 1,
      };
    });
  };

  const fallbackCompetence = formatShortCompetence(year, month);

  const rows = useMemo<DashboardSummaryItem[]>(() => {
    const itemsByType = new Map<DashboardSummaryType, DashboardSummaryItem>();
    if (summary?.items && Array.isArray(summary.items)) {
      summary.items.forEach((item) => {
        itemsByType.set(item.type, item);
      });
    }

    return DEFAULT_GROUPS.map((group) => {
      const match = itemsByType.get(group.type);
      return {
        type: group.type,
        description: match?.description || group.description,
        total_amount: typeof match?.total_amount === 'number' ? match.total_amount : 0,
        items_count: typeof match?.items_count === 'number' ? match.items_count : 0,
        competence: match?.competence || summary?.competence || fallbackCompetence,
      };
    });
  }, [summary, fallbackCompetence]);

  const totalExpenses = useMemo(() => {
    return rows.reduce((sum, item) => sum + item.total_amount, 0);
  }, [rows]);

  const totalIncome = summary?.overview?.total_income ?? 0;
  const availableBalance = summary?.overview?.available_balance ?? (totalIncome - totalExpenses);
  const isPositiveBalance = availableBalance >= 0;

  const rawAvailablePct = summary?.overview?.available_percentage ??
    (totalIncome > 0 ? (availableBalance / totalIncome) * 100 : 0);
  const clampedAvailable = Math.max(0, Math.min(100, rawAvailablePct));
  const usedPct = Math.max(0, 100 - clampedAvailable);

  const isChartValid = totalIncome > 0 || totalExpenses > 0;

  const dynamicChartData = isChartValid
    ? {
        labels: ['Despesas', 'Disponível'],
        datasets: [
          {
            data: [
              totalIncome > 0 ? usedPct : 100,
              totalIncome > 0 ? clampedAvailable : 0,
            ],
            backgroundColor: [
              '#1D4ED8', // Azul Cobalto
              '#10B981', // Verde Esmeralda
            ],
            borderColor: [
              '#1D4ED8',
              '#10B981',
            ],
            borderWidth: 2,
          },
        ],
      }
    : null;

  const handleNavigate = (type: DashboardSummaryType) => {
    const query: Record<string, string> = {
      month: String(month),
      year: String(year),
    };
    if (selectedPersonId) {
      query.person_id = selectedPersonId;
    }
    router.push({
      pathname: GROUP_ROUTES[type],
      query,
    });
  };

  const formatItemsBadge = (count: number) => {
    return count === 1 ? '1 item' : `${count} itens`;
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1">Resumo financeiro mensal consolidado</p>
        </div>

        {/* Filters: Member Selector + Competence Navigator */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Member Selector */}
          <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-3 py-2">
            <Users className="w-4 h-4 text-muted flex-shrink-0" />
            <select
              aria-label="Filtrar por membro da família"
              value={selectedPersonId}
              onChange={(e) => setSelectedPersonId(e.target.value)}
              className="bg-transparent text-sm text-foreground font-medium focus:outline-none pr-2 cursor-pointer"
            >
              <option value="">Todos</option>
              {persons.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </div>

          {/* Competence Selector */}
          <div className="flex items-center gap-1 bg-card border border-border rounded-xl px-2 py-1">
            <button
              type="button"
              onClick={() => navigateMonth(-1)}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Mês anterior"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-semibold text-foreground min-w-[155px] text-center capitalize">
              {formatMonthLabel(year, month)}
            </span>
            <button
              type="button"
              onClick={() => navigateMonth(1)}
              className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-secondary transition-colors"
              aria-label="Próximo mês"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert
          variant="error"
          message={error}
          onDismiss={() => setError(null)}
        />
      )}

      {/* 3 Main KPI Cards: Ganhos, Despesas Totais e Saldo Disponível */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard
          title="Total de Ganhos"
          value={formatBRL(totalIncome)}
          valueClass="text-success"
          icon={<TrendingUp className="w-5 h-5 text-success" />}
          iconBg="bg-success-light"
          subtitle="Receitas do mês"
        />

        <KpiCard
          title="Total do Mês (Despesas)"
          value={formatBRL(totalExpenses)}
          valueClass="text-foreground"
          icon={<TrendingDown className="w-5 h-5 text-danger" />}
          iconBg="bg-danger-light"
          subtitle={totalIncome > 0 ? `${usedPct.toFixed(1)}% da renda` : 'Soma de compras, despesas, inv. e faturas'}
        />

        <KpiCard
          title="Saldo Disponível"
          value={formatBRL(availableBalance)}
          valueClass={isPositiveBalance ? 'text-foreground' : 'text-danger'}
          icon={<Wallet className="w-5 h-5 text-primary" />}
          iconBg="bg-primary-light"
          badge={
            totalIncome > 0 ? (
              <Badge variant={isPositiveBalance ? 'success' : 'danger'}>
                {rawAvailablePct.toFixed(1)}% livre
              </Badge>
            ) : undefined
          }
          subtitle={totalIncome > 0 ? 'Economia prevista' : undefined}
        />
      </div>

      {/* Grouped Summary Table (Spec 0002) */}
      <Card padding="none" className="overflow-hidden">
        <div className="p-4 border-b border-border bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">
              Compromissos Financeiros Agrupados
            </h3>
            <p className="text-xs text-muted mt-0.5">
              Clique em qualquer linha ou no ícone para detalhar o módulo
            </p>
          </div>
          <Badge variant="info">4 grupos</Badge>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/30">
                <th className="text-left px-6 py-3.5 font-semibold text-foreground uppercase tracking-wider text-xs">
                  Descrição
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-foreground uppercase tracking-wider text-xs">
                  Valor
                </th>
                <th className="text-left px-6 py-3.5 font-semibold text-foreground uppercase tracking-wider text-xs">
                  Data
                </th>
                <th className="text-right px-6 py-3.5 font-semibold text-foreground uppercase tracking-wider text-xs">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody
              className={`divide-y divide-border transition-opacity duration-200 ${
                loading && hasLoadedOnce ? 'opacity-60' : 'opacity-100'
              }`}
            >
              {loading && !hasLoadedOnce
                ? DEFAULT_GROUPS.map((group) => (
                    <tr key={group.type} className="even:bg-slate-50/30">
                      <td className="px-6 py-4">
                        <div className="h-5 w-32 bg-secondary rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-24 bg-secondary rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-5 w-20 bg-secondary rounded animate-pulse" />
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-8 bg-secondary rounded-lg animate-pulse ml-auto" />
                      </td>
                    </tr>
                  ))
                : rows.map((item) => (
                    <tr
                      key={item.type}
                      onClick={() => handleNavigate(item.type)}
                      className="even:bg-slate-50/30 hover:bg-slate-50/70 transition-colors cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <span className="font-semibold text-foreground">
                            {item.description}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-muted">
                            {formatItemsBadge(item.items_count)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground tabular-nums">
                        {formatBRL(item.total_amount)}
                      </td>
                      <td className="px-6 py-4 text-muted tabular-nums">
                        {item.competence}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end">
                          <IconButton
                            tone="view"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigate(item.type);
                            }}
                            title={`Visualizar ${item.description.toLowerCase()}`}
                            aria-label={`Visualizar ${item.description}`}
                          >
                            <Eye size={18} />
                          </IconButton>
                        </div>
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Middle Row: Charts & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Doughnut Chart: Ganhos vs Despesas */}
        <Card padding="md" className="flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">
                Ganhos x Despesas
              </h3>
            </div>
            {totalIncome > 0 && (
              <Badge variant={usedPct <= 80 ? 'success' : 'warning'}>
                {usedPct.toFixed(0)}% usado
              </Badge>
            )}
          </div>

          {dynamicChartData ? (
            <div className="relative h-64 flex-1">
              <Doughnut data={dynamicChartData} options={chartOptions} />
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
                <span className="text-2xl font-bold text-foreground tabular-nums">
                  {clampedAvailable.toFixed(0)}%
                </span>
                <span className="text-xs font-medium text-muted">
                  disponível
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center py-12 text-sm text-muted">
              Sem dados de receitas no período para gerar o gráfico.
            </div>
          )}
        </Card>

        {/* Categories Breakdown: Tipos de Compras que Mais Gastam */}
        <div className="lg:col-span-2">
          <CategoriesBreakdown categories={summary?.categories_breakdown ?? []} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
