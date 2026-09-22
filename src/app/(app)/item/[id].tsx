import { useQuery } from '@tanstack/react-query';
import { Stack, useLocalSearchParams } from 'expo-router';
import { ActivityIndicator } from 'react-native';

import { Screen, Text } from '@/components/ui';
import { itemQueries } from '@/features/items/api';
import { getErrorMessage } from '@/lib/errors';

/** Dynamic route, also reachable by deep link: <scheme>://item/42 */
export default function ItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, error } = useQuery(itemQueries.detail(id));

  return (
    <Screen scroll>
      <Stack.Screen options={{ title: data?.title ?? '' }} />
      {isPending ? <ActivityIndicator colorClassName="accent-primary" /> : null}
      {error ? <Text variant="error">{getErrorMessage(error)}</Text> : null}
      {data ? (
        <>
          <Text variant="title">{data.title}</Text>
          <Text>{data.description}</Text>
        </>
      ) : null}
    </Screen>
  );
}
