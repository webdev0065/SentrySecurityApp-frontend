import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import {
  isUsageAtLimit,
  planService,
  type AgencySubscription,
} from '../../../services/planService';

export type PlanUsageState = {
  subscription: AgencySubscription | null;
  loading: boolean;
  planName: string;
  guardUsed: number;
  guardLimit: number | null;
  siteUsed: number;
  siteLimit: number | null;
  guardsAtLimit: boolean;
  sitesAtLimit: boolean;
  refresh: () => Promise<void>;
};

const resolveLimit = (usageLimit?: number | null, planLimit?: number | null) =>
  usageLimit ?? planLimit ?? null;

/**
 * Loads the active agency subscription (plan name + guard/site usage) and
 * reloads it every time the screen gains focus, so plan-limit messaging stays
 * accurate after guards or sites are added or removed.
 */
export function usePlanUsage(): PlanUsageState {
  const [subscription, setSubscription] =
    useState<AgencySubscription | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      setSubscription(await planService.getSubscription());
    } catch {
      // Plan gating is a soft guard on the client; the API still enforces it.
      setSubscription(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  const guardLimit = resolveLimit(
    subscription?.usage?.guards?.limit,
    subscription?.max_guards,
  );
  const siteLimit = resolveLimit(
    subscription?.usage?.sites?.limit,
    subscription?.max_sites,
  );

  return {
    subscription,
    loading,
    planName: subscription?.plan_name ?? '',
    guardUsed: subscription?.usage?.guards?.used ?? 0,
    guardLimit,
    siteUsed: subscription?.usage?.sites?.used ?? 0,
    siteLimit,
    guardsAtLimit: isUsageAtLimit(subscription?.usage?.guards),
    sitesAtLimit: isUsageAtLimit(subscription?.usage?.sites),
    refresh,
  };
}

export default usePlanUsage;
