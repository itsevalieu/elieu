import Ionicons from '@expo/vector-icons/Ionicons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { List } from 'react-native-paper';

const LINKS: { title: string; subtitle: string; path: Href }[] = [
  {
    title: 'Hobbies',
    subtitle: 'Tracking hobbies (browse public list)',
    path: '/(tabs)/more/hobbies',
  },
  {
    title: 'Recipes',
    subtitle: 'Published recipes catalogue',
    path: '/(tabs)/more/recipes',
  },
  {
    title: 'Subscribers',
    subtitle: 'Confirmed subscriber directory',
    path: '/(tabs)/more/subscribers',
  },
  {
    title: 'Settings',
    subtitle: 'Site configuration keys',
    path: '/(tabs)/more/settings',
  },
  {
    title: 'System logs',
    subtitle: 'Errors, warnings, and traces',
    path: '/(tabs)/more/system-logs',
  },
];

export default function MoreHomeScreen() {
  const router = useRouter();

  return (
    <List.Section title="Shortcuts">
      {LINKS.map((row) => (
        <List.Item
          key={row.title}
          title={row.title}
          description={row.subtitle}
          onPress={() => router.push(row.path)}
          right={() => <Ionicons name="chevron-forward" size={20} />}
        />
      ))}
    </List.Section>
  );
}
