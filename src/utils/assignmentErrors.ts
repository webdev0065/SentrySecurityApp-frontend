import type { TFunction } from 'i18next';

import { ApiError } from '../services/apiClient';

/**
 * Maps guard-assignment API errors (DUPLICATE_ASSIGNMENT,
 * GUARD_ALREADY_ASSIGNED, SITE_CAPACITY_REACHED, ...) onto localized messages
 * and falls back to the backend message for unknown codes so the user always
 * gets an actionable reason.
 */
export function assignmentErrorMessage(error: unknown, t: TFunction): string {
  if (error instanceof ApiError && error.code) {
    const localized = t(`assignmentErrors.${error.code}`, {
      defaultValue: '',
    });
    if (localized) return localized;
  }
  if (error instanceof Error && error.message) return error.message;
  return t('assignmentErrors.fallback');
}