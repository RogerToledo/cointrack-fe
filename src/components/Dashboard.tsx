import { useState, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import { Eye, ChevronLeft, ChevronRight, AlertCircle, Users } from 'lucide-react';
import {
    getDashboardSummary,
    type DashboardSummaryData,
    type DashboardSummaryItem,
    type DashboardSummaryType,
} from '@/services/dashboard';
import { useFamily } from '@/contexts/FamilyContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatBRL } from '@/utils/currency';
import {
    getCurrentYearMonth,
    formatMonthLabel,
    formatShortCompetence,
} from '@/utils/competence';

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

    const totalMonth = useMemo(() => {
        return rows.reduce((sum, item) => sum + item.total_amount, 0);
    }, [rows]);

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
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
                    <p className="text-muted mt-1">Resumo financeiro mensal consolidado</p>
                </div>
            </div>

            {/* Filter Bar: KPI Total + Member Selector + Competence Navigator */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3">
                    {/* KPI Card */}
                    <div className="bg-card border border-border rounded-xl px-4 py-2 min-w-[180px]">
                        <p className="text-xs text-muted">Total do mês</p>
                        {loading && !hasLoadedOnce ? (
                            <div className="h-7 w-28 bg-secondary rounded animate-pulse mt-0.5" />
                        ) : (
                            <p
                                className={`text-lg font-semibold text-foreground transition-opacity ${
                                    loading ? 'opacity-60' : 'opacity-100'
                                }`}
                            >
                                {formatBRL(totalMonth)}
                            </p>
                        )}
                    </div>

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
                </div>

                {/* Competence Selector */}
                <div className="flex items-center justify-end gap-2">
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
                        <span className="text-sm font-semibold text-foreground min-w-[155px] text-center">
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
                <div
                    className="flex items-center gap-3 p-4 rounded-xl bg-danger-light border border-danger/20"
                    role="alert"
                >
                    <AlertCircle className="w-5 h-5 text-danger flex-shrink-0" />
                    <p className="text-sm text-danger flex-1">{error}</p>
                    <button
                        type="button"
                        onClick={fetchSummary}
                        className="text-xs font-medium text-danger underline hover:opacity-80 transition-opacity"
                    >
                        Tentar novamente
                    </button>
                </div>
            )}

            {/* Grouped Summary Table */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-border bg-secondary/50">
                                <th className="text-left px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-xs">
                                    Descrição
                                </th>
                                <th className="text-left px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-xs">
                                    Valor
                                </th>
                                <th className="text-left px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-xs">
                                    Data
                                </th>
                                <th className="text-right px-6 py-4 font-semibold text-foreground uppercase tracking-wider text-xs">
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
                                      <tr key={group.type} className="even:bg-secondary/20">
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
                                          className="even:bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
                                      >
                                          <td className="px-6 py-4">
                                              <div className="flex items-center gap-2.5">
                                                  <span className="font-medium text-foreground">
                                                      {item.description}
                                                  </span>
                                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-muted">
                                                      {formatItemsBadge(item.items_count)}
                                                  </span>
                                              </div>
                                          </td>
                                          <td className="px-6 py-4 font-semibold text-foreground">
                                              {formatBRL(item.total_amount)}
                                          </td>
                                          <td className="px-6 py-4 text-muted">
                                              {item.competence}
                                          </td>
                                          <td className="px-6 py-4">
                                              <div className="flex items-center justify-end">
                                                  <button
                                                      type="button"
                                                      onClick={(e) => {
                                                          e.stopPropagation();
                                                          handleNavigate(item.type);
                                                      }}
                                                      className="p-2 rounded-lg text-muted hover:text-primary hover:bg-primary-light transition-colors"
                                                      title={`Visualizar ${item.description.toLowerCase()}`}
                                                      aria-label={`Visualizar ${item.description}`}
                                                  >
                                                      <Eye size={18} />
                                                  </button>
                                              </div>
                                          </td>
                                      </tr>
                                  ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
