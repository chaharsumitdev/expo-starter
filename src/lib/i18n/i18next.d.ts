import 'i18next';

import type { resources } from './resources';

// Typed translation keys: t('auth.signIn') autocompletes and typos fail typecheck.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: (typeof resources)['en'];
  }
}
