import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useRankStore } from '@stores/rankStore';
import { usePerfilStore } from '@stores/perfilStore';
import { Dificuldade } from '@app-types/gamification';
import { getLeaderboard, LeaderboardData, LeaderboardUser } from '@services/ranking';
import { useInsigniasStore, INSIGNIAS } from '@stores/insigniasStore';

const DIFICULDADES: Record<Dificuldade, { label: string; cor: string; bg: string }> = {
  'fácil':   { label: 'Fácil',   cor: '#16A34A', bg: '#DCFCE7' },
  'médio':   { label: 'Médio',   cor: '#D97706', bg: '#FEF3C7' },
  'difícil': { label: 'Difícil', cor: '#DC2626', bg: '#FEE2E2' },
  'expert':  { label: 'Expert',  cor: '#7C3AED', bg: '#F5F3FF' },
};

export default function LeaderboardScreen() {
  const router = useRouter();
  const { area, dificuldade } = useLocalSearchParams<{ area: string; dificuldade: Dificuldade }>();
  const perfil = usePerfilStore(s => s.perfil);
  const entries = useRankStore(s => s.entries);

  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const insigniasConquistadas = useInsigniasStore(s => s.conquistadas);
  const insigniasDoUtilizador = insigniasConquistadas.map(c => c.id);
  const [tooltipInsignia, setTooltipInsignia] = useState<string | null>(null);

  useEffect(() => {
    if (!area || !dificuldade) return;

    const entry = entries.find(e => e.area === area && e.dificuldade === dificuldade);
    const pontos = entry?.pontosSemestre ?? 0;

    async function carregar() {
      setLoading(true);
      try {
        const result = await getLeaderboard(area, dificuldade, pontos, perfil.nome, perfil.foto, insigniasDoUtilizador);
        setData(result);
      } finally {
        setLoading(false);
      }
    }
    carregar();
  }, [area, dificuldade, entries, perfil.nome, perfil.foto, insigniasDoUtilizador.length]);

  useEffect(() => {
    if (!tooltipInsignia) return;
    const timer = setTimeout(() => setTooltipInsignia(null), 2000);
    return () => clearTimeout(timer);
  }, [tooltipInsignia]);

  if (!area || !dificuldade) {
    return (
      <View style={styles.container}>
        <Text style={{ padding: 20 }}>Parâmetros em falta</Text>
      </View>
    );
  }

  const dStyle = DIFICULDADES[dificuldade];

  return (
    <View style={styles.container}>
      <View style={[styles.header, { backgroundColor: dStyle.bg }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>{area}</Text>
          <View style={[styles.dificuldadeBadge, { backgroundColor: dStyle.cor }]}>
            <Text style={styles.dificuldadeTexto}>{dStyle.label}</Text>
          </View>
        </View>
      </View>

      {loading || !data ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={dStyle.cor} />
          <Text style={styles.loadingTexto}>A carregar leaderboard...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Estatísticas da matéria */}
          <View style={styles.estatsCard}>
            <View style={styles.estatItem}>
              <Text style={styles.estatNum}>{data.total.toLocaleString('pt-PT')}</Text>
              <Text style={styles.estatLabel}>Participantes</Text>
            </View>
            <View style={styles.estatDivider} />
            <View style={styles.estatItem}>
              <Text style={styles.estatNum}>{(data.pontosDistribuidos / 1000).toFixed(0)}k</Text>
              <Text style={styles.estatLabel}>Pontos totais</Text>
            </View>
            <View style={styles.estatDivider} />
            <View style={styles.estatItem}>
              <Text style={styles.estatNum}>{data.mediaParticipante}</Text>
              <Text style={styles.estatLabel}>Média</Text>
            </View>
          </View>

          {/* Pódio */}
          <View style={styles.podioContainer}>
            <Text style={styles.seccaoTitulo}>🏆 Pódio</Text>
            <View style={styles.podio}>
              {/* 2º lugar (esquerda) */}
              <PodioCard user={data.podio[1]} posicao={2} corDestaque="#9CA3AF" altura={130} tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia}/>
              {/* 1º lugar (centro, maior) */}
              <PodioCard
                user={data.podio[0]}
                posicao={1}
                corDestaque="#FBBF24"
                altura={160}
                primeiro
                tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia}
              />
              {/* 3º lugar (direita) */}
              <PodioCard user={data.podio[2]} posicao={3} corDestaque="#D97706" altura={110} tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia} />
            </View>
          </View>

          {/* Tua posição (se não estiver no top 3) */}
          {data.utilizadorActual.posicao > 3 && (
            <View style={styles.tuaPosicaoContainer}>
              <Text style={styles.seccaoTitulo}>Tu</Text>
              <UserCard user={data.utilizadorActual} destacado tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia} />
            </View>
          )}

          {/* Lista completa */}
          <View style={styles.listaContainer}>
            <Text style={styles.seccaoTitulo}>Classificação completa</Text>
            {data.lista.map(user => (
              <UserCard key={user.userId} user={user} tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia} />
            ))}

            {data.utilizadorActual.posicao > data.lista.length + 3 && (
              <View style={styles.separador}>
                <View style={styles.separadorLinha} />
                <Text style={styles.separadorTexto}>· · ·</Text>
                <View style={styles.separadorLinha} />
              </View>
            )}

            {data.utilizadorActual.posicao > data.lista.length + 3 && (
              <UserCard user={data.utilizadorActual} destacado tooltipInsignia={tooltipInsignia}
                setTooltipInsignia={setTooltipInsignia}/>
            )}
          </View>

          {/* Nota sobre actualização */}
          <View style={styles.notaCard}>
            <Ionicons name="time-outline" size={14} color="#6B7280" />
            <Text style={styles.notaTexto}>
              O ranking actualiza a cada hora. Compete contra estudantes do mundo inteiro.
            </Text>
          </View>
        </ScrollView>
      )}
    </View>
  );
}

