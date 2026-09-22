import { queryOptions } from '@tanstack/react-query';

import { api, endpoints } from '@/lib/api';

export type Item = { id: string; title: string; description: string };

/**
 * Query key factory + options: the pattern to copy for every feature.
 * Use with useQuery(itemQueries.list()) and invalidate via itemQueries.all.
 */
export const itemQueries = {
  all: ['items'] as const,
  list: () =>
    queryOptions({
      queryKey: [...itemQueries.all, 'list'],
      queryFn: ({ signal }) => api.get<Item[]>(endpoints.items.list, { signal }),
    }),
  detail: (id: string) =>
    queryOptions({
      queryKey: [...itemQueries.all, 'detail', id],
      queryFn: ({ signal }) => api.get<Item>(endpoints.items.detail(id), { signal }),
    }),
};
