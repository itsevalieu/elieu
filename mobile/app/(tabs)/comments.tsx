import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useRef, useState } from 'react';
import { RefreshControl, StyleSheet, View, FlatList } from 'react-native';
import { ActivityIndicator, List, Surface, Text } from 'react-native-paper';
import { Swipeable } from 'react-native-gesture-handler';

import { api } from '@/lib/api';
import type { Comment, PagedResponse } from '@/types/index';

async function fetchPending(): Promise<PagedResponse<Comment>> {
  return api.get('/api/admin/comments?status=pending&page=0&size=100');
}

function formatWhen(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export default function CommentsScreen() {
  const queryClient = useQueryClient();

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ['admin-comments-pending-mobile'],
    queryFn: fetchPending,
  });

  const [expanded, setExpanded] = useState<number | null>(null);

  const patch = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
      return api.patch<Comment>(`/api/admin/comments/${id}`, { status });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-comments-pending-mobile'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-stats-overview-tabs'] });
    },
  });

  const rows = useMemo(() => data?.content ?? [], [data]);

  if (isLoading) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <FlatList
      data={rows}
      ListHeaderComponent={
        <>
          <Text variant="titleMedium" style={styles.introTitle}>
            Moderation queue
          </Text>
          <Text variant="bodySmall" style={styles.introSub}>
            Pull to refresh · Swipe right to expose approve · Swipe left to expose reject · Tap to expand · Release to
            act
          </Text>
        </>
      }
      keyExtractor={(c) => String(c.id)}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => void refetch()} />}
      ListEmptyComponent={<Text style={styles.empty}>No pending comments.</Text>}
      contentContainerStyle={styles.bottomPad}
      renderItem={({ item: c }) => (
        <CommentRow
          c={c}
          expanded={expanded === c.id}
          onTap={() =>
            setExpanded((prev) => {
              if (prev === c.id) return null;
              return c.id;
            })
          }
          awaiting={patch.isPending && patch.variables?.id === c.id}
          onApprove={() => patch.mutate({ id: c.id, status: 'approved' })}
          onReject={() => patch.mutate({ id: c.id, status: 'rejected' })}
        />
      )}
    />
  );
}

function CommentRow(props: {
  c: Comment;
  expanded: boolean;
  onTap: () => void;
  awaiting: boolean;
  onApprove: () => void;
  onReject: () => void;
}) {
  const { c, expanded, onTap, awaiting, onApprove, onReject } = props;
  const ref = useRef<Swipeable>(null);

  return (
    <Swipeable
      ref={ref}
      friction={2}
      overshootRight={false}
      overshootLeft={false}
      renderLeftActions={() => (
        <View style={[styles.edge, styles.approveBanner]}>
          <Text variant="titleSmall">Approve</Text>
        </View>
      )}
      renderRightActions={() => (
        <View style={[styles.edge, styles.rejectBanner]}>
          <Text variant="titleSmall" style={{ color: '#fff' }}>
            Reject
          </Text>
        </View>
      )}
      onSwipeableOpen={(direction) => {
        if (direction === 'left') {
          onApprove();
        } else {
          onReject();
        }
        ref.current?.close();
      }}
    >
      <Surface elevation={1} style={styles.card}>
        <List.Item title={c.authorName} description={`Post #${c.postId}`} onPress={onTap} />
        {expanded ? (
          <Text variant="bodyMedium" selectable style={styles.body}>
            {c.body}
          </Text>
        ) : (
          <Text variant="bodySmall" numberOfLines={2} style={[styles.preview, styles.bodyMargin]}>
            {c.body}
          </Text>
        )}
        <Text variant="labelSmall" style={styles.when}>
          {formatWhen(c.createdAt)}
        </Text>
        {awaiting ? <ActivityIndicator style={{ paddingBottom: 8 }} /> : null}
      </Surface>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  introTitle: { marginHorizontal: 16, marginTop: 12 },
  introSub: { marginHorizontal: 16, marginBottom: 8, opacity: 0.74 },
  bottomPad: { paddingBottom: 32 },
  empty: { marginHorizontal: 16, opacity: 0.7 },
  edge: {
    width: 112,
    marginVertical: 6,
    marginHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    borderRadius: 10,
    minHeight: 120,
    maxHeight: 180,
    flexShrink: 0,
    flexGrow: 0,
  },
  approveBanner: {
    backgroundColor: '#bbf7d0',
  },
  rejectBanner: {
    backgroundColor: '#b91c1c',
    marginLeft: 'auto',
  },
  card: {
    marginHorizontal: 8,
    marginVertical: 6,
    overflow: 'hidden',
    borderRadius: 12,
    paddingBottom: 8,
  },
  body: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    lineHeight: 22,
  },
  preview: {
    opacity: 0.85,
  },
  bodyMargin: { marginHorizontal: 16, marginBottom: 4 },
  when: { marginHorizontal: 16, opacity: 0.6 },
});
