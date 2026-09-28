import { apiRequest } from './apiClient';

export type InvoiceStatus = 'pending' | 'paid' | 'overdue';

/** Invoice row returned by the agency invoice APIs. */
export type AgencyInvoice = {
  id: number;
  agency_id: number;
  client_id: number;
  client_name: string;
  site_name?: string | null;
  description: string | null;
  amount: number;
  /** Display code derived from the invoice id, e.g. `INV-12`. */
  invoice_code: string;
  /** ISO date, YYYY-MM-DD. */
  due_date: string;
  status: InvoiceStatus;
  paid_at: string | null;
  created_at: string;
};

/** A client the agency can bill, with its assigned guards and salary total. */
export type AgencyInvoiceClient = {
  client_id: number;
  client_name: string;
  guards_assigned: number;
  total_salary: number;
};

export type AgencyInvoiceClientSummary = AgencyInvoiceClient & {
  user_id: number;
  site_name: string;
};

export type CreateAgencyInvoiceInput = {
  clientId: number;
  amount: number;
  description?: string;
  /** ISO date, YYYY-MM-DD. */
  dueDate: string;
};

/** Invoice row returned by the client invoice API. */
export type ClientInvoice = {
  id: number;
  invoice_code: string;
  agency_id: number;
  agency_name: string | null;
  site_name: string | null;
  description: string | null;
  amount: number;
  /** ISO date, YYYY-MM-DD. */
  due_date: string;
  status: InvoiceStatus;
  paid_at: string | null;
  created_at: string;
};

/**
 * Postgres returns `numeric` columns as strings, so amounts are normalised to
 * numbers once, at the service boundary, and are numbers everywhere in the UI.
 */
const withNumericAmount = <T extends { amount: unknown }>(invoice: T) => ({
  ...invoice,
  amount: Number(invoice.amount) || 0,
});

const withNumericSummary = <T extends { total_salary: unknown }>(summary: T) => ({
  ...summary,
  total_salary: Number(summary.total_salary) || 0,
});

export const invoiceService = {
  /** Clients the signed-in agency can bill (with guards + salary totals). */
  getAgencyClients: async () =>
    (
      await apiRequest<{
        success: boolean;
        data: AgencyInvoiceClient[];
      }>('/agency/invoices/clients', { authenticated: true })
    ).data.map(withNumericSummary),

  getAgencyClientSummary: async (clientId: number) =>
    withNumericSummary(
      (
        await apiRequest<{
          success: boolean;
          data: AgencyInvoiceClientSummary;
        }>(`/agency/invoices/clients/${clientId}/summary`, {
          authenticated: true,
        })
      ).data,
    ),

  getAgencyInvoices: async (status?: InvoiceStatus) =>
    (
      await apiRequest<{ success: boolean; data: AgencyInvoice[] }>(
        `/agency/invoices${status ? `?status=${status}` : ''}`,
        { authenticated: true },
      )
    ).data.map(withNumericAmount),

  createAgencyInvoice: async (input: CreateAgencyInvoiceInput) =>
    withNumericAmount(
      (
        await apiRequest<{ success: boolean; data: AgencyInvoice }>(
          '/agency/invoices',
          { method: 'POST', authenticated: true, body: input },
        )
      ).data,
    ),

  updateAgencyInvoiceStatus: async (id: number, status: InvoiceStatus) =>
    withNumericAmount(
      (
        await apiRequest<{ success: boolean; data: AgencyInvoice }>(
          `/agency/invoices/${id}/status`,
          { method: 'PATCH', authenticated: true, body: { status } },
        )
      ).data,
    ),

  /** Invoices issued to the signed-in client. */
  getClientInvoices: async (status?: InvoiceStatus) =>
    (
      await apiRequest<{ success: boolean; data: ClientInvoice[] }>(
        `/client/invoices${status ? `?status=${status}` : ''}`,
        { authenticated: true },
      )
    ).data.map(withNumericAmount),
};