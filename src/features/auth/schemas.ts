import { z } from 'zod';

import i18n from '@/lib/i18n';

// Messages resolve at validation time so they follow the current language.
export const emailSchema = z.email({ error: () => i18n.t('auth.invalidEmail') });
export const passwordSchema = z.string().min(8, { error: () => i18n.t('auth.passwordTooShort') });

export const signInSchema = z.object({ email: emailSchema, password: passwordSchema });
export const signUpSchema = signInSchema.extend({ name: z.string().trim().optional() });

export type SignInValues = z.infer<typeof signInSchema>;
export type SignUpValues = z.infer<typeof signUpSchema>;
