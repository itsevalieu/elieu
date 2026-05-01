import { Stack } from 'expo-router';

export default function PostsStackLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Posts', headerShown: true }} />
      <Stack.Screen name="[id]" options={{ title: 'Edit post', headerShown: true }} />
    </Stack>
  );
}
