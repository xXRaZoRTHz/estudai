import { create } from 'zustand';

export interface Flashcard {
  id: string;
  frente: string;
  verso: string;
  // Algoritmo SM-2 simplificado
  intervalo: number;       // dias até à próxima revisão
  facilidade: number;      // factor de facilidade (1.3 a 2.5+)
  proximaRevisao: number;  // timestamp
  revisoes: number;        // nº de vezes revisto
}

export interface Baralho {
  id: string;
  titulo: string;
  descricao: string;
  cards: Flashcard[];
  criadoEm: number;
  origem: 'manual' | 'ia';
}

interface FlashcardsState {
  baralhos: Baralho[];
  criarBaralho: (dados: Omit<Baralho, 'id' | 'criadoEm' | 'cards'> & { cards: Omit<Flashcard, 'id' | 'intervalo' | 'facilidade' | 'proximaRevisao' | 'revisoes'>[] }) => string;
  apagarBaralho: (id: string) => void;
  adicionarCard: (baralhoId: string, frente: string, verso: string) => void;
  apagarCard: (baralhoId: string, cardId: string) => void;
  registarResposta: (baralhoId: string, cardId: string, qualidade: 0 | 3 | 5) => void;
}

// Algoritmo SM-2 simplificado
// qualidade: 0 = errei, 3 = difícil, 5 = fácil
function calcularProximaRevisao(card: Flashcard, qualidade: 0 | 3 | 5): Partial<Flashcard> {
  let novaFacilidade = card.facilidade + (0.1 - (5 - qualidade) * (0.08 + (5 - qualidade) * 0.02));
  if (novaFacilidade < 1.3) novaFacilidade = 1.3;

  let novoIntervalo: number;
  if (qualidade < 3) {
    novoIntervalo = 1; // recomeça
  } else if (card.revisoes === 0) {
    novoIntervalo = 1;
  } else if (card.revisoes === 1) {
    novoIntervalo = 6;
  } else {
    novoIntervalo = Math.round(card.intervalo * novaFacilidade);
  }

  return {
    intervalo: novoIntervalo,
    facilidade: novaFacilidade,
    proximaRevisao: Date.now() + novoIntervalo * 24 * 60 * 60 * 1000,
    revisoes: card.revisoes + 1,
  };
}

export const useFlashcardsStore = create<FlashcardsState>((set) => ({
  baralhos: [],

  criarBaralho: (dados) => {
    const id = Date.now().toString();
    const baralho: Baralho = {
      id,
      titulo: dados.titulo,
      descricao: dados.descricao,
      origem: dados.origem,
      criadoEm: Date.now(),
      cards: dados.cards.map((c, i) => ({
        ...c,
        id: `${id}-${i}`,
        intervalo: 0,
        facilidade: 2.5,
        proximaRevisao: Date.now(),
        revisoes: 0,
      })),
    };
    set(state => ({ baralhos: [baralho, ...state.baralhos] }));
    return id;
  },

  apagarBaralho: (id) => {
    set(state => ({ baralhos: state.baralhos.filter(b => b.id !== id) }));
  },

  adicionarCard: (baralhoId, frente, verso) => {
    set(state => ({
      baralhos: state.baralhos.map(b =>
        b.id === baralhoId
          ? {
              ...b,
              cards: [
                ...b.cards,
                {
                  id: `${baralhoId}-${b.cards.length}-${Date.now()}`,
                  frente,
                  verso,
                  intervalo: 0,
                  facilidade: 2.5,
                  proximaRevisao: Date.now(),
                  revisoes: 0,
                },
              ],
            }
          : b
      ),
    }));
  },

  apagarCard: (baralhoId, cardId) => {
    set(state => ({
      baralhos: state.baralhos.map(b =>
        b.id === baralhoId
          ? { ...b, cards: b.cards.filter(c => c.id !== cardId) }
          : b
      ),
    }));
  },

  registarResposta: (baralhoId, cardId, qualidade) => {
    set(state => ({
      baralhos: state.baralhos.map(b =>
        b.id === baralhoId
          ? {
              ...b,
              cards: b.cards.map(c =>
                c.id === cardId
                  ? { ...c, ...calcularProximaRevisao(c, qualidade) }
                  : c
              ),
            }
          : b
      ),
    }));
  },
}));