import { AxiosInstance } from 'axios';
import { DashboardResponse } from '@cointrack/types';

export function createDashboardService(client: AxiosInstance) {
    return {
        getDashboard: async (month: string) => {
            const response = await client.get<DashboardResponse>('/v1/summary', {
                params: { month },
            });
            return response.data;
        },
    };
}
