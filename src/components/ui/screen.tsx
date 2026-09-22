import { Platform, View, type ViewProps } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { type Edge, SafeAreaView } from 'react-native-safe-area-context';
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
  if (scroll) {
    const content = (
      <StyledKeyboardScroll
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
        bottomOffset={24}
        className={cn('flex-1 bg-background', className)}
        contentContainerClassName={cn('grow gap-4 p-5', contentClassName)}
        {...props}>
        {children}
      </StyledKeyboardScroll>
    );
    // iOS: the scroll view must be the screen's root so native large titles collapse with it,
    // and `contentInsetAdjustmentBehavior` handles the safe area and header.
    // Android: the native SafeAreaView pads only what actually overlaps the system bars
    // (nothing under a header), so `edges` is safe to pass either way.
    if (Platform.OS === 'ios') return content;
    return (
      <StyledSafeAreaView edges={edges} className="flex-1 bg-background">
        {content}
      </StyledSafeAreaView>
    );
  }

  return (
    <StyledSafeAreaView edges={edges} className={cn('flex-1 bg-background', className)} {...props}>
      <View className={cn('flex-1 gap-4 p-5', contentClassName)}>{children}</View>
    </StyledSafeAreaView>
  );
}
