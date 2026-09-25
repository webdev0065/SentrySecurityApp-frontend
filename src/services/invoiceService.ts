/**
 * Frontend-only invoice store.
 *
 * The backend does not expose invoice endpoints yet, so invoices are kept in a
 * module-level store for the app session. The async shape mirrors the other
 * services so an `apiRequest`-backed implementation can be swapped in later
 * without touching the UI.
 */
export type AgencyInvoiceStatus = 'pending' | 'paid';

export type AgencyInvoice = {
  id: number;
  client: string;
  description: string;
  amount: number;
  /** ISO date, YYYY-MM-DD. */
  due_date: string;
  status: AgencyInvoiceStatus;
  created_at: string;
};

export type CreateAgencyInvoiceInput = {
  client: string;
  description: string;
  amount: number;
  due_date: string;
};

// Reference content from the design; the two entries total the ₹45,000 shown
// on the overview "INVOICES" insight.
let nextId = 3;
const store: AgencyInvoice[] = [
  {
    id: 1,
    client: 'Cyber Hub Offices',
    description: 'Subscription Charges',
    amount: 12000,
    due_date: '2026-10-05',
    status: 'pending',
    created_at: '2026-09-01T09:00:00.000Z',
  },
  {
    id: 2,
    client: 'Sunrise Mall',
    description: 'Security Services',
    amount: 33000,
    due_date: '2026-09-30',
    status: 'pending',
    created_at: '2026-09-03T09:00:00.000Z',
  },
];

export const invoiceService = {
  getInvoices: async (): Promise<AgencyInvoice[]> => [...store],
  createInvoice: async (input: CreateAgencyInvoiceInput): Promise<AgencyInvoice> => {
    const invoice: AgencyInvoice = {
      id: nextId,
      client: input.client,
      description: input.description,
      amount: input.amount,
      due_date: input.due_date,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    nextId += 1;
    store.unshift(invoice);
    return invoice;
  },
};
