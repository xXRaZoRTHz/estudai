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
import { useCronogramaStore } from '@stores/cronogramaStore';

export default function ListaCronogramasScreen() {
  const router = useRouter();
  const cronogramas = useCronogramaStore(s => s.cronogramas);
  const apagarCronograma = useCronogramaStore(s => s.apagarCronograma);
  const apagarTodos = useCronogramaStore(s => s.apagarTodos);

  useEffect(() => {
    if (cronogramas.length === 0) {
      router.replace('/(tabs)/ferramentas/cronograma/onboarding');
    }
  }, []);

  function handleApagar(id: string, titulo: string) {
    Alert.alert('Apagar plano?', `"${titulo}" será removido.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarCronograma(id) },
    ]);
  }

  function handleApagarTodos() {
    Alert.alert('Apagar todos os planos?', 'Esta acção não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar tudo', style: 'destructive', onPress: apagarTodos },
    ]);
  }

  function formatarData(timestamp: number) {
    const diff = Date.now() - timestamp;
    const dias = Math.floor(diff / 86400000);
    if (dias < 1) return 'Hoje';
    if (dias === 1) return 'Ontem';
    if (dias < 7) return `Há ${dias} dias`;
    return new Date(timestamp).toLocaleDateString('pt-PT');
  }

  function getProgresso(c: any) {
    const total = c.sessoes.length;
    const conc = c.sessoes.filter((s: any) => s.concluida).length;
    return total > 0 ? Math.round((conc / total) * 100) : 0;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Cronograma</Text>
          <Text style={styles.subtitulo}>{cronogramas.length} plano{cronogramas.length !== 1 ? 's' : ''}</Text>
        </View>
        {cronogramas.length > 0 && (
          <TouchableOpacity onPress={handleApagarTodos} style={styles.acaoBtn}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.novoContainer}>
        <TouchableOpacity
          style={styles.novoBtn}
          onPress={() => router.push('/(tabs)/ferramentas/cronograma/onboarding')}
        >
          <View style={styles.novoIcon}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <Text style={styles.novoTexto}>Criar novo plano</Text>
          <Ionicons name="calendar-outline" size={18} color="#991B1B" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {cronogramas.length > 0 && <Text style={styles.listaTitulo}>Os teus planos</Text>}

        {cronogramas.map(c => {
          const prog = getProgresso(c);
          return (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              onPress={() => router.push(`/(tabs)/ferramentas/cronograma/${c.id}`)}
            >
              <View style={styles.cardIcon}>
                <Ionicons name="calendar" size={20} color="#991B1B" />
              </View>
              <View style={styles.cardTexto}>
                <Text style={styles.cardTitulo} numberOfLines={1}>{c.titulo}</Text>
                <Text style={styles.cardSub}>
                  {formatarData(c.criadoEm)} · {prog}% concluído
                </Text>
                <View style={styles.cardBarra}>
                  <View style={[styles.cardBarraFill, { width: `${prog}%` }]} />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => handleApagar(c.id, c.titulo)}
                style={styles.apagarBtn}
              >
                <Ionicons name="trash-outline" size={16} color="#9CA3AF" />
              </TouchableOpacity>
            </TouchableOpacity>
          );
        })}
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
    borderWidth: 1.5, borderColor: '#991B1B',
  },
  novoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#991B1B',
    alignItems: 'center', justifyContent: 'center',
  },
  novoTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#991B1B' },
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
    width: 42, height: 42, borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTexto: { flex: 1, gap: 4 },
  cardTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280' },
  cardBarra: {
    height: 4, backgroundColor: '#F3F4F6',
    borderRadius: 2, overflow: 'hidden', marginTop: 4,
  },
  cardBarraFill: { height: '100%', backgroundColor: '#991B1B', borderRadius: 2 },
  apagarBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});