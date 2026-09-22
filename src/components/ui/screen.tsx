import { Platform, View, type ViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { type Edge, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

import { cn } from '@/lib/cn';

const StyledSafeAreaView = withUniwind(SafeAreaView);
const StyledKeyboardScroll = withUniwind(KeyboardAwareScrollView);

type ScreenProps = ViewProps & {
  /** Scrolls and keeps the focused input above the keyboard. */
  scroll?: boolean;
  /** Safe-area edges to pad. Screens under a native header/tab bar usually need none. */
  edges?: Edge[];
  contentClassName?: string;
};

/** Base container for every screen: background, safe area, optional keyboard-aware scroll. */
export function Screen({
  scroll,
  edges = [],
  className,
  contentClassName,
  children,
  ...props
}: ScreenProps) {
  const insets = useSafeAreaInsets();

  if (scroll) {
    // The scroll view must be the screen's root so native large titles collapse with it.
    // iOS insets it automatically; Android needs explicit padding.
    const pad = Platform.OS !== 'ios';
    return (
      <StyledKeyboardScroll
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        className={cn('flex-1 bg-background', className)}
        contentContainerStyle={{
          ...(pad && edges.includes('top') && { paddingTop: insets.top + 20 }),
          ...(pad && edges.includes('bottom') && { paddingBottom: insets.bottom + 20 }),
        }}
        contentContainerClassName={cn('grow gap-4 p-5', contentClassName)}
        {...props}>
        {children}
      </StyledKeyboardScroll>
    );
  }

  return (
    <StyledSafeAreaView edges={edges} className={cn('flex-1 bg-background', className)} {...props}>
      <View className={cn('flex-1 gap-4 p-5', contentClassName)}>{children}</View>
    </StyledSafeAreaView>
  );
}
