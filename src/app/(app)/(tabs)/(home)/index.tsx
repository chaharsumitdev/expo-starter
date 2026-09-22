import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert, Platform } from 'react-native';

import { Button, Card, Screen, Text } from '@/components/ui';
import { DraggableCard } from '@/features/demo/draggable-card';
import { useAuth } from '@/features/auth';
import { format } from '@/lib/i18n';
import StatsWidget from '@/widgets/stats-widget';

export default function HomeScreen() {
  const { t } = useTranslation();
  const user = useAuth((s) => s.user);

  const updateWidget = () => {
    StatsWidget.updateSnapshot({ title: t('tabs.home'), value: format.number(Date.now() % 1000) });
    Alert.alert(t('home.widgetUpdated'));
  };

  return (
    <Screen scroll>
      <Card>
        <Text variant="heading">{t('home.greeting', { name: user?.name ?? '👋' })}</Text>
        <Text variant="caption">{t('home.subtitle')}</Text>
        <Text variant="caption">{format.date(new Date(), { dateStyle: 'full' })}</Text>
      </Card>

      <Link href="/modal" asChild>
        <Button variant="secondary" title={t('home.openModal')} />
      </Link>
      <Link href="/item/1" asChild>
        <Button variant="outline" title={`${t('item.title')} 1`} />
      </Link>
      {Platform.OS === 'ios' ? (
        <Button variant="outline" title={t('home.updateWidget')} onPress={updateWidget} />
      ) : null}

      <Card className="gap-4">
        <Text variant="label">{t('home.animation')}</Text>
        <DraggableCard label={t('home.dragMe')} />
      </Card>
    </Screen>
  );
}
