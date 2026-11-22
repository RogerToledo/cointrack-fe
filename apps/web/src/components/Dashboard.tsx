import { useState, useEffect, useCallback } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  Layers,
  PieChart,
  Tag,
} from 'lucide-react';
import { getDashboard, DashboardData, CategoryBreakdown } from '@/services/dashboard';
import {
  formatBRL,
  getCurrentMonth,
  extractErrorMessage,
  palette,
} from '@cointrack/utils';
import {
  Card,
  PageHeader,
  MonthNavigator,
  Badge,
  Alert,
  CardSkeleton,
  SkeletonBlock,
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
        color: palette.muted,
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
    <Card className="hover:border-border-hover hover:shadow-[var(--shadow-sm)] transition-all">
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
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-foreground">
            Distribuição por Categoria
          </h3>
        </div>
        <p className="text-sm text-muted py-6 text-center">
          Nenhum dado de categoria disponível para o período selecionado.
        </p>
      </Card>
    );
  }

  const sorted = [...categories].sort((a, b) => b.percentage - a.percentage);

  return (
    <Card>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <Tag className="w-5 h-5 text-accent" />
          <h3 className="text-base font-semibold text-foreground">
            Distribuição por Categoria
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
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboard(selectedMonth);
      setData(response.message);
    } catch (err) {
      setError(
        extractErrorMessage(err, 'Não foi possível carregar os dados do dashboard.')
      );
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const rawAvailablePct = data?.overview?.available_percentage;
  const isChartValid =
    rawAvailablePct !== null &&
    rawAvailablePct !== undefined &&
    !isNaN(rawAvailablePct);

  const clampedAvailable = isChartValid
    ? Math.max(0, Math.min(100, rawAvailablePct))
    : 0;
  const usedPct = isChartValid ? Math.max(0, 100 - clampedAvailable) : 0;

  const dynamicChartData = isChartValid
    ? {
        labels: ['Utilizado', 'Disponível'],
        datasets: [
          {
            label: 'Orçamento',
            data: [usedPct, clampedAvailable],
            backgroundColor: [palette.primary, palette.success],
            hoverBackgroundColor: [palette.primaryHover, palette.successHover],
            borderColor: palette.surface,
            borderWidth: 3,
            borderRadius: 6,
          },
        ],
      }
    : null;

  const availableBalance = data?.overview?.available_balance ?? 0;
  const isPositiveBalance = availableBalance >= 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral das suas finanças no período"
        actions={
          <MonthNavigator value={selectedMonth} onChange={setSelectedMonth} />
        }
      />

      {error && <Alert variant="error" message={error} onDismiss={() => setError(null)} />}

      {loading ? (
        <div className="space-y-6">
          <CardSkeleton count={4} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-1">
              <SkeletonBlock className="h-5 w-32 mb-4" />
              <SkeletonBlock className="h-56 w-full rounded-xl" />
            </Card>
            <Card className="lg:col-span-2">
              <SkeletonBlock className="h-5 w-48 mb-4" />
              <div className="space-y-4">
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
                <SkeletonBlock className="h-8 w-full" />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <>
          {/* 4 KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <KpiCard
              title="Saldo Disponível"
              value={formatBRL(availableBalance)}
              valueClass={isPositiveBalance ? 'text-foreground' : 'text-danger'}
              icon={<Wallet className="w-5 h-5 text-primary" />}
              iconBg="bg-primary-light"
              badge={
                <Badge variant={isPositiveBalance ? 'success' : 'danger'}>
                  {(rawAvailablePct ?? 0).toFixed(1)}% livre
                </Badge>
              }
            />

            <KpiCard
              title="Total de Ganhos"
              value={formatBRL(data?.overview?.total_income)}
              valueClass="text-success"
              icon={<TrendingUp className="w-5 h-5 text-success" />}
              iconBg="bg-success-light"
              subtitle="Receitas do mês"
            />

            <KpiCard
              title="Total de Despesas"
              value={formatBRL(data?.overview?.total_expenses)}
              valueClass="text-foreground"
              icon={<TrendingDown className="w-5 h-5 text-danger" />}
              iconBg="bg-danger-light"
              subtitle={`${usedPct.toFixed(1)}% da renda`}
            />

            <KpiCard
              title="Parcelamentos"
              value={formatBRL(data?.installments?.total_amount)}
              valueClass="text-foreground"
              icon={<Layers className="w-5 h-5 text-accent" />}
              iconBg="bg-accent-light"
              badge={
                <Badge variant="info">
                  {data?.installments?.active_purchases_count ?? 0} compras
                </Badge>
              }
              subtitle={`${data?.installments?.total_installments_count ?? 0} parcelas`}
            />
          </div>

          {/* Middle Row: Budget Chart + Installments & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Doughnut Chart */}
            <Card className="flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  <h3 className="text-base font-semibold text-foreground">
                    Uso do Orçamento
                  </h3>
                </div>
                {isChartValid && (
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
                  Sem dados de orçamento para o período.
                </div>
              )}
            </Card>

            {/* Categories Breakdown */}
            <div className="lg:col-span-2">
              <CategoriesBreakdown categories={data?.categories_breakdown ?? []} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
