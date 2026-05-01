import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { RefreshControl, View, FlatList } from 'react-native';
import { ActivityIndicator, Chip, FAB, List, Text } from 'react-native-paper';

import { api } from '@/lib/api';
import type { PagedResponse, Post } from '@/types/index';

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(d);
}

async function fetchPosts(): Promise<PagedResponse<Post>> {
  return api.get('/api/admin/posts?page=0&size=50');
}

export default function PostsListScreen() {
  const router = useRouter();
  const {
    data,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-posts-mobile'],
    queryFn: fetchPosts,
  });

  if (error) {
    return (
      <List.Section>
        <Text variant="bodyLarge" style={{ padding: 16 }}>
          Could not load posts.
        </Text>
      </List.Section>
    );
  }

  if (isLoading || !data) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data.content}
        keyExtractor={(item) => String(item.id)}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
        renderItem={({ item }) => (
          <List.Item
            title={item.title}
            description={`${formatDate(item.publishedAt ?? item.updatedAt)} · ${item.categoryName}`}
            onPress={() =>
              router.push({
                pathname: '/(tabs)/posts/[id]',
                params: { id: String(item.id) },
              })
            }
            right={() => (
              <Chip mode="flat" compact style={{ alignSelf: 'center', marginRight: 8 }}>
                {item.status}
              </Chip>
            )}
          />
        )}
        ListEmptyComponent={<Text style={{ padding: 16 }}>No posts yet.</Text>}
      />
      <FAB
        icon="plus"
        style={{ position: 'absolute', margin: 16, right: 0, bottom: 0 }}
        onPress={() => router.push('/(tabs)/quick-post')}
      />
    </View>
  );
}