// ─── PODIO CARD ──────────────────────────────────────────────

function PodioCard({
  user, posicao, corDestaque, altura, primeiro,
  tooltipInsignia, setTooltipInsignia,
}: {
  user: LeaderboardUser;
  posicao: number;
  corDestaque: string;
  altura: number;
  primeiro?: boolean;
  tooltipInsignia: string | null;
  setTooltipInsignia: (v: string | null) => void;
}) {
  const icons: Record<number, string> = { 1: 'trophy', 2: 'medal', 3: 'medal' };

  return (
    <View style={styles.podioColuna}>
      <View style={styles.podioAvatarContainer}>
        <View style={[
          styles.podioAvatar,
          primeiro && styles.podioAvatarPrimeiro,
          user.isUtilizadorActual && { borderColor: '#4F46E5', borderWidth: 3 },
        ]}>
          {user.foto ? (
            <Image source={{ uri: user.foto }} style={styles.podioFoto} />
          ) : (
            <View style={[styles.podioFotoFallback, { backgroundColor: user.corAvatar }]}>
              <Text style={styles.podioIniciais}>{user.iniciais}</Text>
            </View>
          )}
        </View>
        <View style={[styles.podioCoroa, { backgroundColor: corDestaque }]}>
          <Ionicons name={icons[posicao] as any} size={primeiro ? 16 : 13} color="#fff" />
        </View>
      </View>

      <Text style={styles.podioNome} numberOfLines={1}>
        {user.isUtilizadorActual ? 'Tu' : user.nome.split(' ')[0]}
      </Text>
        {user.insigniasDestaque.length > 0 && (
        <View style={styles.podioInsignias}>
            {user.insigniasDestaque.slice(0, 3).map(id => (
            <InsigniaMini
                key={id}
                id={id}
                onPress={() => setTooltipInsignia(`${user.userId}-${id}`)}
                mostrarTooltip={tooltipInsignia === `${user.userId}-${id}`}
            />
            ))}
        </View>
)}
<Text style={[styles.podioPontos, { color: corDestaque }]}>
  {user.pontos.toLocaleString('pt-PT')}
</Text>

      <View style={[styles.podioBase, { height: altura, backgroundColor: corDestaque }]}>
        <Text style={styles.podioPosicao}>{posicao}º</Text>
      </View>
    </View>
  );
}

// ─── USER CARD ───────────────────────────────────────────────

