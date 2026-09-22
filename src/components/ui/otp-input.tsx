import { useRef } from 'react';
import { Platform, Pressable, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Text } from './text';

type OtpInputProps = {
  value: string;
  onChange: (value: string) => void;
  /** Called once all digits are entered. */
  onComplete?: (value: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
};

/**
 * One hidden TextInput rendered as boxes: keeps OS SMS/email code autofill and paste working.
 * Digit order stays LTR in RTL languages, as users expect for codes.
 */
export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  error,
  autoFocus = true,
}: OtpInputProps) {
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityRole="none">
      <View className="flex-row justify-between gap-2" style={{ direction: 'ltr' }}>
        {Array.from({ length }, (_, i) => {
          const focused = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              className={cn(
                'h-14 flex-1 items-center justify-center rounded-control border border-input bg-card',
                focused && 'border-primary',
                error && 'border-destructive',
              )}>
              <Text variant="heading">{value[i] ?? ''}</Text>
            </View>
          );
        })}
      </View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => {
          const digits = text.replace(/\D/g, '').slice(0, length);
          onChange(digits);
          if (digits.length === length) onComplete?.(digits);
        }}
        maxLength={length}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
        autoFocus={autoFocus}
        caretHidden
        accessibilityLabel="Verification code"
        className="absolute inset-0 opacity-0"
      />
    </Pressable>
  );
}
