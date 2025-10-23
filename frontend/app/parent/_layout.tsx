import { Stack } from 'expo-router';
import { ChildProvider } from '@/context/ChildContext';

export default function ParentLayout() {
  return (
    <ChildProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </ChildProvider>
  );
}
