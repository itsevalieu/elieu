import { useQuery } from '@tanstack/react-query';
import { RefreshControl, View, FlatList } from 'react-native';
import { ActivityIndicator, Chip, Text } from 'react-native-paper';

import { api } from '@/lib/api';
import type { PagedResponse } from '@/types/index';

type SubscriberRow = {
  id: number;
  email: string;
  displayName: string | null;
  status: string;
  confirmedAt?: string | null;
  createdAt?: string;
};

export default function SubscribersScreen() {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mobile-subscribers'],
    queryFn: (): Promise<PagedResponse<SubscriberRow>> => api.get('/api/admin/subscribers?page=0&size=40'),
  });

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  const rows = data?.content ?? [];

  return (
    <FlatList
      data={rows}
      keyExtractor={(row) => String(row.id)}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
      renderItem={({ item: s }) => (
        <View style={{ paddingBottom: 8 }}>
          <Text variant="titleSmall" style={{ paddingHorizontal: 16, paddingTop: 14 }}>
            {s.email}
          </Text>
          <Text variant="bodySmall" style={{ paddingHorizontal: 16 }}>
            {s.displayName ?? '(no display name)'}
          </Text>
          <Chip mode="flat" compact style={{ alignSelf: 'flex-start', marginHorizontal: 16, marginTop: 4 }}>
            {s.status}
          </Chip>
          <Text variant="bodySmall" style={{ paddingHorizontal: 16, paddingVertical: 6, opacity: 0.64 }}>
            {s.confirmedAt ? `Confirmed ${new Date(s.confirmedAt).toLocaleString()}` : 'Pending confirmation'}
          </Text>
          <Text style={{ height: 1, backgroundColor: '#ececec', opacity: 0.35 }} />
        </View>
      )}
      ListEmptyComponent={<Text style={{ padding: 16, opacity: 0.72 }}>No subscribers yet.</Text>}
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}
