import { Dificuldade, RankEntry } from '@app-types/gamification';

export interface PosicaoRank {
  posicao: number;
  total: number;
  variacao: 'sobe' | 'desce' | 'igual';
  variacaoValor: number;
  percentil: number; // 0-100, onde 100 é o melhor
}

export interface RankingGlobal {
  area: string;
  dificuldade: Dificuldade;
  posicao: number;
  total: number;
  pontos: number;
}

/**
 * Calcula a posição do utilizador num leaderboard global.
 *
 * IMPLEMENTAÇÃO ACTUAL: Mock baseado nos pontos do utilizador.
 *
 * QUANDO INTEGRAR O BACKEND:
 * - Substituir por chamada à API: GET /api/rank/{area}/{dificuldade}?userId=X
 * - Backend devolve { posicao, total, variacao } baseado em todos os utilizadores
 * - Função mantém a mesma assinatura, portanto a UI não precisa de mudar.
 */
export async function getPosicaoRank(entry: RankEntry): Promise<PosicaoRank> {
  await new Promise(resolve => setTimeout(resolve, 80));
  return calcularPosicaoMock(entry);
}

export async function getPosicaoRankBatch(entries: RankEntry[]): Promise<Map<string, PosicaoRank>> {
  // Quando integrar: POST /api/rank/batch com [{area, dificuldade, pontos}, ...]
  await new Promise(resolve => setTimeout(resolve, 120));
  const map = new Map<string, PosicaoRank>();
  for (const e of entries) {
    const chave = `${e.area}::${e.dificuldade}`;
    map.set(chave, calcularPosicaoMock(e));
  }
  return map;
}

export async function getMelhorPosicao(entries: RankEntry[]): Promise<RankingGlobal | null> {
  if (entries.length === 0) return null;
  const todasPosicoes = await getPosicaoRankBatch(entries);

  let melhor: RankingGlobal | null = null;
  for (const e of entries) {
    const chave = `${e.area}::${e.dificuldade}`;
    const pos = todasPosicoes.get(chave);
    if (!pos) continue;
    if (!melhor || pos.percentil > (melhor as any)._percentil) {
      melhor = {
        area: e.area,
        dificuldade: e.dificuldade,
        posicao: pos.posicao,
        total: pos.total,
        pontos: e.pontosSemestre,
      };
      (melhor as any)._percentil = pos.percentil;
    }
  }
  if (melhor) delete (melhor as any)._percentil;
  return melhor;
}

/**
 * MOCK — gera uma posição plausível baseada em pontos.
 * Substituir quando o backend estiver integrado.
 */
function calcularPosicaoMock(entry: RankEntry): PosicaoRank {
  const pontos = entry.pontosSemestre;

  // Total simulado de utilizadores por dificuldade (mais utilizadores nos níveis mais fáceis)
  const totaisPorDificuldade: Record<Dificuldade, number> = {
    'fácil':   8500,
    'médio':   5200,
    'difícil': 2100,
    'expert':  650,
  };
  const total = totaisPorDificuldade[entry.dificuldade];

  // Curva exponencial: poucos pontos = posição muito baixa, muitos pontos = top
  // Fórmula: posicao = total * (1 - tanh(pontos / fator))
  // Fator ajustado por dificuldade (mais difícil precisa de menos pontos para subir)
  const fatorPorDificuldade: Record<Dificuldade, number> = {
    'fácil':   60,
    'médio':   40,
    'difícil': 25,
    'expert':  15,
  };
  const fator = fatorPorDificuldade[entry.dificuldade];

  const fraccaoAbaixo = Math.tanh(pontos / fator);
  let posicao = Math.max(1, Math.round(total * (1 - fraccaoAbaixo)));

  // Pequena variação aleatória mas determinística (baseada em pontos + area)
  const seed = pontos + entry.area.length;
  const ruido = ((seed * 7) % 11) - 5;
  posicao = Math.max(1, Math.min(total, posicao + ruido));

  const percentil = ((total - posicao) / total) * 100;

  // Variação simulada vs semana passada
  const variacaoValor = ((seed * 3) % 9) - 4;
  let variacao: 'sobe' | 'desce' | 'igual' = 'igual';
  if (variacaoValor > 0) variacao = 'sobe';
  else if (variacaoValor < 0) variacao = 'desce';

  return {
    posicao,
    total,
    variacao,
    variacaoValor: Math.abs(variacaoValor),
    percentil,
  };
}

/**
 * Devolve um label visual baseado no percentil.
 */
