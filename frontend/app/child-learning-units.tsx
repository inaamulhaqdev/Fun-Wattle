import ChildLearningUnits from '@/components/child/ChildLearningUnits';
import { Stack } from 'expo-router';

export default function ChildLearningUnitsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ChildLearningUnits />
    </>
  );
}
