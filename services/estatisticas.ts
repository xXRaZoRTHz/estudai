import { EventoEstudo } from '@stores/statsStore';

export type Periodo = '1d' | '1s' | '1m' | '1a' | 'total';
export type Metrica = 'perguntas' | 'acertos' | 'erros' | 'branco';

export const PERIODOS: { id: Periodo; label: string; dias: number | null }[] = [
  { id: '1d',    label: '1 dia',    dias: 1 },
  { id: '1s',    label: '1 semana', dias: 7 },
  { id: '1m',    label: '1 mês',    dias: 30 },
  { id: '1a',    label: '1 ano',    dias: 365 },
  { id: 'total', label: 'Todos',    dias: null },
];

export function filtrarEventos(eventos: EventoEstudo[], periodo: Periodo): EventoEstudo[] {
  const p = PERIODOS.find(x => x.id === periodo)!;
  if (p.dias === null) return eventos;
  const inicio = Date.now() - p.dias * 24 * 60 * 60 * 1000;
  return eventos.filter(e => e.timestamp >= inicio);
}

export interface ResumoEstatisticas {
  perguntasTotais: number;
  perguntasAcertadas: number;
  perguntasErradas: number;
  perguntasEmBranco: number;
  taxaAcerto: number;
  quizzesCompletos: number;
  horasEstudo: number;
  diasActivos: number;
}

export function calcularResumo(eventos: EventoEstudo[]): ResumoEstatisticas {
  const perguntas = eventos.filter(e => e.tipo === 'pergunta_respondida');
  const acertadas = perguntas.filter(p => p.acertou === true).length;
  const erradas = perguntas.filter(p => p.acertou === false).length;
  const emBranco = perguntas.filter(p => p.acertou === undefined || p.acertou === null).length;
  const quizzesCompletos = eventos.filter(e => e.tipo === 'quiz_completo').length;

  const minutosEstudo = eventos
    .filter(e => e.tipo === 'estudo')
    .reduce((acc, e) => acc + (e.duracaoMinutos ?? 0), 0);

  const diasUnicos = new Set(
    eventos.map(e => new Date(e.timestamp).toDateString())
  );

  return {
    perguntasTotais: perguntas.length,
    perguntasAcertadas: acertadas,
    perguntasErradas: erradas,
    perguntasEmBranco: emBranco,
    taxaAcerto: perguntas.length > 0 ? Math.round((acertadas / perguntas.length) * 100) : 0,
    quizzesCompletos,
    horasEstudo: minutosEstudo / 60,
    diasActivos: diasUnicos.size,
  };
}

// Dados para o gráfico de linha (perguntas por dia)
export interface PontoLinha {
  label: string;
  valor: number;
}

export function getActividadePorPeriodo(
  eventos: EventoEstudo[],
  periodo: Periodo,
  metrica: Metrica = 'perguntas',
): PontoLinha[] {
  const p = PERIODOS.find(x => x.id === periodo)!;
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  // Filtra pela métrica
  const eventosMetrica = eventos.filter(e => {
    if (e.tipo !== 'pergunta_respondida') return false;
    if (metrica === 'perguntas') return true;
    if (metrica === 'acertos')   return e.acertou === true;
    if (metrica === 'erros')     return e.acertou === false;
    if (metrica === 'branco')    return e.acertou === undefined || e.acertou === null;
    return false;
  });

  const agora = new Date();
  let pontosTotais: number;
  let unidadeMs: number;
  let formatador: (d: Date) => string;

  if (periodo === 'total') {
    if (eventos.length === 0) {
      pontosTotais = 6; unidadeMs = 5 * 24 * 60 * 60 * 1000;
      formatador = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
    } else {
      const oldest = Math.min(...eventos.map(e => e.timestamp));
      const rangeDias = (Date.now() - oldest) / (24 * 60 * 60 * 1000);

      if (rangeDias <= 7) {
        pontosTotais = 7; unidadeMs = 24 * 60 * 60 * 1000;
        formatador = (d) => ['D','S','T','Q','Q','S','S'][d.getDay()];
      } else if (rangeDias <= 30) {
        pontosTotais = 6; unidadeMs = 5 * 24 * 60 * 60 * 1000;
        formatador = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
      } else if (rangeDias <= 365) {
        pontosTotais = 12; unidadeMs = 30 * 24 * 60 * 60 * 1000;
        formatador = (d) => MESES[d.getMonth()];
      } else {
        pontosTotais = Math.min(10, Math.ceil(rangeDias / 365));
        unidadeMs = 365 * 24 * 60 * 60 * 1000;
        formatador = (d) => String(d.getFullYear());
      }
    }
  } else {
  const dias = p.dias as number;
  if (dias <= 1) {
    pontosTotais = 6; unidadeMs = 4 * 60 * 60 * 1000;
    formatador = (d) => `${d.getHours().toString().padStart(2, '0')}h`;
  } else if (dias <= 7) {
    pontosTotais = 7; unidadeMs = 24 * 60 * 60 * 1000;
    formatador = (d) => ['D','S','T','Q','Q','S','S'][d.getDay()];
  } else if (dias <= 30) {
    pontosTotais = 6; unidadeMs = 5 * 24 * 60 * 60 * 1000;
    formatador = (d) => `${d.getDate()}/${d.getMonth() + 1}`;
  } else {
    pontosTotais = 12; unidadeMs = 30 * 24 * 60 * 60 * 1000;
    formatador = (d) => MESES[d.getMonth()];
  }
}

  const pontos: PontoLinha[] = [];
  for (let i = pontosTotais - 1; i >= 0; i--) {
    const fim = agora.getTime() - i * unidadeMs;
    const inicio = fim - unidadeMs;
    const data = new Date(fim);
    const count = eventosMetrica.filter(e => e.timestamp >= inicio && e.timestamp < fim).length;
    pontos.push({ label: formatador(data), valor: count });
  }
  return pontos;
}

// Dados para distribuição por dificuldade
export function getDistribuicaoDificuldade(eventos: EventoEstudo[]): { dificuldade: string; valor: number; cor: string }[] {
  const cores = {
    'fácil':   '#16A34A',
    'médio':   '#D97706',
    'difícil': '#DC2626',
    'expert':  '#7C3AED',
  };

  const perguntas = eventos.filter(e => e.tipo === 'pergunta_respondida' && e.dificuldade);
  const counts: Record<string, number> = { 'fácil': 0, 'médio': 0, 'difícil': 0, 'expert': 0 };

  perguntas.forEach(p => {
    if (p.dificuldade) counts[p.dificuldade] = (counts[p.dificuldade] ?? 0) + 1;
  });

  return Object.entries(counts)
    .filter(([_, v]) => v > 0)
    .map(([d, v]) => ({
      dificuldade: d,
      valor: v,
      cor: cores[d as keyof typeof cores],
    }));
}

// Dados para "por matéria"
export function getPorMateria(eventos: EventoEstudo[]): { area: string; acertos: number; erros: number; branco: number }[] {
  const map: Record<string, { acertos: number; erros: number; branco: number }> = {};

  eventos
    .filter(e => e.tipo === 'pergunta_respondida' && e.area)
    .forEach(e => {
      if (!map[e.area!]) map[e.area!] = { acertos: 0, erros: 0, branco: 0 };
      if (e.acertou === true) map[e.area!].acertos++;
      else if (e.acertou === false) map[e.area!].erros++;
      else map[e.area!].branco++;
    });

  return Object.entries(map).map(([area, d]) => ({ area, ...d }));
}