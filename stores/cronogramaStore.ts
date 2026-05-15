import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SessaoEstudo {
  id: string;
  diaSemana: number;
  hora: string;
  duracao: number;
  area: string;
  topico: string;
  concluida: boolean;
}

export interface Cronograma {
  id: string;
  titulo: string;
  objectivo: string;
  rotinaDiaria: string;
  areas: string[];
  diasDisponiveis: number[];
  horasPorDia: number;
  prazo: string;
  sessoes: SessaoEstudo[];
  criadoEm: number;
}

interface CronogramaState {
  cronogramas: Cronograma[];
  criarCronograma: (dados: Omit<Cronograma, 'id' | 'criadoEm'>) => string;
  apagarCronograma: (id: string) => void;
  apagarTodos: () => void;
  toggleSessaoConcluida: (cronogramaId: string, sessaoId: string) => void;
}

export const useCronogramaStore = create<CronogramaState>()(
    persist(
        (set) => ({
        cronogramas: [],

  criarCronograma: (dados) => {
    const id = Date.now().toString();
    const novo: Cronograma = { ...dados, id, criadoEm: Date.now() };
    set(state => ({ cronogramas: [novo, ...state.cronogramas] }));
    return id;
  },

  apagarCronograma: (id) => {
    set(state => ({ cronogramas: state.cronogramas.filter(c => c.id !== id) }));
  },

  apagarTodos: () => set({ cronogramas: [] }),

  toggleSessaoConcluida: (cronogramaId, sessaoId) => {
    set(state => ({
      cronogramas: state.cronogramas.map(c =>
        c.id === cronogramaId
          ? {
              ...c,
              sessoes: c.sessoes.map(s =>
                s.id === sessaoId ? { ...s, concluida: !s.concluida } : s
              ),
            }
          : c
      ),
    }));
  },
    }),
        {
        name: 'cronograma-storage',
        storage: createJSONStorage(() => AsyncStorage),
        }
    )
);