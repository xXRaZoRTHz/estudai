import { Stack } from 'expo-router';
import 'react-native-gesture-handler';

export default function FlashcardsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }} />
  );
}