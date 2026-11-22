import { expenseService } from './api';

export type {
  Expense,
  ExpenseResponse,
  ExpensesResponse,
} from '@cointrack/types';

export const createExpense = expenseService.create;
export const reCreateExpense = expenseService.recreate;
export const updateExpense = expenseService.update;
export const payExpense = expenseService.pay;
export const deleteExpense = expenseService.delete;
export const getExpenseById = expenseService.getById;
export const getExpenses = expenseService.getAll;
export const getExpensesActive = expenseService.getActive;
export const getExpensesInactive = expenseService.getInactive;
