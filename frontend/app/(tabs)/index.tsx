import { useEffect } from 'react';
import { router } from 'expo-router';

export default function HomeScreen() {
  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace('/parent/homescreen');
    }, 0);
    return () => clearTimeout(timeout);
  }, []);

  return null;
}