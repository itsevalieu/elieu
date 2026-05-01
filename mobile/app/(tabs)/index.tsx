import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Card, Text } from 'react-native-paper';

import { api } from '@/lib/api';

type RecentActivityRow = {
  id: number;
  action: string;
  entityType: string;
  entityId: number | null;
  description: string;
  performedAt: string;
};

type DashboardOverview = {
  postsByStatus: Record<string, number>;
  totalSubscribersConfirmed: number;
  pendingComments: number;
  recentActivity: RecentActivityRow[];
};

function formatRelative(iso: string): string {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const days = Math.floor(hr / 24);
  return `${days}d ago`;
}

export default function DashboardScreen() {
  const router = useRouter();

  const {
    data: overview,
    error,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['admin-stats-overview-dashboard'],
    queryFn: (): Promise<DashboardOverview> => api.get('/api/admin/stats/overview'),
  });

  if (error) {
    return (
      <View style={styles.center}>
        <Text variant="titleMedium">Could not load overview</Text>
        <Text variant="bodySmall" style={styles.dim}>
          Pull down to retry once the API is reachable.
        </Text>
      </View>
    );
  }

  if (isLoading || !overview) {
    return (
      <View style={styles.center}>
        <ActivityIndicator />
      </View>
    );
  }

  const published = overview.postsByStatus?.published ?? 0;
  const subscribers = overview.totalSubscribersConfirmed ?? 0;
  const pending = overview.pendingComments ?? 0;
  const recentFive = (overview.recentActivity ?? []).slice(0, 5);

  return (
    <ScrollView
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
    >
      <Text variant="headlineSmall" style={styles.headline}>
        Dashboard
      </Text>

      <View style={styles.statRow}>
        <Card mode="elevated" style={styles.statCard}>
          <Card.Title title={`${published}`} subtitle="Published posts" />
        </Card>
        <Card mode="elevated" style={styles.statCard}>
          <Card.Title title={`${subscribers}`} subtitle="Subscribers" />
        </Card>
        <Card mode="elevated" style={styles.statCard}>
          <Card.Title title={`${pending}`} subtitle="Pending comments" />
        </Card>
      </View>

      <Text variant="titleMedium" style={styles.section}>
        Quick actions
      </Text>
      <Card
        mode="outlined"
        style={styles.actionCard}
        onPress={() => router.push('/(tabs)/posts')}
      >
        <Card.Title title="New post" subtitle="Open posts list · full editor inside" />
      </Card>
      <Card
        mode="outlined"
        style={styles.actionCard}
        onPress={() => router.push('/(tabs)/quick-post')}
      >
        <Card.Title title="Quick hobby / thought" subtitle="Minimal composer with optional photo" />
      </Card>
      <Card
        mode="outlined"
        style={styles.actionCard}
        onPress={() => router.push('/(tabs)/more/hobbies')}
      >
        <Card.Title title="New hobby entry" subtitle="Tracked hobbies from your phone" />
      </Card>
      <Card
        mode="outlined"
        style={styles.actionCard}
        onPress={() => router.push('/(tabs)/more/recipes')}
      >
        <Card.Title title="New recipe" subtitle="Recipes admin list" />
      </Card>

      <Text variant="titleMedium" style={styles.section}>
        Recent activity
      </Text>
      {recentFive.length === 0 ? (
        <Text variant="bodyMedium" style={styles.dim}>
          No audit entries yet.
        </Text>
      ) : (
        recentFive.map((row) => {
          const line = row.description ?? `${row.action} · ${row.entityType}`;
          return (
            <Card key={row.id} mode="outlined" style={styles.activity}>
              <Card.Content>
                <Text variant="bodyMedium">{line}</Text>
                <Text variant="labelSmall" style={styles.dim}>
                  {formatRelative(row.performedAt)}
                </Text>
              </Card.Content>
            </Card>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 16, paddingBottom: 32 },
  headline: { marginBottom: 16 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  statRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  statCard: { flexGrow: 1, flexBasis: '30%', minWidth: 100 },
  section: { marginTop: 8, marginBottom: 12 },
  actionCard: { marginBottom: 8 },
  activity: { marginBottom: 8 },
  dim: { opacity: 0.7, marginTop: 4 },
});
