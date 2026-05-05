import { useEffect } from 'react';
import { Slot, useRouter, useSegments } from 'expo-router';
import { useAuthStore } from '@stores/authStore';
import { initAuthListener } from '@services/auth';

export default function RootLayout() {
  const { user, isLoading } = useAuthStore();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const unsubscribe = initAuthListener();
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isLoading) return;
    const inAuthGroup = segments[0] === '(auth)';
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)/estudar');
    }
  }, [user, isLoading]);

  if (isLoading) return null;

  return <Slot />;
}