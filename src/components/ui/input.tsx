import { TextInput, type TextInputProps, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './text';

export type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  className?: string;
  ref?: React.Ref<TextInput>;
};

export function Input({ label, error, className, ...props }: InputProps) {
  return (
    <View className="gap-1.5">
      {label ? <Text variant="label">{label}</Text> : null}
      <TextInput
        placeholderTextColorClassName="accent-muted-foreground"
        cursorColorClassName="accent-primary"
        className={cn(
          'h-12 rounded-control border border-input bg-background px-4 text-base text-foreground',
          error && 'border-destructive',
          className,
        )}
        {...props}
      />
      {error ? <Text variant="error">{error}</Text> : null}
    </View>
  );
}
