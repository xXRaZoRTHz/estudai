import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RankEntry, Dificuldade } from '@app-types/gamification';

const MULTIPLICADORES: Record<Dificuldade, number> = {
  'fácil':   1,
  'médio':   2,
  'difícil': 3,
  'expert':  5,
};

function getSemestreActual(): string {
  const d = new Date();
  const sem = d.getMonth() < 6 ? 'S1' : 'S2';
  return `${d.getFullYear()}-${sem}`;
}

interface RankState {
  entries: RankEntry[];
  registarPergunta: (area: string, dificuldade: Dificuldade, acertou: boolean) => void;
  registarQuizCompleto: (area: string, dificuldade: Dificuldade, acertos: number, total: number) => void;
  getRank: (area: string, dificuldade: Dificuldade) => RankEntry | null;
  getRanksPorArea: (area: string) => RankEntry[];
}

function chaveRank(area: string, dificuldade: Dificuldade, semestre: string) {
  return `${area}::${dificuldade}::${semestre}`;
}

export const useRankStore = create<RankState>()(
  persist(
    (set, get) => ({
     entries: [
  { area: 'Matemática', dificuldade: 'fácil',   semestre: '2026-S1', pontosSemestre: 45,  pontosLifetime: 45,  perguntasRespondidas: 50, perguntasAcertadas: 45 },
  { area: 'Matemática', dificuldade: 'médio',   semestre: '2026-S1', pontosSemestre: 80,  pontosLifetime: 80,  perguntasRespondidas: 30, perguntasAcertadas: 24 },
  { area: 'Matemática', dificuldade: 'difícil', semestre: '2026-S1', pontosSemestre: 30,  pontosLifetime: 30,  perguntasRespondidas: 15, perguntasAcertadas: 10 },
  { area: 'História',   dificuldade: 'fácil',   semestre: '2026-S1', pontosSemestre: 22,  pontosLifetime: 22,  perguntasRespondidas: 25, perguntasAcertadas: 22 },
  { area: 'Física',     dificuldade: 'expert',  semestre: '2026-S1', pontosSemestre: 100, pontosLifetime: 100, perguntasRespondidas: 20, perguntasAcertadas: 18 },
],

      registarPergunta: (area, dificuldade, acertou) => {
        const semestre = getSemestreActual();
        const pontos = acertou ? 1 * MULTIPLICADORES[dificuldade] : 0;

        set(state => {
          const existente = state.entries.find(
            e => e.area === area && e.dificuldade === dificuldade && e.semestre === semestre
          );

          if (existente) {
            return {
              entries: state.entries.map(e =>
                e === existente
                  ? {
                      ...e,
                      pontosSemestre: e.pontosSemestre + pontos,
                      pontosLifetime: e.pontosLifetime + pontos,
                      perguntasRespondidas: e.perguntasRespondidas + 1,
                      perguntasAcertadas: e.perguntasAcertadas + (acertou ? 1 : 0),
                    }
                  : e
              ),
            };
          }

          return {
            entries: [
              ...state.entries,
              {
                area,
                dificuldade,
                semestre,
                pontosSemestre: pontos,
                pontosLifetime: pontos,
                perguntasRespondidas: 1,
                perguntasAcertadas: acertou ? 1 : 0,
              },
            ],
          };
        });
      },

      registarQuizCompleto: (area, dificuldade, acertos, total) => {
        const percentagem = acertos / total;
        if (percentagem < 1) return; // bónus só para 100%

        const semestre = getSemestreActual();
        const bonus = total * MULTIPLICADORES[dificuldade];

        set(state => {
          const existente = state.entries.find(
            e => e.area === area && e.dificuldade === dificuldade && e.semestre === semestre
          );
          if (!existente) return state;

          return {
            entries: state.entries.map(e =>
              e === existente
                ? {
                    ...e,
                    pontosSemestre: e.pontosSemestre + bonus,
                    pontosLifetime: e.pontosLifetime + bonus,
                  }
                : e
            ),
          };
        });
      },

      getRank: (area, dificuldade) => {
        const semestre = getSemestreActual();
        return get().entries.find(
          e => e.area === area && e.dificuldade === dificuldade && e.semestre === semestre
        ) ?? null;
      },

      getRanksPorArea: (area) => {
        const semestre = getSemestreActual();
        return get().entries.filter(e => e.area === area && e.semestre === semestre);
      },
    }),
    {
      name: 'rank-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);