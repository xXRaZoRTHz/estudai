import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankStore } from '@stores/rankStore';
import { Dificuldade, RankEntry } from '@app-types/gamification';
import { getPosicaoRankBatch, getMelhorPosicao, getTier, PosicaoRank, RankingGlobal } from '@services/ranking';

const DIFICULDADES: { id: Dificuldade; label: string; cor: string; bg: string }[] = [
  { id: 'fácil',   label: 'Fácil',   cor: '#16A34A', bg: '#DCFCE7' },
  { id: 'médio',   label: 'Médio',   cor: '#D97706', bg: '#FEF3C7' },
  { id: 'difícil', label: 'Difícil', cor: '#DC2626', bg: '#FEE2E2' },
  { id: 'expert',  label: 'Expert',  cor: '#7C3AED', bg: '#F5F3FF' },
];

function getSemestreActual(): string {
  const d = new Date();
  const sem = d.getMonth() < 6 ? 'S1' : 'S2';
  return `${d.getFullYear()}-${sem}`;
}

function nomeSemestre(): string {
  const d = new Date();
  return d.getMonth() < 6 ? `1º Semestre ${d.getFullYear()}` : `2º Semestre ${d.getFullYear()}`;
}

function formatarPosicao(p: number, total: number): string {
  return `#${p.toLocaleString('pt-PT')} / ${total.toLocaleString('pt-PT')}`;
}

