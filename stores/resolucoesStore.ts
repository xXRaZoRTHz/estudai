import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PassoResolucao {
  numero: number;
  titulo: string;
  explicacao: string;
}

export interface Resolucao {
  id: string;
  titulo: string;
  questao: string;
  passos: PassoResolucao[];
  respostaFinal: string;
  fonte: 'texto' | 'camera';
  criadoEm: number;
}

interface ResolucoesState {
  resolucoes: Resolucao[];
  criarResolucao: (dados: Omit<Resolucao, 'id' | 'criadoEm'>) => string;
  apagarResolucao: (id: string) => void;
  apagarTodas: () => void;
}

export const useResolucoesStore = create<ResolucoesState>()(
  persist(
    (set) => ({
      resolucoes: [],

  criarResolucao: (dados) => {
    const id = Date.now().toString();
    const nova: Resolucao = { ...dados, id, criadoEm: Date.now() };
    set(state => ({ resolucoes: [nova, ...state.resolucoes] }));
    return id;
  },

  apagarResolucao: (id) => {
    set(state => ({ resolucoes: state.resolucoes.filter(r => r.id !== id) }));
  },

  apagarTodas: () => set({ resolucoes: [] }),
}),
    {
      name: 'resolucoes-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);