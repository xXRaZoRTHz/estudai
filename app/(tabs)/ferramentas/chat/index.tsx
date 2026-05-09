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
import { useChatStore } from '@stores/chatStore';

export default function ListaConversasScreen() {
  const router = useRouter();
  const conversas = useChatStore(s => s.conversas);
  const apagarConversa = useChatStore(s => s.apagarConversa);
  const apagarTodas = useChatStore(s => s.apagarTodas);

  // Se não há conversas, vai directamente para uma nova
  useEffect(() => {
    if (conversas.length === 0) {
      router.replace('/(tabs)/ferramentas/chat/nova');
    }
  }, []);

  function handleApagar(id: string, titulo: string) {
    Alert.alert(
      'Apagar conversa?',
      `"${titulo}" será removida permanentemente.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar', style: 'destructive', onPress: () => apagarConversa(id) },
      ]
    );
  }

  function handleApagarTodas() {
    Alert.alert(
      'Apagar todas as conversas?',
      'Esta acção não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Apagar tudo', style: 'destructive', onPress: apagarTodas },
      ]
    );
  }

  function formatarData(timestamp: number) {
    const agora = Date.now();
    const diff = agora - timestamp;
    const minutos = Math.floor(diff / 60000);
    const horas = Math.floor(diff / 3600000);
    const dias = Math.floor(diff / 86400000);

    if (minutos < 1) return 'Agora';
    if (minutos < 60) return `Há ${minutos} min`;
    if (horas < 24) return `Há ${horas}h`;
    if (dias < 7) return `Há ${dias} dia${dias > 1 ? 's' : ''}`;
    return new Date(timestamp).toLocaleDateString('pt-PT');
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Pergunte qualquer coisa</Text>
          <Text style={styles.subtitulo}>{conversas.length} conversa{conversas.length !== 1 ? 's' : ''}</Text>
        </View>
        {conversas.length > 0 && (
          <TouchableOpacity onPress={handleApagarTodas} style={styles.acaoBtn}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        )}
      </View>

      {/* Botão nova pergunta */}
      <View style={styles.novaContainer}>
        <TouchableOpacity
          style={styles.novaBtn}
          onPress={() => router.push('/(tabs)/ferramentas/chat/nova')}
        >
          <View style={styles.novaIcon}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <Text style={styles.novaTexto}>Nova pergunta</Text>
          <Ionicons name="sparkles" size={18} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {/* Lista de conversas */}
      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {conversas.length > 0 && (
          <Text style={styles.listaTitulo}>Histórico</Text>
        )}

        {conversas.map(c => (
          <TouchableOpacity
            key={c.id}
            style={styles.conversaCard}
            onPress={() => router.push(`/(tabs)/ferramentas/chat/${c.id}`)}
          >
            <View style={styles.conversaIcon}>
              <Ionicons name="chatbubble-outline" size={18} color="#4F46E5" />
            </View>
            <View style={styles.conversaTexto}>
              <Text style={styles.conversaTitulo} numberOfLines={2}>{c.titulo}</Text>
              <Text style={styles.conversaData}>
                {formatarData(c.actualizadaEm)} · {c.mensagens.length} mensagens
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => handleApagar(c.id, c.titulo)}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
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
  novaContainer: { padding: 16, paddingBottom: 8 },
  novaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#4F46E5',
  },
  novaIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#4F46E5',
    alignItems: 'center', justifyContent: 'center',
  },
  novaTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#4F46E5' },
  lista: { paddingHorizontal: 16, paddingBottom: 24, gap: 8 },
  listaTitulo: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
  },
  conversaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  conversaIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: '#EEF2FF',
    alignItems: 'center', justifyContent: 'center',
  },
  conversaTexto: { flex: 1, gap: 2 },
  conversaTitulo: { fontSize: 14, fontWeight: '500', color: '#111827', lineHeight: 18 },
  conversaData: { fontSize: 11, color: '#9CA3AF' },
  apagarBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});