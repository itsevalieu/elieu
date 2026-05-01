import { useQuery } from '@tanstack/react-query';
import { RefreshControl, View, FlatList } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { api } from '@/lib/api';
import type { PagedResponse, Recipe } from '@/types/index';

export default function RecipesScreen() {
  const {
    data,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['mobile-recipes'],
    queryFn: (): Promise<PagedResponse<Recipe>> => api.get('/api/recipes?page=0&size=50'),
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
      renderItem={({ item: r }) => {
        const bits = Array.isArray(r.ingredients)
          ? r.ingredients.slice(0, 3).join(', ') + (r.ingredients.length > 3 ? '…' : '')
          : '';

        return (
          <View>
            <Text variant="titleSmall" style={{ paddingHorizontal: 16, paddingTop: 14 }}>
              {r.name}
            </Text>
            <Text variant="bodySmall" style={{ paddingHorizontal: 16 }}>
              {bits}
            </Text>
            <Text variant="bodySmall" style={{ paddingHorizontal: 16, paddingBottom: 8, opacity: 0.74 }}>
              {r.cookTime ? `${r.cookTime} · ` : ''}
              {typeof r.rating === 'number' ? `★ ${r.rating}` : 'Unrated'}
            </Text>
            <Text style={{ height: 1, backgroundColor: '#ececec', opacity: 0.35 }} />
          </View>
        );
      }}
      ListEmptyComponent={
        <Text style={{ padding: 16, opacity: 0.7 }}>No recipes yet — add them via the newsletter admin UI.</Text>
      }
      contentContainerStyle={{ paddingBottom: 32 }}
    />
  );
}
