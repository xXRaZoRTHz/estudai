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
import { useResumosStore } from '@stores/resumosStore';

export default function ListaResumosScreen() {
  const router = useRouter();
  const resumos = useResumosStore(s => s.resumos);
  const apagarResumo = useResumosStore(s => s.apagarResumo);
  const apagarTodos = useResumosStore(s => s.apagarTodos);

  useEffect(() => {
    if (resumos.length === 0) {
      router.replace('/(tabs)/ferramentas/resumir/novo');
    }
  }, []);

  function handleApagar(id: string, titulo: string) {
    Alert.alert(
      'Apagar resumo?',
      `"${titulo}" será removido permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => apagarResumo(id) },
      ]
    );
  }

  function handleApagarTodos() {
    Alert.alert(
      'Apagar todos os resumos?',
      'Esta acção não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar tudo', style: 'destructive', onPress: apagarTodos },
      ]
    );
  }

  function formatarData(timestamp: number) {
    const diff = Date.now() - timestamp;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `Há ${minutos} min`;
    if (horas < 24) return `Há ${horas}h`;
    if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    return new Date(timestamp).toLocaleDateString('pt-PT');
  }

  function getIconeFonte(fonte: string) {
    if (fonte === 'ficheiro') return 'document-outline';
    if (fonte === 'camera') return 'camera-outline';
    return 'text-outline';
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Resumir</Text>
          <Text style={styles.subtitulo}>{resumos.length} resumo{resumos.length !== 1 ? 's' : ''}</Text>
        </View>
        {resumos.length > 0 && (
          <TouchableOpacity onPress={handleApagarTodos} style={styles.acaoBtn}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Botão novo resumo */}
      <View style={styles.novoContainer}>
        <TouchableOpacity
          style={styles.novoBtn}
          onPress={() => router.push('/(tabs)/ferramentas/resumir/novo')}
        >
          <View style={styles.novoIcon}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <Text style={styles.novoTexto}>Novo resumo</Text>
          <Ionicons name="sparkles" size={18} color="#0F6E56" />
        </TouchableOpacity>
      </View>

      {/* Lista */}
      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {resumos.length > 0 && (
          <Text style={styles.listaTitulo}>Histórico</Text>
        )}

        {resumos.map(r => (
          <TouchableOpacity
            key={r.id}
            style={styles.resumoCard}
            onPress={() => router.push(`/(tabs)/ferramentas/resumir/${r.id}`)}
          >
            <View style={styles.resumoIcon}>
              <Ionicons name={getIconeFonte(r.fonte) as any} size={18} color="#0F6E56" />
            </View>
            <View style={styles.resumoTexto}>
              <Text style={styles.resumoTitulo} numberOfLines={2}>{r.titulo}</Text>
              <Text style={styles.resumoData}>{formatarData(r.criadoEm)}</Text>
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
    borderWidth: 1.5, borderColor: '#0F6E56',
  },
  novoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#0F6E56',
    alignItems: 'center', justifyContent: 'center',
  },
  novoTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#0F6E56' },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  listaTitulo: {
    fontSize: 12, fontWeight: '600', color: '#9CA3AF',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginTop: 8, marginBottom: 4,
  },
  resumoCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  resumoIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#E1F5EE',
    alignItems: 'center', justifyContent: 'center',
  },
  resumoTexto: { flex: 1, gap: 2 },
  resumoTitulo: { fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 18 },
  resumoData: { fontSize: 11, color: '#9CA3AF' },
  apagarBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});