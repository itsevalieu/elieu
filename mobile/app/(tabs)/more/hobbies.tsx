import { useQuery } from '@tanstack/react-query';
import { RefreshControl, View, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { api } from '@/lib/api';
import type { Hobby } from '@/types/index';

export default function HobbiesScreen() {
  const {
    data: hobbies,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mobile-hobbies'],
    queryFn: (): Promise<Hobby[]> => api.get('/api/hobbies'),
  });

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <FlatList
      data={hobbies ?? []}
      keyExtractor={(h) => String(h.id)}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
      renderItem={({ item: h }) => (
        <View style={{ paddingBottom: 4 }}>
          <Text variant="titleSmall" style={{ paddingHorizontal: 16, paddingTop: 12 }}>
            {h.name}
          </Text>
          <Text variant="bodySmall" style={{ paddingHorizontal: 16 }}>
            Category: {h.category}
          </Text>
          <Text variant="bodySmall" style={{ paddingHorizontal: 16, paddingBottom: 8, opacity: 0.74 }}>
            {h.entries?.length ?? 0} tracked entries · started {h.startedAt ?? 'unknown'}
          </Text>
          <Text style={{ height: 1, backgroundColor: '#ececec', opacity: 0.45 }} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={{ padding: 16, opacity: 0.7 }}>
          No hobbies returned. Create them via the desktop admin shell.
        </Text>
      }
    />
  );
}
