import * as Haptics from 'expo-haptics';
import { ActivityIndicator, Pressable, type PressableProps, Text, View } from 'react-native';

import { cn } from '@/lib/cn';

const variants = {
  primary: {
    container: 'bg-primary',
    text: 'text-primary-foreground',
    accent: 'accent-primary-foreground',
  },
  secondary: {
    container: 'bg-secondary',
    text: 'text-secondary-foreground',
    accent: 'accent-secondary-foreground',
  },
  outline: {
    container: 'border border-border bg-background',
    text: 'text-foreground',
    accent: 'accent-foreground',
  },
  ghost: { container: 'bg-transparent', text: 'text-primary', accent: 'accent-primary' },
  destructive: {
    container: 'bg-destructive',
    text: 'text-destructive-foreground',
    accent: 'accent-destructive-foreground',
  },
} as const;

const sizes = {
  sm: { container: 'h-9 px-3', text: 'text-sm' },
  md: { container: 'h-12 px-4', text: 'text-base' },
  lg: { container: 'h-14 px-6', text: 'text-lg' },
} as const;

export type ButtonProps = Omit<PressableProps, 'children'> & {
  title: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  loading?: boolean;
  left?: React.ReactNode;
  haptic?: boolean;
  className?: string;
};

export function Button({
  title,
  variant = 'primary',
  size = 'md',
  loading,
  disabled,
  left,
  haptic = true,
  className,
  onPress,
  ...props
}: ButtonProps) {
  const v = variants[variant];
  const s = sizes[size];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!isDisabled, busy: !!loading }}
      disabled={isDisabled}
      onPress={(e) => {
        if (haptic) Haptics.selectionAsync();
        onPress?.(e);
      }}
      className={cn(
        'flex-row items-center justify-center gap-2 rounded-control active:opacity-80',
        v.container,
        s.container,
        isDisabled && 'opacity-50',
        className,
      )}
      {...props}>
      {loading ? (
        <ActivityIndicator colorClassName={v.accent} />
      ) : (
        <>
          {left ? <View>{left}</View> : null}
          <Text className={cn('font-semibold', v.text, s.text)}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}
