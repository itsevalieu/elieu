import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Menu, SegmentedButtons, Snackbar, Text, TextInput } from 'react-native-paper';

import { api } from '@/lib/api';
import type { Post } from '@/types/index';

type PostFmt = Post['format'];
type PostStat = Post['status'];

const FORMAT_OPTIONS: PostFmt[] = [
  'article',
  'photo-caption',
  'embedded-game',
  'project-link',
  'list',
  'recipe',
  'tracking-entry',
  'quote',
];

function buildPutBody(original: Post, edits: { title: string; body: string; format: PostFmt; status: PostStat }) {
  return {
    title: edits.title,
    body: edits.body,
    excerpt: original.excerpt,
    categoryId: original.categoryId,
    subcategoryId: original.subcategoryId,
    format: edits.format,
    layoutHint: original.layoutHint,
    issueId: original.issueId,
    tags: original.tags ?? [],
    status: edits.status,
    coverImageUrl: original.coverImageUrl,
    galleryUrls: original.galleryUrls ?? [],
    videoUrl: original.videoUrl,
    videoType: original.videoType,
    quoteAuthor: original.quoteAuthor,
    quoteSource: original.quoteSource,
    gameUrl: original.gameUrl,
    gameType: original.gameType,
  };
}

export default function PostEditorScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const { id: rawId } = useLocalSearchParams<{ id?: string }>();
  const queryClient = useQueryClient();

  const id = rawId ?? '';
  const postIdNum = Number(id);

  const { data: post, isLoading, error } = useQuery({
    queryKey: ['admin-post', id],
    queryFn: (): Promise<Post> => api.get(`/api/admin/posts/${id}`),
    enabled: Number.isFinite(postIdNum) && postIdNum > 0,
  });

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [format, setFormat] = useState<PostFmt>('article');
  const [status, setStatus] = useState<PostStat>('draft');
  const [formatsOpen, setFormatsOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  useEffect(() => {
    if (!post) return;
    setTitle(post.title);
    setBody(post.body);
    setFormat(post.format);
    setStatus(post.status);
  }, [post]);

  useLayoutEffect(() => {
    navigation.setOptions({ title: post?.title?.slice(0, 42) ?? 'Edit post' });
  }, [navigation, post?.title]);

  const mutate = useMutation({
    mutationFn: async () => {
      if (!post) throw new Error('Missing post');
      const payload = buildPutBody(post, { title: title.trim(), body: body.trim(), format, status });
      return api.put<Post>(`/api/admin/posts/${post.id}`, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posts-mobile'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-post', id] });
      setSnack('Saved');
    },
    onError: () => setSnack('Save failed'),
  });

  const labelFormat = useMemo(() => FORMAT_OPTIONS.find((f) => f === format) ?? format, [format]);

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {error ? (
          <ScrollView contentContainerStyle={styles.pad}>
            <Text variant="titleMedium">Could not load this post.</Text>
            <Button onPress={() => router.back()}>Go back</Button>
          </ScrollView>
        ) : null}
        {isLoading || !post ? (
          !error ? <ActivityIndicator style={{ marginTop: 48 }} /> : null
        ) : (
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.pad}>
            <Menu visible={formatsOpen} onDismiss={() => setFormatsOpen(false)} anchor={
              <Button mode="outlined" onPress={() => setFormatsOpen(true)} compact>
                Format: {labelFormat}
              </Button>
            }>
              {FORMAT_OPTIONS.map((f) => (
                <Menu.Item
                  key={f}
                  onPress={() => {
                    setFormat(f);
                    setFormatsOpen(false);
                  }}
                  title={f}
                />
              ))}
            </Menu>

            <Text variant="labelLarge" style={styles.mt}>
              Status
            </Text>
            <SegmentedButtons
              style={styles.mt}
              value={status}
              onValueChange={(v) => setStatus(v as PostStat)}
              buttons={[
                { value: 'draft', label: 'Draft' },
                { value: 'published', label: 'Live' },
                { value: 'archived', label: 'Archived' },
              ]}
            />

            <TextInput mode="outlined" label="Title" value={title} onChangeText={setTitle} style={styles.mt} />

            <TextInput
              mode="outlined"
              label="Body"
              multiline
              style={[styles.mt, styles.body]}
              value={body}
              onChangeText={setBody}
            />

            <Text variant="labelSmall" style={{ marginTop: 8, opacity: 0.6 }}>
              {post.categoryName} · {post.slug}
            </Text>

            <Button
              mode="contained"
              style={styles.mt}
              loading={mutate.isPending}
              disabled={mutate.isPending || !title.trim() || !body.trim()}
              onPress={() => void mutate.mutateAsync()}
            >
              Save changes
            </Button>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2000}>
        {snack ?? ''}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 40 },
  body: { minHeight: 220, textAlignVertical: 'top' },
  mt: { marginTop: 12 },
});
