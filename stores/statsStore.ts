import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Dificuldade } from '@app-types/gamification';

export interface EventoEstudo {
  timestamp: number;
  tipo: 'pergunta_respondida' | 'quiz_completo' | 'estudo';
  area?: string;
  dificuldade?: Dificuldade;
  acertou?: boolean;
  duracaoMinutos?: number;  // só para 'estudo'
}

interface StatsState {
  eventos: EventoEstudo[];
  registarEvento: (evento: Omit<EventoEstudo, 'timestamp'>) => void;
  limparTudo: () => void;
}

export const useStatsStore = create<StatsState>()(
  persist(
    (set) => ({
      eventos: [],

      registarEvento: (evento) => {
        set(state => ({
          eventos: [...state.eventos, { ...evento, timestamp: Date.now() }],
        }));
      },

      limparTudo: () => set({ eventos: [] }),
    }),
    {
      name: 'stats-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);