import { useTranslation } from 'react-i18next';

import { Screen, Text } from '@/components/ui';

export default function ModalScreen() {
  const { t } = useTranslation();
  return (
    <Screen contentClassName="pt-8">
      <Text variant="heading">{t('modal.title')}</Text>
      <Text variant="caption">{t('modal.body')}</Text>
    </Screen>
  );
}
