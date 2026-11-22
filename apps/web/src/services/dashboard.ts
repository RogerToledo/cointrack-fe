import { dashboardService } from './api';

export type {
  DashboardOverview,
  DashboardInstallments,
  CategoryBreakdown,
  DashboardData,
  DashboardResponse,
} from '@cointrack/types';

export const getDashboard = dashboardService.getDashboard;
