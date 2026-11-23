import { dashboardService } from './api';

export type {
  DashboardOverview,
  DashboardInstallments,
  CategoryBreakdown,
  DashboardData,
  DashboardResponse,
  DashboardSummaryType,
  DashboardSummaryItem,
  DashboardSummaryData,
  DashboardSummaryResponse,
} from '@cointrack/types';

export const getDashboard = dashboardService.getDashboard;
export const getDashboardSummary = dashboardService.getDashboardSummary;
