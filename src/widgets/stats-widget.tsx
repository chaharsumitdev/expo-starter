import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle } from '@expo/ui/swift-ui/modifiers';
import { createWidget, type WidgetEnvironment } from 'expo-widgets';

type StatsWidgetProps = {
  title: string;
  value: string;
};

/**
 * iOS home screen widget. The name must match `widgets[].name` in app.config.ts.
 * Update it from the app with StatsWidget.updateSnapshot({...}).
 */
const StatsWidget = (props: StatsWidgetProps, environment: WidgetEnvironment) => {
  'widget';
  return (
    <VStack>
      <Text modifiers={[font({ size: 13 }), foregroundStyle('#8E8E93')]}>{props.title}</Text>
      <Text
        modifiers={[
          font({ weight: 'bold', size: environment.widgetFamily === 'systemSmall' ? 28 : 36 }),
        ]}>
        {props.value}
      </Text>
    </VStack>
  );
};

export default createWidget('StatsWidget', StatsWidget);
