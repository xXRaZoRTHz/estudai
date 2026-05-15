import { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useInsigniasStore, INSIGNIAS } from '@stores/insigniasStore';
import { usePerfilStore } from '@stores/perfilStore';
import { CategoriaInsignia } from '@app-types/gamification';

const CATEGORIAS: { id: CategoriaInsignia | 'todas'; label: string }[] = [
  { id: 'todas', label: 'Todas' },
  { id: 'progresso', label: 'Progresso' },
  { id: 'desempenho', label: 'Desempenho' },
  { id: 'rara', label: 'Raras' },
];

const MAX_DESTAQUE = 6;

export default function InsigniasScreen() {
  const router = useRouter();
  const conquistadas = useInsigniasStore(s => s.conquistadas);
  const perfil = usePerfilStore(s => s.perfil);
  const setInsigniasDestaque = usePerfilStore(s => s.setInsigniasDestaque);

  const [categoria, setCategoria] = useState<CategoriaInsignia | 'todas'>('todas');
  const [modoEdicao, setModoEdicao] = useState(false);
  const [destaqueLocal, setDestaqueLocal] = useState<string[]>(perfil.insigniasDestaque);

  function jaTem(id: string) {
    return conquistadas.some(c => c.id === id);
  }

  function toggleDestaque(id: string) {
    if (!jaTem(id)) {
      Alert.alert('Bloqueada', 'Só podes destacar insígnias já conquistadas.');
      return;
    }

    setDestaqueLocal(prev => {
      if (prev.includes(id)) {
        return prev.filter(x => x !== id);
      }
      if (prev.length >= MAX_DESTAQUE) {
        Alert.alert('Limite atingido', `Só podes destacar ${MAX_DESTAQUE} insígnias no perfil.`);
        return prev;
      }
      return [...prev, id];
    });
  }

  function guardarDestaque() {
    setInsigniasDestaque(destaqueLocal);
    setModoEdicao(false);
  }

  function cancelarEdicao() {
    setDestaqueLocal(perfil.insigniasDestaque);
    setModoEdicao(false);
  }

  const insigniasFiltradas = categoria === 'todas'
    ? INSIGNIAS
    : INSIGNIAS.filter(i => i.categoria === categoria);

  const numConquistadas = conquistadas.length;
  const numTotais = INSIGNIAS.length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Insígnias</Text>
          <Text style={styles.subtitulo}>{numConquistadas}/{numTotais} conquistadas</Text>
        </View>
        {modoEdicao ? (
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity onPress={cancelarEdicao} style={styles.acaoBtn}>
              <Ionicons name="close" size={18} color="#6B7280" />
            </TouchableOpacity>
            <TouchableOpacity onPress={guardarDestaque} style={styles.acaoBtnPrimario}>
              <Ionicons name="checkmark" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity onPress={() => setModoEdicao(true)} style={styles.acaoBtn}>
            <Ionicons name="star-outline" size={18} color="#4F46E5" />
          </TouchableOpacity>
        )}
      </View>

      {/* Banner do modo edição */}
      {modoEdicao && (
        <View style={styles.banner}>
          <Ionicons name="information-circle" size={16} color="#4F46E5" />
          <Text style={styles.bannerTexto}>
            Selecciona até {MAX_DESTAQUE} insígnias para destacares no perfil ({destaqueLocal.length}/{MAX_DESTAQUE})
          </Text>
        </View>
      )}

      {/* Filtros */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtros}
      >
        {CATEGORIAS.map(c => (
          <TouchableOpacity
            key={c.id}
            style={[styles.filtroBtn, categoria === c.id && styles.filtroBtnActivo]}
            onPress={() => setCategoria(c.id)}
          >
            <Text style={[styles.filtroTexto, categoria === c.id && styles.filtroTextoActivo]}>
              {c.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.grid}>
          {insigniasFiltradas.map(i => {
            const tem = jaTem(i.id);
            const destacada = destaqueLocal.includes(i.id);
            return (
              <TouchableOpacity
                key={i.id}
                style={[
                  styles.card,
                  !tem && styles.cardBloqueada,
                  destacada && modoEdicao && styles.cardDestacada,
                ]}
                onPress={() => modoEdicao ? toggleDestaque(i.id) : null}
                activeOpacity={modoEdicao ? 0.7 : 1}
              >
                <View style={[
                  styles.cardIcon,
                  { backgroundColor: tem ? i.bgCor : '#F3F4F6' },
                ]}>
                  <Ionicons
                    name={tem ? (i.icone as any) : 'lock-closed'}
                    size={24}
                    color={tem ? i.cor : '#9CA3AF'}
                  />
                </View>
                <Text style={[styles.cardNome, !tem && styles.cardNomeBloqueada]} numberOfLines={1}>
                  {i.nome}
                </Text>
                <Text style={styles.cardDescricao} numberOfLines={2}>
                  {i.descricao}
                </Text>

                {destacada && modoEdicao && (
                  <View style={styles.destacadaBadge}>
                    <Ionicons name="star" size={10} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
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
  acaoBtn: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  acaoBtnPrimario: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },

  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 16, paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#C7D2FE',
  },
  bannerTexto: { flex: 1, fontSize: 12, color: '#4F46E5', lineHeight: 16 },

  filtros: {
    flexDirection: 'row', gap: 8,
    paddingHorizontal: 16, paddingVertical: 12,
  },
  filtroBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 999,
    borderWidth: 1, borderColor: '#E5E7EB',
    height: 36,
  },
  filtroBtnActivo: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  filtroTexto: { fontSize: 13, color: '#6B7280', fontWeight: '500' },
  filtroTextoActivo: { color: '#fff' },

  scroll: { padding: 16, paddingBottom: 24 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  card: {
    width: '48%', backgroundColor: '#fff',
    padding: 12, borderRadius: 14,
    alignItems: 'center', gap: 6,
    borderWidth: 1, borderColor: '#E5E7EB',
    position: 'relative',
  },
  cardBloqueada: { opacity: 0.55 },
  cardDestacada: { borderColor: '#4F46E5', borderWidth: 2 },
  cardIcon: {
    width: 56, height: 56, borderRadius: 16,
    alignItems: 'center', justifyContent: 'center',
    marginTop: 4,
  },
  cardNome: { fontSize: 13, fontWeight: '700', color: '#111827', textAlign: 'center' },
  cardNomeBloqueada: { color: '#6B7280' },
  cardDescricao: {
    fontSize: 11, color: '#6B7280',
    textAlign: 'center', lineHeight: 14,
    paddingHorizontal: 4, paddingBottom: 4,
  },
  destacadaBadge: {
    position: 'absolute', top: 8, right: 8,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
});