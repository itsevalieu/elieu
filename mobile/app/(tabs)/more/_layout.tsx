import { Stack } from 'expo-router';

export default function MoreStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'More', headerShown: true }} />
      <Stack.Screen name="hobbies" options={{ title: 'Hobbies' }} />
      <Stack.Screen name="recipes" options={{ title: 'Recipes' }} />
      <Stack.Screen name="subscribers" options={{ title: 'Subscribers' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings' }} />
      <Stack.Screen name="system-logs" options={{ title: 'System logs' }} />
    </Stack>
  );
}
