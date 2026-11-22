import { invoiceService } from './api';

export type {
  InvoicePurchase,
  Invoice,
  InvoiceResponse,
  InvoiceStatus,
  InvoiceStatusResponse,
} from '@cointrack/types';

export const getInvoiceStatus = invoiceService.getStatus;
export const getInvoice = invoiceService.getInvoice;
export const payInvoice = invoiceService.payInvoice;
