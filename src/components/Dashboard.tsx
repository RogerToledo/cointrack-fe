import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { TrendingUp, CreditCard, Receipt, DollarSign } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const data = {
    labels: ['usado', 'disponível'],
    datasets: [{
        label: 'Orçamento',
        data: [75, 25],
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
}

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

function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                <p className="text-muted mt-1">Visão geral das suas finanças</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <StatCard 
                    title="Orçamento Total"
                    value="R$ 5.000,00"
                    icon={<DollarSign className="w-5 h-5 text-primary" />}
                    trend="+12% este mês"
                    trendUp={true}
                />
                <StatCard 
                    title="Compras Parceladas"
                    value="3"
                    icon={<CreditCard className="w-5 h-5 text-primary" />}
                    trend="10 parcelas restantes"
                />
                <StatCard 
                    title="Total Parcelas"
                    value="R$ 1.000,00"
                    icon={<Receipt className="w-5 h-5 text-primary" />}
                />
                <StatCard 
                    title="Disponível"
                    value="R$ 1.250,00"
                    icon={<TrendingUp className="w-5 h-5 text-primary" />}
                    trend="25% do orçamento"
                    trendUp={true}
                />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Doughnut Chart */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Orçamento</h3>
                    <div className="h-64">
                        <Doughnut data={data} options={options} />
                    </div>
                </div>

                {/* Installments Summary */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Parcelamentos</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-sm text-muted">Compras parceladas</span>
                            <span className="text-sm font-semibold text-foreground">3</span>
                        </div>
                        <div className="flex items-center justify-between py-3 border-b border-border">
                            <span className="text-sm text-muted">Total de parcelas</span>
                            <span className="text-sm font-semibold text-foreground">10</span>
                        </div>
                        <div className="flex items-center justify-between py-3">
                            <span className="text-sm text-muted">Valor total</span>
                            <span className="text-sm font-bold text-primary">R$ 1.000,00</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions / Info */}
                <div className="bg-card rounded-2xl border border-border p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">Resumo</h3>
                    <div className="space-y-3">
                        <div className="p-3 rounded-xl bg-success-light border border-success/10">
                            <p className="text-xs font-medium text-success uppercase tracking-wide">Ganhos</p>
                            <p className="text-lg font-bold text-foreground mt-1">R$ 5.000,00</p>
                        </div>
                        <div className="p-3 rounded-xl bg-danger-light border border-danger/10">
                            <p className="text-xs font-medium text-danger uppercase tracking-wide">Despesas</p>
                            <p className="text-lg font-bold text-foreground mt-1">R$ 3.750,00</p>
                        </div>
                        <div className="p-3 rounded-xl bg-primary-light border border-primary/10">
                            <p className="text-xs font-medium text-primary uppercase tracking-wide">Saldo</p>
                            <p className="text-lg font-bold text-foreground mt-1">R$ 1.250,00</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
