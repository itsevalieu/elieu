import { useQuery } from '@tanstack/react-query';
import { RefreshControl, FlatList } from 'react-native';
import { ActivityIndicator, Surface, Text } from 'react-native-paper';

import { api } from '@/lib/api';
import type { PagedResponse, SystemLog } from '@/types/index';

async function fetchLogs(): Promise<PagedResponse<SystemLog>> {
  return api.get('/api/admin/system-logs?page=0&size=50');
}

export default function SystemLogsScreen() {
  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['mobile-admin-system-logs'],
    queryFn: fetchLogs,
  });

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  const rows = data?.content ?? [];

  return (
    <FlatList
      data={rows}
      keyExtractor={(r) => String(r.id)}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
      renderItem={({ item: log }) => (
        <Surface style={{ marginHorizontal: 12, marginVertical: 6 }} elevation={1}>
          <Text variant="titleSmall" style={{ padding: 14, paddingBottom: 4 }}>
            {log.service} · {log.severity}
          </Text>
          <Text variant="bodyMedium" selectable style={{ paddingHorizontal: 14 }}>
            {log.message}
          </Text>
          {log.endpoint ? (
            <Text variant="bodySmall" style={{ paddingHorizontal: 14 }}>
              Endpoint: {log.endpoint}
            </Text>
          ) : null}
          <Text variant="labelSmall" style={{ paddingHorizontal: 14, paddingBottom: 10, opacity: 0.64 }}>
            {new Date(log.loggedAt).toLocaleString()}
          </Text>
        </Surface>
      )}
      ListEmptyComponent={<Text style={{ padding: 16, opacity: 0.74 }}>No log entries matched.</Text>}
      contentContainerStyle={{ paddingVertical: 8, paddingBottom: 32 }}
    />
  );
}
