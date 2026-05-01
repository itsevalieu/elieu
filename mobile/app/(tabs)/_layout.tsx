import Ionicons from '@expo/vector-icons/Ionicons';
import { Redirect, Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Overview = {
  pendingComments?: number;
};

async function fetchOverview(): Promise<Overview> {
  return api.get('/api/admin/stats/overview');
}

export default function TabLayout() {
  const isAuthenticated = useAuth((s) => s.isAuthenticated);

  const { data: overview } = useQuery({
    queryKey: ['admin-stats-overview-tabs'],
    queryFn: fetchOverview,
    enabled: isAuthenticated,
  });

  const pendingBadge = useMemo(() => {
    const n = overview?.pendingComments ?? 0;
    if (!n) return undefined;
    return n > 99 ? '99+' : String(n);
  }, [overview?.pendingComments]);

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: true,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="posts"
        options={{
          title: 'Posts',
          tabBarIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="quick-post"
        options={{
          title: 'Quick post',
          tabBarIcon: ({ color, size }) => <Ionicons name="add-circle-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="comments"
        options={{
          title: 'Comments',
          tabBarBadge: pendingBadge,
          tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles-outline" color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          headerShown: false,
          tabBarIcon: ({ color, size }) => <Ionicons name="menu-outline" color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
