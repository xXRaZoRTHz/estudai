import AsyncStorage from '@react-native-async-storage/async-storage';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';

export function persistStore<T>(name: string): PersistOptions<T> {
  return {
    name,
    storage: createJSONStorage(() => AsyncStorage),
  };
}