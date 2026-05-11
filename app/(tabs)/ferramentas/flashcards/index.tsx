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
import { useFlashcardsStore } from '@stores/flashcardsStore';

export default function ListaBaralhosScreen() {
  const router = useRouter();
  const baralhos = useFlashcardsStore(s => s.baralhos);
  const apagarBaralho = useFlashcardsStore(s => s.apagarBaralho);

  useEffect(() => {
    if (baralhos.length === 0) {
      router.replace('/(tabs)/ferramentas/flashcards/novo');
    }
  }, []);

  function handleApagar(id: string, titulo: string) {
    Alert.alert('Apagar baralho?', `"${titulo}" será removido com todos os cards.`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar', style: 'destructive', onPress: () => apagarBaralho(id) },
    ]);
  }

  function contarCardsHoje(b: any) {
    return b.cards.filter((c: any) => c.proximaRevisao <= Date.now()).length;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.titulo}>Flashcards</Text>
          <Text style={styles.subtitulo}>{baralhos.length} baralho{baralhos.length !== 1 ? 's' : ''}</Text>
        </View>
      </View>

      <View style={styles.novoContainer}>
        <TouchableOpacity
          style={styles.novoBtn}
          onPress={() => router.push('/(tabs)/ferramentas/flashcards/novo')}
        >
          <View style={styles.novoIcon}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
          <Text style={styles.novoTexto}>Novo baralho</Text>
          <Ionicons name="albums-outline" size={18} color="#92520A" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.lista} showsVerticalScrollIndicator={false}>
        {baralhos.length > 0 && <Text style={styles.listaTitulo}>Os teus baralhos</Text>}

        {baralhos.map(b => {
          const paraRever = contarCardsHoje(b);
          return (
            <TouchableOpacity
              key={b.id}
              style={styles.card}
              onPress={() => router.push(`/(tabs)/ferramentas/flashcards/${b.id}`)}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={b.origem === 'ia' ? 'sparkles-outline' : 'albums-outline'}
                  size={20}
                  color="#92520A"
                />
              </View>
              <View style={styles.cardTexto}>
                <Text style={styles.cardTitulo} numberOfLines={1}>{b.titulo}</Text>
                <Text style={styles.cardSub}>
                  {b.cards.length} cards
                  {paraRever > 0 && ` · ${paraRever} para rever`}
                </Text>
              </View>
              {paraRever > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeTexto}>{paraRever}</Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => handleApagar(b.id, b.titulo)}
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
  titulo: { fontSize: 17, fontWeight: 'bold', color: '#111827' },
  subtitulo: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  novoContainer: { padding: 16, paddingBottom: 8 },
  novoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14,
    borderWidth: 1.5, borderColor: '#92520A',
  },
  novoIcon: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: '#92520A',
    alignItems: 'center', justifyContent: 'center',
  },
  novoTexto: { flex: 1, fontSize: 15, fontWeight: '600', color: '#92520A' },
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
    backgroundColor: '#FEF3C7',
    alignItems: 'center', justifyContent: 'center',
  },
  cardTexto: { flex: 1, gap: 2 },
  cardTitulo: { fontSize: 14, fontWeight: '600', color: '#111827' },
  cardSub: { fontSize: 12, color: '#6B7280' },
  badge: {
    backgroundColor: '#FEF3C7',
    borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  badgeTexto: { fontSize: 12, fontWeight: '700', color: '#92520A' },
  apagarBtn: {
    width: 32, height: 32, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
});