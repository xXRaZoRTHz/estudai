export type CategoriaInsignia = 'progresso' | 'desempenho' | 'rara' | 'social';

export interface DefinicaoInsignia {
  id: string;
  nome: string;
  descricao: string;
  icone: string;          // nome do Ionicons
  cor: string;
  bgCor: string;
  categoria: CategoriaInsignia;
}

export interface InsigniaConquistada {
  id: string;
  conquistadaEm: number;
}

export type Dificuldade = 'fácil' | 'médio' | 'difícil' | 'expert';

export interface RankEntry {
  area: string;
  dificuldade: Dificuldade;
  pontosSemestre: number;
  pontosLifetime: number;
  perguntasRespondidas: number;
  perguntasAcertadas: number;
  semestre: string;       // ex: "2026-S1"
}