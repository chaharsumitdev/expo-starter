import { I18nManager, Text as RNText, type TextProps as RNTextProps } from 'react-native';

import { cn } from '@/lib/cn';

const variants = {
  title: 'text-3xl font-bold text-foreground',
  heading: 'text-xl font-semibold text-foreground',
  body: 'text-base text-foreground',
  label: 'text-sm font-medium text-foreground',
  caption: 'text-sm text-muted-foreground',
  error: 'text-sm text-destructive',
} as const;

// Makes the default ("natural") alignment follow the app's layout direction on iOS.
const direction = { writingDirection: I18nManager.isRTL ? 'rtl' : 'ltr' } as const;

export type TextProps = RNTextProps & { variant?: keyof typeof variants };

export function Text({ variant = 'body', className, style, ...props }: TextProps) {
  return (
    <RNText className={cn(variants[variant], className)} style={[direction, style]} {...props} />
  );
}
