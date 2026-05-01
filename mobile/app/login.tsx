import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const isAuthenticated = useAuth((s) => s.isAuthenticated);
  const login = useAuth((s) => s.login);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit() {
    setError(null);
    setBusy(true);
    try {
      await login(email, password);
      router.replace('/(tabs)');
    } catch {
      setError('Could not sign in. Check your email and password.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}
      >
        <Text variant="headlineMedium" style={styles.title}>
          Eva&apos;s Admin
        </Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Sign in to manage the newsletter from your phone.
        </Text>
        <TextInput
          mode="outlined"
          label="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          style={styles.field}
          disabled={busy}
        />
        <TextInput
          mode="outlined"
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoComplete="password"
          style={styles.field}
          disabled={busy}
        />
        {error ? (
          <HelperText type="error" visible padding="none">
            {error}
          </HelperText>
        ) : null}
        <Button mode="contained" onPress={onSubmit} loading={busy} disabled={busy} style={styles.button}>
          Sign in
        </Button>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, padding: 24 },
  flex: { flex: 1, justifyContent: 'center', maxWidth: 420, width: '100%', alignSelf: 'center' },
  title: { marginBottom: 8 },
  subtitle: { opacity: 0.75, marginBottom: 24 },
  field: { marginBottom: 12 },
  button: { marginTop: 8 },
});
