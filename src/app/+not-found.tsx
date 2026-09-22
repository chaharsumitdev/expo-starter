import { Link, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { Screen, Text } from '@/components/ui';

export default function NotFoundScreen() {
  const { t } = useTranslation();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!', headerShown: true }} />
      <Screen contentClassName="items-center justify-center">
        <Text variant="heading">{t('errors.notFound')}</Text>
        <Link href="/" className="text-base text-primary">
          {t('errors.goHome')}
        </Link>
      </Screen>
    </>
  );
}
