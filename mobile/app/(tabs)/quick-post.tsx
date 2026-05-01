import * as ImagePicker from 'expo-image-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import {
  Button,
  Chip,
  IconButton,
  Menu,
  SegmentedButtons,
  Snackbar,
  Text,
  TextInput,
} from 'react-native-paper';

import { api } from '@/lib/api';
import type { Category, Post } from '@/types/index';

type PostFmt = Post['format'];
type PostStat = Post['status'];

const FORMAT_OPTIONS: PostFmt[] = [
  'article',
  'photo-caption',
  'list',
  'tracking-entry',
  'quote',
  'recipe',
];

function guessMime(uri: string): string {
  const lower = uri.split('?')[0].toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.heic') || lower.endsWith('.heif')) return 'image/heic';
  return 'image/jpeg';
}

async function uploadImageFromUri(uri: string, mime: string): Promise<string> {
  const ext = mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : mime.includes('heic') ? 'heic' : 'jpg';
  const presigned = await api.post<{ uploadUrl: string; objectUrl: string }>('/api/admin/media/presign', {
    filename: `mobile-${Date.now()}.${ext}`,
    contentType: mime,
  });

  const imageRes = await fetch(uri);
  const blob = await imageRes.blob();
  const putRes = await fetch(presigned.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': mime },
    body: blob,
  });

  if (!putRes.ok) {
    throw new Error('Upload failed');
  }
  return presigned.objectUrl;
}

export default function QuickPostScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['categories-public'],
    queryFn: (): Promise<Category[]> => api.get('/api/categories'),
  });

  const primaryCategoryId = categories?.[0]?.id ?? null;

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [format, setFormat] = useState<PostFmt>('article');
  const [status, setStatus] = useState<PostStat>('draft');
  const [coverUri, setCoverUri] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [formatsOpen, setFormatsOpen] = useState(false);
  const [snack, setSnack] = useState<string | null>(null);

  const create = useMutation({
    mutationFn: async (publish: boolean) => {
      const statusToUse: PostStat = publish ? 'published' : status;
      if (!primaryCategoryId) {
        throw new Error('No categories available from the API.');
      }
      let coverUrl: string | null = null;
      if (coverUri) {
        coverUrl = await uploadImageFromUri(coverUri, guessMime(coverUri));
      }

      const payload = {
        title: title.trim(),
        body: body.trim(),
        excerpt: null,
        categoryId: primaryCategoryId,
        subcategoryId: null as number | null,
        format,
        layoutHint: 'column' as Post['layoutHint'],
        issueId: null as number | null,
        tags: [] as string[],
        status: statusToUse,
        coverImageUrl: coverUrl,
        galleryUrls: coverUrl ? [coverUrl] : ([] as string[]),
        videoUrl: null,
        videoType: null,
        quoteAuthor: null,
        quoteSource: null,
        gameUrl: null,
        gameType: null,
      };

      return api.post<Post>('/api/admin/posts', payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-posts-mobile'] });
      setSnack('Post created');
      router.push('/(tabs)/posts');
    },
    onError: (e: Error) => setSnack(e.message || 'Could not create'),
  });

  async function pickFromLibrary() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      setSnack('Photos permission is required');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
    });
    const asset = res.canceled ? undefined : res.assets?.[0];
    if (asset?.uri) setCoverUri(asset.uri);
  }

  async function takePhoto() {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      setSnack('Camera permission is required');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      quality: 0.85,
    });
    const asset = res.canceled ? undefined : res.assets?.[0];
    if (asset?.uri) setCoverUri(asset.uri);
  }

  function openImageSource() {
    Alert.alert('Photo', 'Attach a cover image for this note', [
      { text: 'Camera', onPress: () => void takePhoto() },
      { text: 'Library', onPress: () => void pickFromLibrary() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  return (
    <>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.pad} keyboardShouldPersistTaps="handled">
          <Text variant="titleMedium">Quick composer</Text>
          <Text variant="bodySmall" style={styles.help}>
            Short posts on the go. Uses your first taxonomy category ({categories?.[0]?.name ?? 'loading…'})
            {' · '}uploads images through a presigned S3 PUT.
          </Text>

          <Menu
            visible={formatsOpen}
            onDismiss={() => setFormatsOpen(false)}
            anchor={
              <Button mode="outlined" onPress={() => setFormatsOpen(true)} style={styles.row}>
                Format: {format}
              </Button>
            }
          >
            {FORMAT_OPTIONS.map((f) => (
              <Menu.Item
                key={f}
                title={f}
                onPress={() => {
                  setFormat(f);
                  setFormatsOpen(false);
                }}
              />
            ))}
          </Menu>

          <Text variant="labelLarge" style={styles.mt}>
            Status for save (optional before publish below)
          </Text>
          <SegmentedButtons
            value={status}
            style={styles.mt}
            buttons={[
              { value: 'draft', label: 'Draft' },
              { value: 'published', label: 'Published' },
            ]}
            onValueChange={(v) => setStatus(v as PostStat)}
          />

          <TextInput label="Title" mode="outlined" value={title} onChangeText={setTitle} style={styles.mt} />

          <TextInput
            label="Body"
            mode="outlined"
            multiline
            value={body}
            onChangeText={setBody}
            style={[styles.mt, styles.body]}
          />

          <Text variant="labelLarge" style={styles.mt}>
            Photo (optional)
          </Text>
          <IconButton icon="camera" mode="contained-tonal" size={36} style={styles.row} onPress={openImageSource} />
          {coverUri ? (
            <Chip icon="check" style={styles.row}>
              Attached
            </Chip>
          ) : null}

          <Button
            mode="contained"
            loading={busy}
            disabled={
              busy ||
              create.isPending ||
              !primaryCategoryId ||
              !title.trim() ||
              !body.trim()
            }
            style={styles.mt}
            onPress={() => {
              setBusy(true);
              void create
                .mutateAsync(false)
                .finally(() => setBusy(false));
            }}
          >
            Save as {status === 'published' ? 'published' : 'draft'}
          </Button>

          <Button
            mode="outlined"
            loading={busy}
            disabled={
              busy ||
              create.isPending ||
              !primaryCategoryId ||
              !title.trim() ||
              !body.trim()
            }
            style={styles.mt}
            onPress={() => {
              setBusy(true);
              void create
                .mutateAsync(true)
                .finally(() => setBusy(false));
            }}
          >
            Quick publish now
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2600}>
        {snack ?? ''}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 48 },
  help: { opacity: 0.7, marginTop: 4, marginBottom: 16 },
  body: { minHeight: 180, textAlignVertical: 'top' },
  row: { alignSelf: 'flex-start', marginTop: 8 },
  mt: { marginTop: 12 },
});
