import { apiRequest } from './apiClient';

export type PlanFeatures = string[];

export type AgencyPlan = {
  id: number;
  name: string;
  price: number | string;
  billing_interval?: string | null;
  interval?: string | null;
  max_guards: number | null;
  max_sites: number | null;
  features?: string[] | string | null;
  description?: string | null;
  is_active?: boolean | null;
};

export type PlanUsage = {
  used: number;
  limit: number | null;
};

export type AgencySubscription = {
  id?: number;
  agency_id?: number;
  plan_id?: number;
  plan_name: string;
  price: number | string;
  status: string;
  billing_interval?: string | null;
  interval?: string | null;
  renews_at?: string | null;
  renewsAt?: string | null;
  renewal_date?: string | null;
  started_at?: string | null;
  max_guards: number | null;
  max_sites: number | null;
  features?: string[] | string | null;
  usage?: {
    guards?: PlanUsage | null;
    sites?: PlanUsage | null;
  } | null;
};

type ApiEnvelope<T> = { success: boolean; data: T; message?: string };

/** A null/undefined limit means the plan is unlimited for that resource. */
export const isUnlimited = (limit?: number | null): boolean =>
  limit === null || limit === undefined;

/** True when the plan has a finite allowance and it has been fully used. */
export const isUsageAtLimit = (usage?: PlanUsage | null): boolean =>
  Boolean(
    usage && !isUnlimited(usage.limit) && usage.used >= (usage.limit as number),
  );

export const planService = {
  getPlans: async (): Promise<AgencyPlan[]> =>
    (await apiRequest<ApiEnvelope<AgencyPlan[]>>('/plans')).data ?? [],

  getSubscription: async (): Promise<AgencySubscription> =>
    (
      await apiRequest<ApiEnvelope<AgencySubscription>>(
        '/agency/subscription',
        { authenticated: true },
      )
    ).data,

  switchPlan: async (planName: string): Promise<AgencySubscription> =>
    (
      await apiRequest<ApiEnvelope<AgencySubscription>>(
        '/agency/subscription/switch',
        { method: 'POST', body: { planName }, authenticated: true },
      )
    ).data,
};
