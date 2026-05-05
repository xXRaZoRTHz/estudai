// Mock temporário — substituir quando tiver as chaves Firebase
import { useAuthStore } from '@stores/authStore';

export function initAuthListener() {
  // Simula utilizador não autenticado
  useAuthStore.getState().setUser(null);
  useAuthStore.getState().setLoading(false);
  return () => {};
}

export async function registarComEmail(email: string, password: string) {
  // Simula registo bem sucedido
  useAuthStore.getState().setUser({ email, uid: 'mock-uid' } as any);
}

export async function loginComEmail(email: string, password: string) {
  // Simula login bem sucedido
  useAuthStore.getState().setUser({ email, uid: 'mock-uid' } as any);
}

export async function logout() {
  useAuthStore.getState().setUser(null);
}