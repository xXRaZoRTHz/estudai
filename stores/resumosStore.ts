import { create } from 'zustand';

export interface Resumo {
  id: string;
  titulo: string;       // primeiras palavras do input ou nome do ficheiro
  textoOriginal: string;
  resumo: string;
  fonte: 'texto' | 'ficheiro' | 'camera';
  criadoEm: number;
}

interface ResumosState {
  resumos: Resumo[];
  criarResumo: (dados: Omit<Resumo, 'id' | 'criadoEm'>) => string;
  apagarResumo: (id: string) => void;
  apagarTodos: () => void;
}

export const useResumosStore = create<ResumosState>((set) => ({
  resumos: [],

  criarResumo: (dados) => {
    const id = Date.now().toString();
    const novo: Resumo = { ...dados, id, criadoEm: Date.now() };
    set(state => ({ resumos: [novo, ...state.resumos] }));
    return id;
  },

  apagarResumo: (id) => {
    set(state => ({ resumos: state.resumos.filter(r => r.id !== id) }));
  },

  apagarTodos: () => set({ resumos: [] }),
}));