function UserCard({ user, destacado, tooltipInsignia, setTooltipInsignia,}: { user: LeaderboardUser; destacado?: boolean; tooltipInsignia: string | null;
  setTooltipInsignia: (v: string | null) => void; }) {
  return (
    <View style={[styles.userCard, destacado && styles.userCardDestacado]}>
      <Text style={[styles.userPosicao, destacado && styles.userPosicaoDestacado]}>
        {user.posicao}
      </Text>

      <View style={styles.userAvatarContainer}>
        {user.foto ? (
          <Image source={{ uri: user.foto }} style={styles.userFoto} />
        ) : (
          <View style={[styles.userFotoFallback, { backgroundColor: user.corAvatar }]}>
            <Text style={styles.userIniciais}>{user.iniciais}</Text>
          </View>
        )}
      </View>

      <View style={styles.userInfo}>
        <View style={styles.userNomeRow}>
            <Text style={[styles.userNome, destacado && styles.userNomeDestacado]} numberOfLines={1}>
            {user.isUtilizadorActual ? `${user.nome} (Tu)` : user.nome}
            </Text>
            {user.insigniasDestaque.length > 0 && (
            <View style={styles.insigniasMiniContainer}>
                {user.insigniasDestaque.slice(0, 3).map(id => (
                <InsigniaMini
                    key={id}
                    id={id}
                    onPress={() => setTooltipInsignia(`${user.userId}-${id}`)}
                    mostrarTooltip={tooltipInsignia === `${user.userId}-${id}`}
                />
                ))}
            </View>
            )}
        </View>
        {user.variacao !== 'igual' && (
            <View style={styles.variacaoRow}>
            <Ionicons
                name={user.variacao === 'sobe' ? 'trending-up' : 'trending-down'}
                size={11}
                color={user.variacao === 'sobe' ? '#16A34A' : '#DC2626'}
            />
            <Text style={[
                styles.variacaoTexto,
                { color: user.variacao === 'sobe' ? '#16A34A' : '#DC2626' },
            ]}>
                {user.variacao === 'sobe' ? '+' : '-'}{user.variacaoValor}
            </Text>
            </View>
        )}
        </View>

      <View style={styles.userPontosContainer}>
        <Text style={[styles.userPontos, destacado && styles.userPontosDestacado]}>
          {user.pontos.toLocaleString('pt-PT')}
        </Text>
        <Text style={styles.userPontosLabel}>pts</Text>
      </View>
    </View>
  );
}

