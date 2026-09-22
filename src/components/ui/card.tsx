import { View, type ViewProps } from 'react-native';

import { cn } from '@/lib/cn';

export function Card({ className, ...props }: ViewProps) {
  return <View className={cn('gap-2 rounded-card bg-card p-4', className)} {...props} />;
}
