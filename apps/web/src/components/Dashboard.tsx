import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TrendingUp, CreditCard, Receipt, DollarSign, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getDashboard, DashboardData, CategoryBreakdown } from '../services/dashboard';
import { formatBRL } from '../utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                usePointStyle: true,
                padding: 20,
                font: {
                    size: 13,
                }
            }
        },
        title: {
            display: false,
        },
    },   
}

interface StatCardProps {
    title: string;
    value: string;
    icon: React.ReactNode;
    trend?: string;
    trendUp?: boolean;
}

function StatCard({ title, value, icon, trend, trendUp }: StatCardProps) {
    return (
        <div className="bg-card rounded-2xl border border-border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-muted font-medium">{title}</p>
                    <p className="text-2xl font-bold text-foreground mt-1">{value}</p>
                    {trend && (
                        <p className={`text-xs font-medium mt-2 flex items-center gap-1 ${trendUp ? 'text-success' : 'text-danger'}`}>
                            <TrendingUp className={`w-3.5 h-3.5 ${!trendUp ? 'rotate-180' : ''}`} />
                            {trend}
                        </p>
                    )}
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary-light flex items-center justify-center">
                    {icon}
                </div>
            </div>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted mt-1">Visão geral das suas finanças</p>
            </div>
            <div className="flex items-center justify-center py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted mt-1">Visão geral das suas finanças</p>
            </div>
            <div className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20" role="alert">
                <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                <p className="text-sm text-danger flex-1">{message}</p>
            </div>
        </div>
    );
}

function CategoriesBreakdown({ categories }: { categories: CategoryBreakdown[] }) {
    if (categories.length === 0) {
        return (
            <div className="bg-card rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de compra</h3>
                <p className="text-sm text-muted">Nenhum dado de categoria disponível para o período.</p>
            </div>
        );
    }

    const sorted = [...categories].sort((a, b) => b.percentage - a.percentage);

    return (
        <div className="bg-card rounded-2xl border border-border p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Tipo de compra</h3>
            <div className="space-y-3">
                {sorted.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-foreground font-medium">{cat.category}</span>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-muted">{cat.percentage.toFixed(2)}%</span>
                            <span className="text-sm font-semibold text-primary">{formatBRL(cat.amount)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function Dashboard() {
    const getCurrentMonth = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    };

    const [data, setData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

    useEffect(() => {
        fetchDashboardData();
    }, [selectedMonth]);

    const fetchDashboardData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getDashboard(selectedMonth);
            setData(response.message);
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Não foi possível carregar os dados do dashboard.");
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingState />;
    if (error) return <ErrorState message={error} />;

    const availablePercentage = data?.overview?.available_percentage;
    const isChartValid = availablePercentage !== null && availablePercentage !== undefined && !isNaN(availablePercentage);

    const dynamicChartData = isChartValid ? {
        labels: ['usado', 'disponível'],
        datasets: [{
            label: 'Orçamento',
            data: [100 - availablePercentage, availablePercentage],
            backgroundColor: [
                'rgba(99, 102, 241, 0.8)',
                'rgba(229, 231, 235, 0.6)',
            ],
            borderColor: [
                'rgba(99, 102, 241, 1)',
                'rgba(209, 213, 219, 1)',
            ],
            borderWidth: 2,
            borderRadius: 4,
        }]
    } : null;

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted mt-1">Visão geral das suas finanças</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            const [year, month] = selectedMonth.split('-').map(Number);
                            const prev = new Date(year, month - 2, 1);
                            setSelectedMonth(`${prev.getFullYear()}-${String(prev.getMonth() + 1).padStart(2, '0')}`);
                        }}
                        className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                        aria-label="Mês anterior"
                    >
                        <ChevronLeft className="w-4 h-4 text-muted" />
                    </button>
                    <input
                        type="month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                        className="bg-card border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <button
                        onClick={() => {
                            const [year, month] = selectedMonth.split('-').map(Number);
                            const next = new Date(year, month, 1);
                            setSelectedMonth(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`);
                        }}
                        className="p-2 rounded-lg hover:bg-muted/20 transition-colors"
                        aria-label="Próximo mês"
                    >
                        <ChevronRight className="w-4 h-4 text-muted" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard 
                    title="Disponível"
                    value={formatBRL(data?.overview.available_balance)}
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                    trend={`${data?.overview.available_percentage?.toFixed(2) ?? '0.00'}% do orçamento`}
                    trendUp={(data?.overview.available_percentage ?? 0) >= 50}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doughnut Chart */}
                {dynamicChartData && (
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Orçamento</h3>
                    <div className="h-64">
                        <Doughnut data={dynamicChartData} options={options} />
                    </div>
                </div>
                )}

                {/* Installments Summary */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Parcelamentos</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-sm text-muted">Compras parceladas</span>
                            <span className="text-sm font-semibold text-foreground">{data?.installments?.active_purchases_count ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-sm text-muted">Total de parcelas</span>
                            <span className="text-sm font-semibold text-foreground">{data?.installments?.total_installments_count ?? 0}</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-muted">Valor total</span>
                            <span className="text-sm font-bold text-primary">{formatBRL(data?.installments?.total_amount)}</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Info */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Resumo</h3>
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-success-light border border-success/10">
                            <p className="text-xs font-medium text-success uppercase tracking-wide">Ganhos</p>
                            <p className="text-lg font-bold text-foreground mt-1">{formatBRL(data?.overview?.total_income)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-danger-light border border-danger/10">
                            <p className="text-xs font-medium text-danger uppercase tracking-wide">Despesas</p>
                            <p className="text-lg font-bold text-foreground mt-1">{formatBRL(data?.overview?.total_expenses)}</p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary-light border border-primary/10">
                            <p className="text-xs font-medium text-primary uppercase tracking-wide">Saldo</p>
                            <p className="text-lg font-bold text-foreground mt-1">{formatBRL(data?.overview?.available_balance)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories Breakdown */}
            <CategoriesBreakdown categories={data?.categories_breakdown ?? []} />
        </div>
    );
}

export default Dashboard;
