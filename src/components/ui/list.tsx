import { Pressable, View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './text';

/** Grouped settings-style section. */
export function Section({ title, className, children, ...props }: ViewProps & { title?: string }) {
  return (
    <View className={cn('gap-2', className)} {...props}>
      {title ? (
        <Text variant="caption" className="px-1 uppercase">
          {title}
        </Text>
      ) : null}
      <View className="overflow-hidden rounded-card bg-card">{children}</View>
    </View>
  );
}

type RowProps = {
  title: string;
  value?: string;
  onPress?: () => void;
  selected?: boolean;
  destructive?: boolean;
  right?: React.ReactNode;
};

export function Row({ title, value, onPress, selected, destructive, right }: RowProps) {
  return (
    <Pressable
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityState={selected !== undefined ? { selected } : undefined}
      className="min-h-12 flex-row items-center gap-3 border-b border-border px-4 py-3 active:bg-muted">
      <Text className={cn('flex-1', destructive && 'text-destructive')}>{title}</Text>
      {value ? <Text variant="caption">{value}</Text> : null}
      {selected ? <Text className="text-primary">✓</Text> : null}
      {right}
    </Pressable>
  );
}