export function getTier(percentil: number): { label: string; cor: string; bg: string; icon: string } {
  if (percentil >= 99) return { label: 'Top 1%',  cor: '#92520A', bg: '#FEF3C7', icon: 'trophy' };
  if (percentil >= 95) return { label: 'Top 5%',  cor: '#7C3AED', bg: '#F5F3FF', icon: 'medal' };
  if (percentil >= 90) return { label: 'Top 10%', cor: '#4F46E5', bg: '#EEF2FF', icon: 'ribbon' };
  if (percentil >= 75) return { label: 'Top 25%', cor: '#185FA5', bg: '#EBF4FF', icon: 'star' };
  if (percentil >= 50) return { label: 'Top 50%', cor: '#16A34A', bg: '#DCFCE7', icon: 'chevron-up' };
  return { label: 'Em progresso', cor: '#6B7280', bg: '#F3F4F6', icon: 'trending-up' };
}
// ─── LEADERBOARD COMPLETO ────────────────────────────────────

export interface LeaderboardUser {
  userId: string;
  nome: string;
  foto: string | null;
  iniciais: string;
  corAvatar: string;
  posicao: number;
  pontos: number;
  variacao: 'sobe' | 'desce' | 'igual';
  variacaoValor: number;
  insigniasDestaque: string[];
  isUtilizadorActual: boolean;
}

export interface LeaderboardData {
  area: string;
  dificuldade: Dificuldade;
  total: number;
  pontosDistribuidos: number;
  mediaParticipante: number;
  podio: LeaderboardUser[];          // top 3
  lista: LeaderboardUser[];          // do 4º para baixo
  utilizadorActual: LeaderboardUser; // posição do user actual
}

/**
 * Obtém o leaderboard completo de uma matéria + dificuldade.
 *
 * QUANDO INTEGRAR O BACKEND:
 * - Substituir por: GET /api/leaderboard/{area}/{dificuldade}?userId=X&limit=50&offset=0
 * - Backend devolve { podio, lista, total, ... } directamente.
 */
export async function getLeaderboard(
  area: string,
  dificuldade: Dificuldade,
  pontosUtilizador: number,
  nomeUtilizador: string,
  fotoUtilizador: string | null,
  insigniasUtilizador: string[],
): Promise<LeaderboardData> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return gerarLeaderboardMock(area, dificuldade, pontosUtilizador, nomeUtilizador, fotoUtilizador, insigniasUtilizador);
}

// ─── MOCK ────────────────────────────────────────────────────

const NOMES_MOCK = [
  'Ana Silva', 'João Santos', 'Maria Oliveira', 'Pedro Costa', 'Sofia Ferreira',
  'Tiago Martins', 'Inês Pereira', 'Rui Almeida', 'Beatriz Rodrigues', 'Miguel Lopes',
  'Catarina Sousa', 'Diogo Gomes', 'Mariana Cardoso', 'André Pinto', 'Joana Marques',
  'Bruno Carvalho', 'Carolina Dias', 'Ricardo Nunes', 'Patrícia Reis', 'Hugo Teixeira',
  'Daniela Moreira', 'Filipe Correia', 'Margarida Cunha', 'Nuno Mendes', 'Rita Freitas',
  'Carlos Antunes', 'Vanessa Lima', 'David Tavares', 'Helena Branco', 'Luís Henriques',
  'Sara Vieira', 'Gonçalo Faria', 'Cristina Pinheiro', 'Fábio Rocha', 'Adriana Costa',
  'Tomás Ribeiro', 'Lara Esteves', 'Vasco Cabral', 'Bárbara Neves', 'Renato Soares',
];

const CORES_AVATAR = [
  '#4F46E5', '#7C3AED', '#DC2626', '#D97706', '#16A34A',
  '#0F6E56', '#185FA5', '#92520A', '#991B1B', '#534AB7',
];

