import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DefinicaoInsignia, InsigniaConquistada } from '@app-types/gamification';

// Catálogo completo de insígnias
export const INSIGNIAS: DefinicaoInsignia[] = [
  // Progresso
  { id: 'primeiro-passo',  nome: 'Primeiro Passo',  descricao: 'Conclui o primeiro quiz',                      icone: 'footsteps',      cor: '#0F6E56', bgCor: '#E1F5EE', categoria: 'progresso' },
  { id: 'primeira-semana', nome: 'Primeira Semana', descricao: 'Estuda 7 dias',                                icone: 'calendar',       cor: '#0F6E56', bgCor: '#E1F5EE', categoria: 'progresso' },
  { id: 'primeiro-mes',    nome: 'Primeiro Mês',    descricao: 'Estuda 30 dias',                               icone: 'medal',          cor: '#0F6E56', bgCor: '#E1F5EE', categoria: 'progresso' },
  { id: 'colecionador',    nome: 'Colecionador',    descricao: 'Cria 5 baralhos de flashcards',                icone: 'albums',         cor: '#92520A', bgCor: '#FEF3C7', categoria: 'progresso' },
  { id: 'organizador',     nome: 'Organizador',     descricao: 'Cria o primeiro cronograma',                   icone: 'calendar-clear', cor: '#991B1B', bgCor: '#FEE2E2', categoria: 'progresso' },
  { id: 'curioso',         nome: 'Curioso',         descricao: 'Faz 10 perguntas no chat',                     icone: 'chatbubbles',    cor: '#185FA5', bgCor: '#EBF4FF', categoria: 'progresso' },
  { id: 'sintetizador',    nome: 'Sintetizador',    descricao: 'Cria 10 resumos',                              icone: 'document-text',  cor: '#0F6E56', bgCor: '#E1F5EE', categoria: 'progresso' },

  // Desempenho
  { id: 'estreante',       nome: 'Estreante',       descricao: 'Acerta 10 perguntas',                          icone: 'checkmark',      cor: '#16A34A', bgCor: '#DCFCE7', categoria: 'desempenho' },
  { id: 'estudioso',       nome: 'Estudioso',       descricao: 'Acerta 50 perguntas',                          icone: 'school',         cor: '#16A34A', bgCor: '#DCFCE7', categoria: 'desempenho' },
  { id: 'mestre',          nome: 'Mestre',          descricao: 'Acerta 500 perguntas',                         icone: 'trophy',         cor: '#92520A', bgCor: '#FEF3C7', categoria: 'desempenho' },
  { id: 'lenda',           nome: 'Lenda',           descricao: 'Acerta 1000 perguntas',                        icone: 'star',           cor: '#92520A', bgCor: '#FEF3C7', categoria: 'desempenho' },
  { id: 'perfeccionista',  nome: 'Perfeccionista',  descricao: 'Acerta 100% num simulado',                     icone: 'ribbon',         cor: '#534AB7', bgCor: '#EEEDFE', categoria: 'desempenho' },
  { id: 'expert-iniciado', nome: 'Expert Iniciado', descricao: 'Acerta um quiz inteiro em dificuldade Expert', icone: 'flame',          cor: '#7C3AED', bgCor: '#F5F3FF', categoria: 'desempenho' },
  { id: 'streak-7',        nome: 'Semana Perfeita', descricao: 'Estuda 7 dias seguidos',                       icone: 'flame-outline',  cor: '#DC2626', bgCor: '#FEE2E2', categoria: 'desempenho' },
  { id: 'streak-30',       nome: 'Mês Perfeito',    descricao: 'Estuda 30 dias seguidos',                      icone: 'flame',          cor: '#DC2626', bgCor: '#FEE2E2', categoria: 'desempenho' },
  { id: 'streak-100',      nome: 'Disciplinado',    descricao: 'Estuda 100 dias seguidos',                     icone: 'flash',          cor: '#DC2626', bgCor: '#FEE2E2', categoria: 'desempenho' },

  // Raras
  { id: 'top-10',          nome: 'Top 10',          descricao: 'Entra no top 10 de uma matéria',               icone: 'podium',         cor: '#7C3AED', bgCor: '#F5F3FF', categoria: 'rara' },
  { id: 'top-3',           nome: 'Pódio',           descricao: 'Entra no top 3 de uma matéria',                icone: 'trophy',         cor: '#7C3AED', bgCor: '#F5F3FF', categoria: 'rara' },
  { id: 'campeao',         nome: 'Campeão',         descricao: 'É o número 1 de uma matéria',                  icone: 'star',           cor: '#92520A', bgCor: '#FEF3C7', categoria: 'rara' },
];

interface InsigniasState {
  conquistadas: InsigniaConquistada[];
  conquistar: (id: string) => boolean;  // retorna true se foi nova conquista
  jaTem: (id: string) => boolean;
}

export const useInsigniasStore = create<InsigniasState>()(
  persist(
    (set, get) => ({
      conquistadas: [],

      conquistar: (id) => {
        if (get().jaTem(id)) return false;
        set(state => ({
          conquistadas: [...state.conquistadas, { id, conquistadaEm: Date.now() }],
        }));
        return true;
      },

      jaTem: (id) => get().conquistadas.some(c => c.id === id),
    }),
    {
      name: 'insignias-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);