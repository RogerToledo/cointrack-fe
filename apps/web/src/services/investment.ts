import { investmentService } from './api';

export type {
  InvestmentInstallment,
  Investment,
  InvestmentResponse,
  InvestmentsPaginatedResponse,
} from '@cointrack/types';

export const createInvestment = investmentService.create;
export const updateInvestment = investmentService.update;
export const deleteInvestment = investmentService.delete;
export const getInvestment = investmentService.getById;
export const getInvestments = investmentService.getAll;
export const payInvestmentInstallment = investmentService.payInstallment;
