import { isApiError } from '@/lib/api';
import i18n from '@/lib/i18n';

/** User-facing message for any thrown value. */
export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) return error.message;
  if (__DEV__ && error instanceof Error) return error.message;
  return i18n.t('errors.generic');
}
