import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ActivityIndicator, Button, Snackbar, Text, TextInput } from 'react-native-paper';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

export default function SettingsScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const logout = useAuth((s) => s.logout);
  const [snack, setSnack] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['mobile-admin-settings'],
    queryFn: (): Promise<Record<string, string>> => api.get('/api/admin/settings'),
  });

  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const seeded = useRef(false);

  useEffect(() => {
    if (data && !seeded.current) {
      setDrafts({ ...data });
      seeded.current = true;
    }
  }, [data]);

  const save = useMutation({
    mutationFn: () => api.put('/api/admin/settings', drafts),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['mobile-admin-settings'] });
      setSnack('Settings saved');
    },
    onError: () => setSnack('Unable to save'),
  });

  const keys = useMemo(() => Object.keys(drafts).sort((a, b) => a.localeCompare(b)), [drafts]);

  if (isLoading || !data) {
    return <ActivityIndicator style={{ marginTop: 32 }} />;
  }

  return (
    <>
      <ScrollView contentContainerStyle={styles.pad}>
        <Text variant="bodySmall" style={styles.intro}>
          Values come from `/api/admin/settings`; complex validation stays in the desktop admin workspace.
        </Text>
        {keys.map((k) => (
          <TextInput
            key={k}
            mode="outlined"
            label={k}
            value={drafts[k] ?? ''}
            onChangeText={(v) => setDrafts((prev) => ({ ...prev, [k]: v }))}
            style={{ marginBottom: 12 }}
            multiline
          />
        ))}
        <Button mode="contained" loading={save.isPending} onPress={() => void save.mutateAsync()} disabled={!keys.length}>
          Save settings
        </Button>
        <Button
          mode="outlined"
          style={{ marginTop: 12 }}
          buttonColor="#fee2e2"
          textColor="#991b1b"
          onPress={async () => {
            await logout();
            router.replace('/login');
          }}
        >
          Sign out from this phone
        </Button>
      </ScrollView>
      <Snackbar visible={!!snack} onDismiss={() => setSnack(null)} duration={2000}>
        {snack ?? ''}
      </Snackbar>
    </>
  );
}

const styles = StyleSheet.create({
  pad: { padding: 16, paddingBottom: 32 },
  intro: { marginBottom: 16, opacity: 0.7 },
});
