import { FlashList } from '@shopify/flash-list';
import { getLocales } from 'expo-localization';
import {
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js/min';
import { useMemo, useState } from 'react';
import { Modal, Pressable, TextInput, View } from 'react-native';

import { cn } from '@/lib/cn';

import { Input } from './input';
import { Text } from './text';

const flag = (country: string) =>
  String.fromCodePoint(...[...country.toUpperCase()].map((c) => 0x1f1a5 + c.charCodeAt(0)));

const COUNTRIES = getCountries().map((code) => ({
  code,
  dial: `+${getCountryCallingCode(code)}`,
}));

/** Country from the device region, falling back to `fallback`. */
export function getDefaultCountry(fallback: CountryCode): CountryCode {
  const region = getLocales()[0]?.regionCode as CountryCode | null;
  return region && COUNTRIES.some((c) => c.code === region) ? region : fallback;
}

type PhoneInputProps = {
  country: CountryCode;
  onCountryChange: (country: CountryCode) => void;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  placeholder?: string;
  autoFocus?: boolean;
};

export function PhoneInput({
  country,
  onCountryChange,
  value,
  onChangeText,
  error,
  placeholder,
  autoFocus,
}: PhoneInputProps) {
  const [pickerOpen, setPickerOpen] = useState(false);

  return (
    <View className="gap-1.5">
      <View className="flex-row gap-2" style={{ direction: 'ltr' }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Country code"
          onPress={() => setPickerOpen(true)}
          className={cn(
            'h-12 flex-row items-center gap-1 rounded-control border border-input bg-background px-3',
            error && 'border-destructive',
          )}>
          <Text>{flag(country)}</Text>
          <Text>+{getCountryCallingCode(country)}</Text>
        </Pressable>
        <View className="flex-1">
          <TextInput
            value={value}
            onChangeText={(text) => onChangeText(new AsYouType(country).input(text))}
            keyboardType="phone-pad"
            textContentType="telephoneNumber"
            autoComplete="tel"
            autoFocus={autoFocus}
            placeholder={placeholder}
            placeholderTextColorClassName="accent-muted-foreground"
            className={cn(
              'h-12 rounded-control border border-input bg-background px-4 text-base text-foreground',
              error && 'border-destructive',
            )}
          />
        </View>
      </View>
      {error ? <Text variant="error">{error}</Text> : null}
      <CountryPicker
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(c) => {
          onCountryChange(c);
          setPickerOpen(false);
        }}
      />
    </View>
  );
}

function CountryPicker({
  visible,
  onClose,
  onSelect,
}: {
  visible: boolean;
  onClose: () => void;
  onSelect: (country: CountryCode) => void;
}) {
  const [query, setQuery] = useState('');
  const data = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter((c) => c.code.toLowerCase().includes(q) || c.dial.includes(q));
  }, [query]);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}>
      <View className="flex-1 gap-3 bg-background p-4">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="Search (e.g. IN, +91)"
          autoCorrect={false}
        />
        <FlashList
          data={data}
          keyExtractor={(c) => c.code}
          keyboardShouldPersistTaps="handled"
          renderItem={({ item }) => (
            <Pressable
              onPress={() => onSelect(item.code)}
              className="flex-row items-center gap-3 border-b border-border py-3 active:opacity-60">
              <Text>{flag(item.code)}</Text>
              <Text className="flex-1">{item.code}</Text>
              <Text variant="caption">{item.dial}</Text>
            </Pressable>
          )}
        />
      </View>
    </Modal>
  );
}