function getIniciais(nome: string): string {
  return nome
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const INSIGNIAS_MOCK_POOL = [
  'primeiro-passo', 'estreante', 'estudioso', 'mestre', 'lenda',
  'perfeccionista', 'expert-iniciado', 'streak-7', 'streak-30', 'streak-100',
  'top-10', 'top-3', 'campeao', 'colecionador', 'organizador',
  'curioso', 'sintetizador', 'primeira-semana', 'primeiro-mes',
];

function gerarLeaderboardMock(
  area: string,
  dificuldade: Dificuldade,
  pontosUtilizador: number,
  nomeUtilizador: string,
  fotoUtilizador: string | null,
  insigniasUtilizador: string[],
): LeaderboardData {
  // Semente determinística baseada em area+dificuldade
  const seed = area.length + dificuldade.length;

  const totaisPorDificuldade: Record<Dificuldade, number> = {
    'fácil':   8500,
    'médio':   5200,
    'difícil': 2100,
    'expert':  650,
  };
  const total = totaisPorDificuldade[dificuldade];

  // Calcula posição do utilizador
  const fatorPorDificuldade: Record<Dificuldade, number> = {
    'fácil': 60, 'médio': 40, 'difícil': 25, 'expert': 15,
  };
  const fator = fatorPorDificuldade[dificuldade];
  const fraccaoAbaixo = Math.tanh(pontosUtilizador / fator);
  let posicaoUser = Math.max(1, Math.round(total * (1 - fraccaoAbaixo)));
  const ruido = ((pontosUtilizador * 7 + seed) % 11) - 5;
  posicaoUser = Math.max(1, Math.min(total, posicaoUser + ruido));

  // Gera pontuação por posição (curva decrescente)
  function pontosPorPosicao(p: number): number {
    if (p === 1) return Math.round(pontosUtilizador * 3.2 + 500);
    const factor = Math.pow(0.97, p - 1);
    return Math.max(1, Math.round((pontosUtilizador * 3.2 + 500) * factor));
  }

  // Gera utilizador fictício para uma posição
  function gerarUser(posicao: number, isActual: boolean): LeaderboardUser {
    if (isActual) {
      return {
        userId: 'me',
        nome: nomeUtilizador,
        foto: fotoUtilizador,
        iniciais: getIniciais(nomeUtilizador),
        corAvatar: CORES_AVATAR[0],
        posicao,
        pontos: pontosUtilizador,
        variacao: 'igual',
        variacaoValor: 0,
        insigniasDestaque: insigniasUtilizador.slice(0, 3),
        isUtilizadorActual: true,
      };
    }

    const idxNome = (posicao * 13 + seed) % NOMES_MOCK.length;
    const idxCor = (posicao * 7 + seed) % CORES_AVATAR.length;
    const nome = NOMES_MOCK[idxNome];

    const varSeed = (posicao * 3 + seed) % 11;
    const variacaoValor = varSeed - 5;
    let variacao: 'sobe' | 'desce' | 'igual' = 'igual';
    if (variacaoValor > 0) variacao = 'sobe';
    else if (variacaoValor < 0) variacao = 'desce';

    // Insígnias: quanto melhor a posição, mais (e melhores) insígnias
    const numInsignias = posicao === 1 ? 3 : posicao <= 3 ? 3 : posicao <= 10 ? 2 : posicao <= 50 ? 2 : 1;
    const insigniasDestaque: string[] = [];

    // Top 3 sempre tem campeao/pódio
    if (posicao === 1) insigniasDestaque.push('campeao');
    else if (posicao <= 3) insigniasDestaque.push('top-3');
    else if (posicao <= 10) insigniasDestaque.push('top-10');

    // Insígnias adicionais determinísticas
    for (let i = 0; i < numInsignias - insigniasDestaque.length; i++) {
        const idx = (posicao * 17 + i * 23 + seed) % INSIGNIAS_MOCK_POOL.length;
        const insignia = INSIGNIAS_MOCK_POOL[idx];
        if (!insigniasDestaque.includes(insignia)) {
        insigniasDestaque.push(insignia);
        }
    }

    return {
      userId: `user-${posicao}`,
      nome,
      foto: null,
      iniciais: getIniciais(nome),
      corAvatar: CORES_AVATAR[idxCor],
      posicao,
      pontos: pontosPorPosicao(posicao),
      variacao,
      variacaoValor: Math.abs(variacaoValor),
      insigniasDestaque,
      isUtilizadorActual: false,
    };
  }

  // Pódio (top 3)
  const podio: LeaderboardUser[] = [];
  for (let p = 1; p <= 3; p++) {
    podio.push(gerarUser(p, p === posicaoUser));
  }

  // Lista do 4º até ao 50º (ou até onde o user estiver)
  const limite = Math.min(50, total);
  const lista: LeaderboardUser[] = [];
  for (let p = 4; p <= limite; p++) {
    lista.push(gerarUser(p, p === posicaoUser));
  }

  // Se o utilizador estiver fora do top 50, injecta o card dele na lista com separador
  let utilizadorActual: LeaderboardUser;
  if (posicaoUser <= 3) {
    utilizadorActual = podio.find(u => u.isUtilizadorActual)!;
  } else if (posicaoUser <= limite) {
    utilizadorActual = lista.find(u => u.isUtilizadorActual)!;
  } else {
    utilizadorActual = gerarUser(posicaoUser, true);
  }

  // Estatísticas da matéria
  const pontosDistribuidos = lista.reduce((acc, u) => acc + u.pontos, 0) + podio.reduce((acc, u) => acc + u.pontos, 0);
  const mediaParticipante = Math.round((pontosDistribuidos / (podio.length + lista.length)) * 0.6);

  return {
    area,
    dificuldade,
    total,
    pontosDistribuidos: pontosDistribuidos * Math.floor(total / 50), // extrapolar para o total
    mediaParticipante,
    podio,
    lista,
    utilizadorActual,
  };
}