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
import { useEffect } from 'react';
import { useResolucoesStore } from '@stores/resolucoesStore';

export default function ListaResolucoesScreen() {
  const router = useRouter();
  const resolucoes = useResolucoesStore(s => s.resolucoes);
  const apagarResolucao = useResolucoesStore(s => s.apagarResolucao);
  const apagarTodas = useResolucoesStore(s => s.apagarTodas);

  useEffect(() => {
    if (resolucoes.length === 0) {
      router.replace('/(tabs)/ferramentas/resolver/novo');
    }
  }, []);

  function handleApagar(id: string, titulo: string) {
    Alert.alert('Apagar resolução?', `"${titulo}" será removida.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarResolucao(id) },
    ]);
  }

  function handleApagarTodas() {
    Alert.alert('Apagar todas?', 'Esta acção não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar tudo', style: 'destructive', onPress: apagarTodas },
    ]);
  }

  function formatarData(timestamp: number) {
    const diff = Date.now() - timestamp;
    const min = Math.floor(diff / 60000);
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (min < 1) return 'Agora';
    if (min < 60) return `Há ${min} min`;
    if (h < 24) return `Há ${h}h`;
    if (d < 7) return `Há ${d} dia${d > 1 ? 's' : ''}`;
    return new Date(timestamp).toLocaleDateString('pt-PT');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Resolver questões</Text>
          <Text style={styles.subtitulo}>{resolucoes.length} resolução{resolucoes.length !== 1 ? 'es' : ''}</Text>
        </View>
        {resolucoes.length > 0 && (
          <TouchableOpacity onPress={handleApagarTodas} style={styles.acaoBtn}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.novoContainer}>
        <TouchableOpacity
          style={styles.novoBtn}
          onPress={() => router.push('/(tabs)/ferramentas/resolver/novo')}
        >
          <View style={styles.novoIcon}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <Text style={styles.novoTexto}>Resolver nova questão</Text>
          <Ionicons name="checkmark-done-outline" size={18} color="#534AB7" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {resolucoes.length > 0 && <Text style={styles.listaTitulo}>Histórico</Text>}

        {resolucoes.map(r => (
          <TouchableOpacity
            key={r.id}
            style={styles.card}
            onPress={() => router.push(`/(tabs)/ferramentas/resolver/${r.id}`)}
          >
            <View style={styles.cardIcon}>
              <Ionicons
                name={r.fonte === 'camera' ? 'camera-outline' : 'text-outline'}
                size={18}
                color="#534AB7"
              />
            </View>
            <View style={styles.cardTexto}>
              <Text style={styles.cardTitulo} numberOfLines={2}>{r.titulo}</Text>
              <Text style={styles.cardData}>
                {formatarData(r.criadoEm)} · {r.passos.length} passos
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleApagar(r.id, r.titulo)}
              style={styles.apagarBtn}
            >
              <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
  },
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  novoContainer: { padding: 16, paddingBottom: 8 },
  novoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#534AB7',
  },
  novoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#534AB7',
    alignItems: 'center', justifyContent: 'center',
  },
  novoTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#534AB7' },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  listaTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 8, marginBottom: 4,
  },
  card: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  cardIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEEDFE',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTexto: { flex: 1, gap: 2 },
  cardTitulo: { fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 18 },
  cardData: { fontSize: 11, color: '#9CA3AF' },
  apagarBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});