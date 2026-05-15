import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Perfil {
  nome: string;
  email: string;
  foto: string | null;          // URI da imagem
  bio: string;
  criadoEm: number;
  insigniasDestaque: string[];  // IDs das insígnias destacadas no perfil
}

interface PerfilState {
  perfil: Perfil;
  setNome: (nome: string) => void;
  setEmail: (email: string) => void;
  setFoto: (foto: string | null) => void;
  setBio: (bio: string) => void;
  setInsigniasDestaque: (ids: string[]) => void;
}

export const usePerfilStore = create<PerfilState>()(
  persist(
    (set) => ({
      perfil: {
        nome: 'Estudante',
        email: '',
        foto: null,
        bio: '',
        criadoEm: Date.now(),
        insigniasDestaque: [],
      },
      setNome: (nome) => set(state => ({ perfil: { ...state.perfil, nome } })),
      setEmail: (email) => set(state => ({ perfil: { ...state.perfil, email } })),
      setFoto: (foto) => set(state => ({ perfil: { ...state.perfil, foto } })),
      setBio: (bio) => set(state => ({ perfil: { ...state.perfil, bio } })),
      setInsigniasDestaque: (insigniasDestaque) =>
        set(state => ({ perfil: { ...state.perfil, insigniasDestaque } })),
    }),
    {
      name: 'perfil-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);