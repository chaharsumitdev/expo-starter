import * as Haptics from 'expo-haptics';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { Text } from '@/components/ui';

/**
 * Reanimated + Gesture Handler + worklets: the gesture and spring run on the UI thread;
 * `scheduleOnRN` hops back to JS for the haptic.
 */
export function DraggableCard({ label }: { label: string }) {
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const scale = useSharedValue(1);

  const pan = Gesture.Pan()
    .onBegin(() => {
      scale.value = withSpring(1.08);
    })
    .onChange((e) => {
      x.value += e.changeX;
      y.value += e.changeY;
    })
    .onFinalize(() => {
      x.value = withSpring(0);
      y.value = withSpring(0);
      scale.value = withSpring(1);
      scheduleOnRN(Haptics.impactAsync, Haptics.ImpactFeedbackStyle.Light);
    });

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value }, { translateY: y.value }, { scale: scale.value }],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View
        style={style}
        className="h-24 items-center justify-center self-center rounded-card bg-primary px-8">
        <Text className="font-semibold text-primary-foreground">{label}</Text>
      </Animated.View>
    </GestureDetector>
  );
}