export default function RanksScreen() {
  const router = useRouter();
  const entries = useRankStore(s => s.entries);
  const [filtro, setFiltro] = useState<Dificuldade | 'todas'>('todas');
  const [loading, setLoading] = useState(true);
  const [posicoes, setPosicoes] = useState<Map<string, PosicaoRank>>(new Map());
  const [melhorPosicao, setMelhorPosicao] = useState<RankingGlobal | null>(null);

  const semestreActual = getSemestreActual();
  const entriesSemestre = entries.filter(e => e.semestre === semestreActual);

  // Buscar posições do backend (mock por agora)
  useEffect(() => {
    let cancelado = false;
    async function carregar() {
      setLoading(true);
      try {
        const [mapaPosicoes, melhor] = await Promise.all([
          getPosicaoRankBatch(entriesSemestre),
          getMelhorPosicao(entriesSemestre),
        ]);
        if (!cancelado) {
          setPosicoes(mapaPosicoes);
          setMelhorPosicao(melhor);
        }
      } finally {
        if (!cancelado) setLoading(false);
      }
    }
    carregar();
    return () => { cancelado = true; };
  }, [entries.length]);

  const areasUnicas = Array.from(new Set(entriesSemestre.map(e => e.area)));

  const totalPontosSemestre = entriesSemestre.reduce((acc, e) => acc + e.pontosSemestre, 0);
  const totalPontosLifetime = entries.reduce((acc, e) => acc + e.pontosLifetime, 0);

  function getEntriesPorArea(area: string) {
    return entriesSemestre
      .filter(e => e.area === area)
      .filter(e => filtro === 'todas' || e.dificuldade === filtro)
      .sort((a, b) => {
        const ordem: Dificuldade[] = ['fácil', 'médio', 'difícil', 'expert'];
        return ordem.indexOf(a.dificuldade) - ordem.indexOf(b.dificuldade);
      });
  }

  function getDificuldadeStyle(d: Dificuldade) {
    return DIFICULDADES.find(x => x.id === d) ?? DIFICULDADES[0];
  }

  function chaveEntry(e: RankEntry) {
    return `${e.area}::${e.dificuldade}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Os meus ranks</Text>
          <Text style={styles.subtitulo}>{nomeSemestre()}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Resumo de pontos + melhor posição */}
        <View style={styles.resumoCard}>
          <View style={styles.resumoTop}>
            <View style={styles.resumoIcon}>
              <Ionicons name="trophy" size={26} color="#fff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.resumoLabel}>Pontos no semestre</Text>
              <Text style={styles.resumoNum}>{totalPontosSemestre.toLocaleString('pt-PT')}</Text>
              <Text style={styles.resumoLifetime}>
                {totalPontosLifetime.toLocaleString('pt-PT')} pontos totais
              </Text>
            </View>
          </View>

          {melhorPosicao && (
            <View style={styles.melhorContainer}>
              <View style={styles.melhorIcon}>
                <Ionicons name="medal" size={16} color="#FEF3C7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.melhorLabel}>Melhor posição</Text>
                <Text style={styles.melhorValor}>
                  #{melhorPosicao.posicao.toLocaleString('pt-PT')} em {melhorPosicao.area} {melhorPosicao.dificuldade}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Filtros */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtros}
        >
          <TouchableOpacity
            style={[styles.filtroBtn, filtro === 'todas' && styles.filtroBtnActivo]}
            onPress={() => setFiltro('todas')}
          >
            <Text style={[styles.filtroTexto, filtro === 'todas' && styles.filtroTextoActivo]}>
              Todas
            </Text>
          </TouchableOpacity>

          {DIFICULDADES.map(d => (
            <TouchableOpacity
              key={d.id}
              style={[
                styles.filtroBtn,
                filtro === d.id && { backgroundColor: d.cor, borderColor: d.cor },
              ]}
              onPress={() => setFiltro(d.id)}
            >
              <Text style={[
                styles.filtroTexto,
                filtro === d.id && styles.filtroTextoActivo,
              ]}>
                {d.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de áreas */}
        {entriesSemestre.length === 0 ? (
          <View style={styles.vazio}>
            <Ionicons name="podium-outline" size={48} color="#9CA3AF" />
            <Text style={styles.vazioTitulo}>Sem actividade ainda</Text>
            <Text style={styles.vazioSub}>
              Responde a perguntas e completa quizzes para entrares no ranking
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.loadingTexto}>A carregar posições...</Text>
          </View>
        ) : (
          areasUnicas.map(area => {
            const entriesArea = getEntriesPorArea(area);
            if (entriesArea.length === 0) return null;

            const totalArea = entriesArea.reduce((acc, e) => acc + e.pontosSemestre, 0);

            return (
              <View key={area} style={styles.areaCard}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaIcon}>
                    <Ionicons name="library-outline" size={18} color="#4F46E5" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.areaNome}>{area}</Text>
                    <Text style={styles.areaPontos}>{totalArea} pontos</Text>
                  </View>
                </View>

                <View style={styles.dificuldadesContainer}>
                  {entriesArea.map(e => {
                    const dStyle = getDificuldadeStyle(e.dificuldade);
                    const taxa = e.perguntasRespondidas > 0
                      ? Math.round((e.perguntasAcertadas / e.perguntasRespondidas) * 100)
                      : 0;
                    const pos = posicoes.get(chaveEntry(e));
                    const tier = pos ? getTier(pos.percentil) : null;

                    return (
                      <TouchableOpacity
                        key={e.dificuldade}
                        style={[styles.dificuldadeRow, { borderLeftColor: dStyle.cor }]}
                        onPress={() => router.push(`/(tabs)/perfil/leaderboard?area=${encodeURIComponent(e.area)}&dificuldade=${e.dificuldade}`)}
                        activeOpacity={0.7}
                        >

                        {/* Cabeçalho dificuldade */}
                        <View style={styles.dificuldadeHeader}>
                          <View style={[styles.dificuldadeBadge, { backgroundColor: dStyle.bg }]}>
                            <Text style={[styles.dificuldadeBadgeTexto, { color: dStyle.cor }]}>
                              {dStyle.label}
                            </Text>
                          </View>

                          {pos && tier && (
                            <View style={[styles.tierBadge, { backgroundColor: tier.bg }]}>
                              <Ionicons name={tier.icon as any} size={11} color={tier.cor} />
                              <Text style={[styles.tierTexto, { color: tier.cor }]}>{tier.label}</Text>
                            </View>
                          )}
                        </View>

                        {/* Posição global */}
                        {pos && (
                          <View style={styles.posicaoContainer}>
                            <View style={{ flex: 1 }}>
                              <Text style={styles.posicaoNum}>
                                {formatarPosicao(pos.posicao, pos.total)}
                              </Text>
                              {pos.variacao !== 'igual' && (
                                <View style={styles.variacaoRow}>
                                  <Ionicons
                                    name={pos.variacao === 'sobe' ? 'trending-up' : 'trending-down'}
                                    size={11}
                                    color={pos.variacao === 'sobe' ? '#16A34A' : '#DC2626'}
                                  />
                                  <Text style={[
                                    styles.variacaoTexto,
                                    { color: pos.variacao === 'sobe' ? '#16A34A' : '#DC2626' },
                                  ]}>
                                    {pos.variacao === 'sobe' ? '+' : '-'}{pos.variacaoValor} esta semana
                                  </Text>
                                </View>
                              )}
                            </View>
                          </View>
                        )}

                        {/* Stats */}
                        <View style={styles.dificuldadeStats}>
                          <View style={styles.statBlock}>
                            <Text style={styles.statValor}>{e.pontosSemestre}</Text>
                            <Text style={styles.statLabel}>pontos</Text>
                          </View>
                          <View style={styles.statBlock}>
                            <Text style={styles.statValor}>{e.perguntasRespondidas}</Text>
                            <Text style={styles.statLabel}>perguntas</Text>
                          </View>
                          <View style={styles.statBlock}>
                            <Text style={styles.statValor}>{taxa}%</Text>
                            <Text style={styles.statLabel}>acerto</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            );
          })
        )}

        {/* Como funciona */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={18} color="#4F46E5" />
            <Text style={styles.infoTitulo}>Como funciona</Text>
          </View>
          <Text style={styles.infoTexto}>
            Cada pergunta acertada vale pontos consoante a dificuldade:
          </Text>
          <View style={styles.multiplicadores}>
            <View style={styles.multiBadge}><Text style={[styles.multiTexto, { color: '#16A34A' }]}>Fácil ×1</Text></View>
            <View style={styles.multiBadge}><Text style={[styles.multiTexto, { color: '#D97706' }]}>Médio ×2</Text></View>
            <View style={styles.multiBadge}><Text style={[styles.multiTexto, { color: '#DC2626' }]}>Difícil ×3</Text></View>
            <View style={styles.multiBadge}><Text style={[styles.multiTexto, { color: '#7C3AED' }]}>Expert ×5</Text></View>
          </View>
          <Text style={styles.infoTexto}>
            Acertares 100% num quiz dá-te um bónus extra equivalente ao número de perguntas vezes o multiplicador.
            Compete com estudantes de todo o mundo em cada matéria e dificuldade.
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  scroll: { padding: 16, gap: 12, paddingBottom: 32 },

  resumoCard: {
    backgroundColor: '#7C3AED', borderRadius: 16, padding: 16, gap: 12,
  },
  resumoTop: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  resumoIcon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
  },
  resumoLabel: { fontSize: 12, color: '#E9D5FF' },
  resumoNum: { fontSize: 28, fontWeight: 'bold', color: '#fff' },
  resumoLifetime: { fontSize: 11, color: '#E9D5FF', marginTop: 2 },

  melhorContainer: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(0,0,0,0.15)',
    padding: 10, borderRadius: 10,
  },
  melhorIcon: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center', justifyContent: 'center',
  },
  melhorLabel: { fontSize: 10, color: '#E9D5FF', textTransform: 'uppercase', letterSpacing: 0.5 },
  melhorValor: { fontSize: 13, color: '#fff', fontWeight: '600', textTransform: 'capitalize', marginTop: 1 },

  filtros: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1, borderColor: '#E5E7EB',
    height: 34,
  },
  filtroBtnActivo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filtroTexto: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  filtroTextoActivo: { color: '#fff' },

  vazio: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 32, alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  vazioTitulo: { fontSize: 15, fontWeight: '600', color: '#374151', marginTop: 8 },
  vazioSub: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 16 },

  loadingContainer: {
    backgroundColor: '#fff', borderRadius: 14,
    padding: 32, alignItems: 'center', gap: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  loadingTexto: { fontSize: 13, color: '#6B7280' },

  areaCard: {
    backgroundColor: '#fff', borderRadius: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  areaHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    padding: 14, backgroundColor: '#F9FAFB',
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  areaIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  areaNome: { fontSize: 14, fontWeight: '700', color: '#111827' },
  areaPontos: { fontSize: 12, color: '#6B7280', marginTop: 1 },

  dificuldadesContainer: { padding: 10, gap: 10 },
  dificuldadeRow: {
    padding: 12, gap: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    borderLeftWidth: 3,
  },
  dificuldadeHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  dificuldadeBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 8,
  },
  dificuldadeBadgeTexto: { fontSize: 11, fontWeight: '700' },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 8,
  },
  tierTexto: { fontSize: 10, fontWeight: '700' },

  posicaoContainer: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  posicaoNum: { fontSize: 14, fontWeight: '700', color: '#111827' },
  variacaoRow: { flexDirection: 'row', alignItems: 'center', gap: 3, marginTop: 2 },
  variacaoTexto: { fontSize: 11, fontWeight: '500' },

  dificuldadeStats: { flexDirection: 'row', justifyContent: 'space-around' },
  statBlock: { alignItems: 'center' },
  statValor: { fontSize: 14, fontWeight: '700', color: '#111827' },
  statLabel: { fontSize: 10, color: '#6B7280', marginTop: 1 },

  infoCard: {
    backgroundColor: '#EEF2FF', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#C7D2FE', gap: 8,
  },
  infoHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  infoTitulo: { fontSize: 13, fontWeight: '600', color: '#4F46E5' },
  infoTexto: { fontSize: 12, color: '#374151', lineHeight: 17 },
  multiplicadores: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 6,
    marginVertical: 4,
  },
  multiBadge: {
    paddingHorizontal: 10, paddingVertical: 4,
    backgroundColor: '#fff',
    borderRadius: 6,
  },
  multiTexto: { fontSize: 11, fontWeight: '700' },
});