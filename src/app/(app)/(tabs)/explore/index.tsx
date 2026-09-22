import { FlashList } from '@shopify/flash-list';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, Pressable, RefreshControl, View } from 'react-native';

import { Button, Text } from '@/components/ui';
import { itemQueries } from '@/features/items/api';
import { getErrorMessage } from '@/lib/errors';

export default function ExploreScreen() {
  const { t } = useTranslation();
  const { data, isPending, error, refetch, isRefetching } = useQuery(itemQueries.list());

  if (isPending) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator colorClassName="accent-primary" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
        <Text className="text-center">{getErrorMessage(error)}</Text>
        <Button title={t('common.retry')} onPress={() => refetch()} />
      </View>
    );
  }

  return (
    <FlashList
      data={data}
      className="bg-background"
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ padding: 16 }}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      ItemSeparatorComponent={() => <View className="h-3" />}
      ListEmptyComponent={<Text variant="caption">{t('explore.empty')}</Text>}
      renderItem={({ item }) => (
        <Link href={{ pathname: '/item/[id]', params: { id: item.id } }} asChild>
          <Pressable className="gap-1 rounded-card bg-card p-4 active:opacity-70">
            <Text variant="label">{item.title}</Text>
            <Text variant="caption" numberOfLines={2}>
              {item.description}
            </Text>
          </Pressable>
        </Link>
      )}
    />
  );
}