function InsigniaMini({
  id,
  onPress,
  mostrarTooltip,
}: {
  id: string;
  onPress: () => void;
  mostrarTooltip: boolean;
}) {
  const insignia = INSIGNIAS.find(i => i.id === id);
  if (!insignia) return null;
  return (
    <View>
      <TouchableOpacity
        style={[styles.insigniaMini, { backgroundColor: insignia.bgCor }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <Ionicons name={insignia.icone as any} size={9} color={insignia.cor} />
      </TouchableOpacity>
      {mostrarTooltip && (
        <View style={[styles.tooltip, { backgroundColor: insignia.cor }]}>
          <Text style={styles.tooltipTexto}>{insignia.nome}</Text>
          <View style={[styles.tooltipSeta, { borderTopColor: insignia.cor }]} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    paddingTop: 56, paddingHorizontal: 16, paddingBottom: 16,
    borderBottomWidth: 1, borderBottomColor: '#E5E7EB',
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  dificuldadeBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999, marginTop: 4,
  },
  dificuldadeTexto: { fontSize: 11, fontWeight: '700', color: '#fff' },

  loadingContainer: {
    flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12,
  },
  loadingTexto: { fontSize: 13, color: '#6B7280' },

  scroll: { padding: 16, gap: 16, paddingBottom: 32 },

  estatsCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, paddingHorizontal: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  estatItem: { flex: 1, alignItems: 'center' },
  estatDivider: { width: 1, height: 32, backgroundColor: '#E5E7EB' },
  estatNum: { fontSize: 18, fontWeight: 'bold', color: '#111827' },
  estatLabel: { fontSize: 11, color: '#6B7280', marginTop: 2 },

  seccaoTitulo: {
    fontSize: 13, fontWeight: '700', color: '#374151',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 10,
  },

  podioContainer: { gap: 4 },
  podio: {
    flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center',
    gap: 8, paddingTop: 24,
  },
  podioColuna: { alignItems: 'center', flex: 1 },
  podioAvatarContainer: { position: 'relative', marginBottom: 6 },
  podioAvatar: {
    width: 56, height: 56, borderRadius: 28,
    overflow: 'hidden', backgroundColor: '#fff',
    borderWidth: 2, borderColor: '#fff',
  },
  podioAvatarPrimeiro: { width: 72, height: 72, borderRadius: 36 },
  podioFoto: { width: '100%', height: '100%' },
  podioFotoFallback: {
    width: '100%', height: '100%',
    alignItems: 'center', justifyContent: 'center',
  },
  podioIniciais: { color: '#fff', fontSize: 16, fontWeight: '700' },
  podioCoroa: {
    position: 'absolute', top: -10, left: '50%',
    width: 24, height: 24, borderRadius: 12,
    marginLeft: -12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  podioNome: { fontSize: 12, fontWeight: '600', color: '#111827' },
  podioPontos: { fontSize: 13, fontWeight: '700', marginTop: 2, marginBottom: 8 },
  podioBase: {
    width: '100%', alignItems: 'center', justifyContent: 'flex-start',
    paddingTop: 12,
    borderTopLeftRadius: 12, borderTopRightRadius: 12,
  },
  podioPosicao: {
    fontSize: 28, fontWeight: 'bold', color: '#fff',
  },

  tuaPosicaoContainer: { gap: 4 },

  listaContainer: { gap: 6 },
  userCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  userCardDestacado: {
    backgroundColor: '#EEF2FF',
    borderColor: '#4F46E5',
    borderWidth: 2,
  },
  userPosicao: {
    width: 30, fontSize: 13, fontWeight: '700',
    color: '#6B7280', textAlign: 'center',
  },
  userPosicaoDestacado: { color: '#4F46E5' },
  userAvatarContainer: { width: 38, height: 38 },
  userFoto: { width: 38, height: 38, borderRadius: 19 },
  userFotoFallback: {
    width: 38, height: 38, borderRadius: 19,
    alignItems: 'center', justifyContent: 'center',
  },
  userIniciais: { color: '#fff', fontSize: 13, fontWeight: '700' },
  userInfo: { flex: 1, gap: 2 },
  userNome: { fontSize: 14, fontWeight: '500', color: '#111827' },
  userNomeDestacado: { fontWeight: '700', color: '#4F46E5' },
  variacaoRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  variacaoTexto: { fontSize: 11, fontWeight: '500' },
  userPontosContainer: { alignItems: 'flex-end' },
  userPontos: { fontSize: 14, fontWeight: '700', color: '#111827' },
  userPontosDestacado: { color: '#4F46E5' },
  userPontosLabel: { fontSize: 10, color: '#9CA3AF', marginTop: 1 },

  separador: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingVertical: 6,
  },
  separadorLinha: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  separadorTexto: { fontSize: 12, color: '#9CA3AF', letterSpacing: 4 },

  notaCard: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#F3F4F6', borderRadius: 10, padding: 10,
  },
  notaTexto: { flex: 1, fontSize: 11, color: '#6B7280', lineHeight: 16 },
  userNomeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    },
    insigniasMiniContainer: {
    flexDirection: 'row', gap: 3,
    },
    insigniaMini: {
        width: 16, height: 16, borderRadius: 4,
        alignItems: 'center', justifyContent: 'center',
    },
    podioInsignias: {
        flexDirection: 'row', gap: 3,
        marginBottom: 6,
    },
    tooltip: {
        position: 'absolute',
        bottom: 22,
        left: '50%',
        marginLeft: -50,
        width: 100,
        paddingHorizontal: 8,
        paddingVertical: 5,
        borderRadius: 6,
        alignItems: 'center',
        zIndex: 100,
    },
    tooltipTexto: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '700',
        textAlign: 'center',
    },
    tooltipSeta: {
        position: 'absolute',
        bottom: -5,
        left: 45,
        width: 0,
        height: 0,
        borderLeftWidth: 5,
        borderRightWidth: 5,
        borderTopWidth: 5,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        },
});