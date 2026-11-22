import { AxiosInstance } from 'axios';
import { DashboardResponse, DashboardSummaryResponse } from '@cointrack/types';

export function createDashboardService(client: AxiosInstance) {
    return {
        getDashboard: async (month: string) => {
            const response = await client.get<DashboardResponse>('/v1/dashboard', {
                params: { month },
            });
            return response.data;
        },
        getDashboardSummary: async (month: number, year: number, personId?: string) => {
            const params: Record<string, string | number> = { month, year };
            if (personId && personId !== 'all') {
                params.person_id = personId;
            }
            const response = await client.get<DashboardSummaryResponse>('/v1/dashboard/summary', {
                params,
            });
            return response.data;
        },
    };
}
